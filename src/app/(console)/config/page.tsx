'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  Building2,
  Wrench,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Siren,
  Moon,
  Landmark,
  type LucideIcon,
} from 'lucide-react';
import {
  Button,
  Card,
  ErrorPage,
  Input,
  Modal,
  PageHeader,
  ScreenSkeleton,
  Segmented,
  Toggle,
  toast,
} from '@/components/ds';
import { useAuth } from '@/lib/auth';
import {
  useTick,
  useWorldReady,
  useWorldFailed,
  loadWorld,
  getSettingInt,
  getSettingBool,
  ONLINE_PAYMENTS_KEY,
  onlinePaymentsEnabled,
  getSettingList,
  getEmergencyConfig,
  saveSettings,
} from '@/lib/data/store';
import { EMERGENCY_KEYS, type SurchargeMode } from '@/lib/emergency';
import { ALERT_MINUTES_DEFAULT, ALERT_MINUTES_KEY } from '@/lib/unassigned';
import { ScheduleSurchargeSection } from './_components/ScheduleSurchargeSection';
import { CompaniesSection } from './_components/CompaniesSection';
import { ToolCatalogSection } from './_components/ToolCatalogSection';
import { TechnicianCommissionSection } from './_components/TechnicianCommissionSection';
import { TransferAccountSection } from './_components/TransferAccountSection';
import { ADMIN_OWNED_FLAG_KEY } from '@/lib/commission';
import {
  changedSettings,
  pctToBps,
  validateSettings,
  type Settings as SettingsMap,
} from '@/lib/settingsRules';

type SectionId =
  | 'commission'
  | 'transfers'
  | 'ops'
  | 'schedule'
  | 'emergency'
  | 'security'
  | 'companies'
  | 'tools';

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'commission', label: 'Comisiones y precios', icon: Banknote },
  { id: 'transfers', label: 'Cuentas para transferencias', icon: Landmark },
  { id: 'ops', label: 'Operación', icon: Clock },
  { id: 'schedule', label: 'Recargos por horario', icon: Moon },
  { id: 'emergency', label: 'Emergencias', icon: Siren },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck },
  { id: 'companies', label: 'Empresas de técnicos', icon: Building2 },
  { id: 'tools', label: 'Catálogo de herramientas', icon: Wrench },
];

// Métodos que las apps muestran (platform_settings.enabled_payment_methods).
const METHODS = [
  { key: 'card', label: 'Tarjeta', note: 'Stripe · Visa / Mastercard' },
  { key: 'oxxo', label: 'OXXO Pay', note: 'Stripe · referencia' },
  { key: 'wallet', label: 'Monedero', note: 'Saldo en cuenta' },
  { key: 'cash', label: 'Efectivo', note: 'El técnico cobra; con dinero de Tu Mantenimiento lo entrega y gana su comisión' },
] as const;

/**
 * Solo las keys que el backend lee (app.get_setting_int / is_admin / apps):
 * las demás pantallas de ajustes de antes guardaban valores sin efecto.
 */
function readForm(): SettingsMap {
  const em = getEmergencyConfig();
  return {
    commission_bps: getSettingInt('commission_bps', 1500),
    stripe_fee_estimate_bps: getSettingInt('stripe_fee_estimate_bps', 360),
    stripe_fee_estimate_fixed_cents: getSettingInt('stripe_fee_estimate_fixed_cents', 300),
    request_ttl_minutes: getSettingInt('request_ttl_minutes', 30),
    default_match_radius_m: getSettingInt('default_match_radius_m', 15000),
    account_deletion_grace_days: getSettingInt('account_deletion_grace_days', 30),
    enabled_payment_methods: getSettingList('enabled_payment_methods', ['card', 'oxxo', 'wallet', 'cash']),
    admin_require_aal2: getSettingBool('admin_require_aal2', false),
    [ONLINE_PAYMENTS_KEY]: onlinePaymentsEnabled(),
    // TUM-01: seed del backend = true (los servicios nuevos son de Tu Mantenimiento).
    [ADMIN_OWNED_FLAG_KEY]: getSettingBool(ADMIN_OWNED_FLAG_KEY, true),
    [ALERT_MINUTES_KEY]: getSettingInt(ALERT_MINUTES_KEY, ALERT_MINUTES_DEFAULT),
    [EMERGENCY_KEYS.initialRadiusM]: em.initialRadiusM,
    [EMERGENCY_KEYS.stepM]: em.stepM,
    [EMERGENCY_KEYS.maxRadiusM]: em.maxRadiusM,
    [EMERGENCY_KEYS.roundSeconds]: em.roundSeconds,
    [EMERGENCY_KEYS.timeoutMinutes]: em.timeoutMinutes,
    [EMERGENCY_KEYS.surchargeMode]: em.surchargeMode,
    [EMERGENCY_KEYS.surchargeBps]: em.surchargeBps,
    [EMERGENCY_KEYS.surchargeFixedCents]: em.surchargeFixedCents,
  };
}

const LABELS: Record<string, string> = {
  commission_bps: 'Comisión global',
  [ONLINE_PAYMENTS_KEY]: 'Pagos en línea (Stripe)',
  payment_model_admin_owned_enabled: 'Dinero de Tu Mantenimiento',
  emergency_initial_radius_m: 'Radio inicial de emergencia',
  emergency_radius_step_m: 'Incremento de radio',
  emergency_max_radius_m: 'Radio máximo de emergencia',
  emergency_round_seconds: 'Segundos por ronda',
  emergency_timeout_minutes: 'Tiempo límite de emergencia',
  emergency_surcharge_mode: 'Modo de recargo de emergencia',
  emergency_surcharge_bps: 'Recargo de emergencia (%)',
  emergency_surcharge_fixed_cents: 'Recargo de emergencia (fijo)',
  stripe_fee_estimate_bps: 'Comisión Stripe (%)',
  stripe_fee_estimate_fixed_cents: 'Comisión Stripe (fija)',
  request_ttl_minutes: 'Ventana de aceptación',
  default_match_radius_m: 'Radio de búsqueda',
  account_deletion_grace_days: 'Gracia para baja de cuenta',
  enabled_payment_methods: 'Métodos de pago',
  admin_require_aal2: 'Exigir 2 pasos en la API',
  unassigned_alert_minutes: 'Alerta de solicitud sin técnico',
};

export default function ConfigPage() {
  useTick();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const router = useRouter();
  const canConfig = useAuth().canView('configuracion');
  const [active, setActive] = useState<SectionId>('commission');
  // /config?tab=equipo (p. ej. desde la invitación).
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('tab') ?? '';
    const alias: Record<string, SectionId> = {
      comisiones: 'commission',
      seguridad: 'security',
      emergencias: 'emergency',
      recargos: 'schedule',
      horario: 'schedule',
      empresas: 'companies',
      herramientas: 'tools',
      transferencias: 'transfers',
    };
    // El equipo vive en su propia página (/equipo).
    if (raw === 'equipo') {
      router.replace('/equipo');
      return;
    }
    const t = alias[raw] ?? raw;
    if (SECTIONS.some(x => x.id === t)) setActive(t as SectionId);
  }, [router]);
  const [form, setForm] = useState<SettingsMap>({});
  const [baseline, setBaseline] = useState<SettingsMap>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [radiusUnit, setRadiusUnit] = useState<'m' | 'km'>('km');
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Solo se edita con el snapshot listo: si no, se mostrarían (y guardarían)
  // los defaults del código como si fueran los valores reales.
  useEffect(() => {
    if (!ready) return;
    const f = readForm();
    setForm(f);
    setBaseline(f);
  }, [ready]);

  const changes = useMemo(
    () => changedSettings(form, baseline),
    [form, baseline],
  );
  const dirty = Object.keys(changes).length;

  const set = (key: string, value: string | number | boolean | string[]) =>
    setForm(f => ({ ...f, [key]: value }));
  const num = (key: string) => form[key] as number;
  const bool = (key: string) => form[key] as boolean;
  const methods = (form.enabled_payment_methods as string[] | undefined) ?? [];

  function requestSave() {
    const e = validateSettings(form);
    setErrs(e);
    if (Object.keys(e).length) {
      toast.error('Revisa los campos marcados', 'Hay valores fuera de rango.');
      return;
    }
    setConfirm(true);
  }

  async function persist() {
    if (!dirty) {
      setConfirm(false);
      return;
    }
    setSaving(true);
    const ok = await saveSettings(changes);
    setSaving(false);
    // Solo al confirmar la escritura se limpia "sin guardar"; si falla, el
    // modal y los cambios siguen para reintentar (el store ya mostró el error).
    if (!ok) return;
    setBaseline(form);
    setConfirm(false);
    toast.success('Configuración guardada', `${dirty} cambio(s) aplicados`);
  }

  function discard() {
    setForm(baseline);
    setErrs({});
  }

  if (!canConfig)
    return <ErrorPage kind="403" primary={{ label: 'Ir al panel', href: '/dashboard' }} />;
  if (failed)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready || !Object.keys(form).length)
    return <ScreenSkeleton kind="detail" />;

  const pctField = (key: string, label: string, desc?: string) => (
    <Row label={label} desc={desc} error={errs[key]}>
      <Input
        type="number"
        min={0}
        max={100}
        step="0.01"
        value={Number.isNaN(num(key)) ? '' : num(key) / 100}
        onChange={e =>
          set(
            key,
            e.target.value.trim() === ''
              ? NaN
              : pctToBps(Number(e.target.value)),
          )
        }
        suffix="%"
        error={!!errs[key]}
        aria-label={label}
      />
    </Row>
  );
  const intField = (
    key: string,
    label: string,
    suffix: string,
    desc?: string,
  ) => (
    <Row label={label} desc={desc} error={errs[key]}>
      <Input
        type="number"
        step="1"
        value={Number.isNaN(num(key)) ? '' : num(key)}
        onChange={e =>
          set(key, e.target.value.trim() === '' ? NaN : Number(e.target.value))
        }
        suffix={suffix}
        error={!!errs[key]}
        aria-label={label}
      />
    </Row>
  );
  // Radios: se guardan en metros; el admin elige verlos en m o km.
  const radiusField = (key: string, label: string, desc?: string) => {
    const m = num(key);
    const km = radiusUnit === 'km';
    return (
      <Row label={label} desc={desc} error={errs[key]}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step={km ? '0.1' : '1'}
            value={Number.isNaN(m) ? '' : km ? m / 1000 : m}
            onChange={e => {
              const raw = e.target.value.trim();
              set(key, raw === '' ? NaN : Math.round(Number(raw) * (km ? 1000 : 1)));
            }}
            error={!!errs[key]}
            aria-label={`${label} (${radiusUnit})`}
          />
          <Segmented
            size="sm"
            options={['m', 'km'] as const}
            value={radiusUnit}
            onChange={setRadiusUnit}
            aria-label="Unidad del radio"
          />
        </div>
      </Row>
    );
  };
  const toggleField = (key: string, label: string, desc?: string) => (
    <Row label={label} desc={desc}>
      <div className="flex justify-end">
        <Toggle checked={bool(key)} onChange={v => set(key, v)} />
      </div>
    </Row>
  );

  return (
    <div className="flex flex-col gap-6 pb-28">
      <PageHeader
        title="Configuración del sistema"
        description="Reglas globales que lee el backend (platform_settings). Los cambios aplican a solicitudes nuevas."
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav
          aria-label="Secciones de configuración"
          className="flex gap-1 overflow-x-auto lg:sticky lg:top-4 lg:flex-col"
        >
          {SECTIONS.map(s => {
            const on = s.id === active;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                aria-current={on ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-btn px-3.5 py-2.5 text-left font-sans text-[14px] transition-colors ${
                  on
                    ? 'border border-line bg-card font-semibold text-navy shadow-kpi'
                    : 'border border-transparent font-medium text-muted hover:bg-panel hover:text-navy'
                }`}
              >
                <Icon size={16} className={on ? 'text-navy' : 'text-muted'} />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div key={active} className="animate-up flex min-w-0 flex-col gap-4">
          {active === 'commission' && (
            <>
              <Section title="Modelo de ingresos">
                {toggleField(
                  ONLINE_PAYMENTS_KEY,
                  'Pagos en línea (Stripe)',
                  'Apagado: todo se cobra en efectivo, en persona (el técnico lo registra y el cliente confirma) y no hay retiros por Stripe. Encendido: tarjeta/transferencia como antes. Solo afecta solicitudes nuevas.',
                )}
                {toggleField(
                  ADMIN_OWNED_FLAG_KEY,
                  'Dinero de Tu Mantenimiento',
                  'Activo: en los servicios nuevos todo lo cobrado (visita y efectivo) es de Tu Mantenimiento y el técnico gana su comisión. Apagado: el técnico conserva el dinero y adeuda la comisión de plataforma (modelo anterior). Los servicios existentes no cambian.',
                )}
              </Section>
              <TechnicianCommissionSection />
              <Section title="Comisión de la plataforma">
                {pctField(
                  'commission_bps',
                  'Comisión global',
                  'Solo para servicios del modelo anterior (el técnico conserva el dinero). Se congela en cada orden nueva; las categorías pueden tener la suya (Catálogo).',
                )}
              </Section>
              {bool(ONLINE_PAYMENTS_KEY) && (
              <Section title="Costo estimado de Stripe">
                {pctField(
                  'stripe_fee_estimate_bps',
                  'Comisión Stripe (%)',
                  'Se usa para estimar el neto del técnico en cobros con tarjeta.',
                )}
                {intField(
                  'stripe_fee_estimate_fixed_cents',
                  'Comisión Stripe (fija)',
                  'centavos',
                  'Parte fija por transacción (p. ej. 300 = $3.00).',
                )}
              </Section>
              )}
            </>
          )}

          {active === 'ops' && (
            <>
              <Section title="Solicitudes">
                {intField(
                  'request_ttl_minutes',
                  'Ventana de aceptación',
                  'min',
                  'Tiempo que una solicitud espera técnico antes de expirar.',
                )}
                {radiusField(
                  'default_match_radius_m',
                  'Radio de búsqueda',
                  'Radio por defecto para encontrar técnicos cercanos (si el técnico no define el suyo).',
                )}
                {intField(
                  'unassigned_alert_minutes',
                  'Alerta de solicitud sin técnico',
                  'min',
                  'Las solicitudes que Tumtto debe asignar y llevan más de este tiempo sin técnico avisan en Panel y Notificaciones.',
                )}
              </Section>
              <Section title="Métodos de pago en las apps">
                {METHODS.map(m => (
                  <Row key={m.key} label={m.label} desc={m.note}>
                    <div className="flex justify-end">
                      <Toggle
                        checked={methods.includes(m.key)}
                        onChange={on =>
                          set(
                            'enabled_payment_methods',
                            on ? [...methods, m.key] : methods.filter(x => x !== m.key),
                          )
                        }
                        label={<span className="sr-only">{m.label}</span>}
                      />
                    </div>
                  </Row>
                ))}
                {errs.enabled_payment_methods && (
                  <p role="alert" className="px-5 py-3 font-sans text-[12px] text-error">
                    {errs.enabled_payment_methods}
                  </p>
                )}
              </Section>
              <Section title="Cuentas">
                {intField(
                  'account_deletion_grace_days',
                  'Gracia para baja de cuenta',
                  'días',
                  'Tiempo que el usuario puede cancelar su solicitud de borrado antes de que se ejecute.',
                )}
              </Section>
            </>
          )}

          {active === 'transfers' && <TransferAccountSection />}

          {active === 'schedule' && <ScheduleSurchargeSection />}

          {active === 'emergency' && (
            <>
              <Section title="Búsqueda de técnico">
                {radiusField(
                  'emergency_initial_radius_m',
                  'Radio inicial',
                  'Primera ronda: se avisa a los técnicos elegibles dentro de este radio.',
                )}
                {radiusField(
                  'emergency_radius_step_m',
                  'Incremento por ronda',
                  'Cuánto se amplía el radio en cada ronda sin respuesta.',
                )}
                {radiusField(
                  'emergency_max_radius_m',
                  'Radio máximo',
                  'La búsqueda no se amplía más allá de este radio.',
                )}
                {intField(
                  'emergency_round_seconds',
                  'Segundos por ronda',
                  's',
                  'Espera antes de ampliar el radio y avisar a más técnicos.',
                )}
                {intField(
                  'emergency_timeout_minutes',
                  'Tiempo límite',
                  'min',
                  'Si nadie acepta, la solicitud pasa a asignación manual y sigue activa.',
                )}
              </Section>
              <Section title="Recargo de emergencia">
                <Row
                  label="Tipo de recargo"
                  desc="Reemplaza al antiguo recargo urgente. Se congela en cada solicitud."
                >
                  <Segmented<SurchargeMode>
                    aria-label="Tipo de recargo"
                    options={[
                      { value: 'percent', label: 'Porcentaje' },
                      { value: 'fixed', label: 'Monto fijo' },
                    ]}
                    value={form.emergency_surcharge_mode === 'fixed' ? 'fixed' : 'percent'}
                    onChange={m => set('emergency_surcharge_mode', m)}
                  />
                </Row>
                {form.emergency_surcharge_mode === 'fixed' ? (
                  <Row
                    label="Monto fijo"
                    desc="Cargo extra por emergencia, en pesos."
                    error={errs.emergency_surcharge_fixed_cents}
                  >
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      prefix="$"
                      value={
                        Number.isNaN(num('emergency_surcharge_fixed_cents'))
                          ? ''
                          : num('emergency_surcharge_fixed_cents') / 100
                      }
                      onChange={e =>
                        set(
                          'emergency_surcharge_fixed_cents',
                          e.target.value.trim() === '' ? NaN : Math.round(Number(e.target.value) * 100),
                        )
                      }
                      suffix="MXN"
                      error={!!errs.emergency_surcharge_fixed_cents}
                      aria-label="Monto fijo del recargo"
                    />
                  </Row>
                ) : (
                  pctField(
                    'emergency_surcharge_bps',
                    'Porcentaje',
                    'Porcentaje extra sobre el total cuando la solicitud es una emergencia.',
                  )
                )}
              </Section>
            </>
          )}

          {active === 'security' && (
            <Section title="Verificación en dos pasos">
              {toggleField(
                'admin_require_aal2',
                'Exigir 2 pasos también en la API',
                'app.is_admin() deja de reconocer sesiones de admin sin TOTP verificado (aal2).',
              )}
              <div className="flex items-start gap-2.5 px-5 py-4 font-sans text-[12.5px] text-warning-ink">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <p>
                  La consola ya obliga a enrolar TOTP. Al activar esta opción, cualquier admin
                  que todavía no haya configurado su autenticador (o que use la API fuera de la
                  consola con una sesión aal1) perderá acceso a los datos hasta completarlo.
                  Actívala solo cuando todo el equipo tenga MFA.
                </p>
              </div>
            </Section>
          )}

          {active === 'companies' && <CompaniesSection />}
          {active === 'tools' && <ToolCatalogSection />}
        </div>
      </div>

      {/* Barra de cambios sin guardar */}
      {dirty > 0 && (
        <div className="pointer-events-none fixed inset-x-4 bottom-5 z-30 flex justify-center">
          <div className="anim-fade pointer-events-auto flex w-full max-w-[640px] items-center gap-4 rounded-box bg-tooltip px-5 py-3.5 text-white shadow-modal">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-warning" />
            <div className="min-w-0 flex-1">
              <div className="font-sans text-[14px] font-semibold">
                {dirty}{' '}
                {dirty === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}
              </div>
              <div className="truncate font-sans text-[12px] text-white/70">
                {Object.keys(changes)
                  .map(k => LABELS[k] ?? k)
                  .slice(0, 3)
                  .join(' · ')}
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={discard}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              Descartar
            </Button>
            <Button onClick={requestSave}>Guardar</Button>
          </div>
        </div>
      )}

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        dismissible={!saving}
        title="Guardar configuración"
        description="Estos cambios afectan la operación en producción desde la siguiente solicitud."
        icon={ShieldCheck}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirm(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={() => void persist()} loading={saving}>
              Confirmar y guardar
            </Button>
          </>
        }
      >
        <ul className="flex flex-col gap-1.5 font-sans text-[13px] text-body">
          {Object.keys(changes).map(k => (
            <li key={k} className="flex justify-between gap-3">
              <span className="text-muted">{LABELS[k] ?? k}</span>
              <span className="font-mono text-[12.5px] text-navy">
                {fmt(k, changes[k])}
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

function fmt(key: string, v: unknown) {
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  if (Array.isArray(v)) return v.join(', ') || '—';
  if (key.endsWith('_bps') && typeof v === 'number') return `${v / 100}%`;
  if (key.endsWith('_cents') && typeof v === 'number') return `$${(v / 100).toFixed(2)}`;
  return String(v);
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-divider px-5 py-4 font-display text-[16px] font-bold text-navy">
        {title}
      </div>
      <div className="divide-y divide-divider">{children}</div>
    </Card>
  );
}

function Row({
  label,
  desc,
  error,
  children,
}: {
  label: string;
  desc?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <div className="font-sans text-[14px] font-semibold text-navy">
          {label}
        </div>
        {desc && (
          <div className="mt-0.5 font-sans text-[12.5px] text-muted">
            {desc}
          </div>
        )}
      </div>
      <div>
        {children}
        {error && (
          <p role="alert" className="mt-1 font-sans text-[12px] text-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
