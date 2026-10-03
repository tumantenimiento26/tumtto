'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Building2,
  Wrench,
  Clock,
  Users,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Check,
  Minus,
  Siren,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  ErrorPage,
  Input,
  Kicker,
  Modal,
  PageHeader,
  ScreenSkeleton,
  Segmented,
  Select,
  Toggle,
  toast,
} from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { ADMIN_ROLES, PERMISSIONS, type AdminRole } from '@/lib/rbac';
import {
  useTick,
  useWorldReady,
  useWorldFailed,
  loadWorld,
  getSettingInt,
  getSettingBool,
  getSettingList,
  getEmergencyConfig,
  saveSettings,
  fetchAdminRoles,
  getAdmins,
  inviteAdmin,
  setAdminRole,
  getMyMfaVerified,
  getSessionUserId,
} from '@/lib/data/store';
import { useAction } from '@/components/use-action';
import { EMERGENCY_KEYS, type SurchargeMode } from '@/lib/emergency';
import { ALERT_MINUTES_DEFAULT, ALERT_MINUTES_KEY, SCHEDULE_SURCHARGE_KEYS } from '@/lib/unassigned';
import { CompaniesSection } from './_components/CompaniesSection';
import { ToolCatalogSection } from './_components/ToolCatalogSection';
import {
  changedSettings,
  pctToBps,
  validateSettings,
  type Settings as SettingsMap,
} from '@/lib/settingsRules';

type SectionId = 'commission' | 'ops' | 'emergency' | 'security' | 'team' | 'companies' | 'tools';

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'commission', label: 'Comisiones y precios', icon: Banknote },
  { id: 'ops', label: 'Operación', icon: Clock },
  { id: 'emergency', label: 'Emergencias', icon: Siren },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck },
  { id: 'team', label: 'Equipo y permisos', icon: Users },
  { id: 'companies', label: 'Empresas de técnicos', icon: Building2 },
  { id: 'tools', label: 'Catálogo de herramientas', icon: Wrench },
];

// Métodos que las apps muestran (platform_settings.enabled_payment_methods).
const METHODS = [
  { key: 'card', label: 'Tarjeta', note: 'Stripe · Visa / Mastercard' },
  { key: 'oxxo', label: 'OXXO Pay', note: 'Stripe · referencia' },
  { key: 'wallet', label: 'Monedero', note: 'Saldo en cuenta' },
  { key: 'cash', label: 'Efectivo', note: 'El técnico cobra y adeuda la comisión' },
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
    [ALERT_MINUTES_KEY]: getSettingInt(ALERT_MINUTES_KEY, ALERT_MINUTES_DEFAULT),
    [SCHEDULE_SURCHARGE_KEYS.bps]: getSettingInt(SCHEDULE_SURCHARGE_KEYS.bps, 0),
    [SCHEDULE_SURCHARGE_KEYS.startHour]: getSettingInt(SCHEDULE_SURCHARGE_KEYS.startHour, 20),
    [SCHEDULE_SURCHARGE_KEYS.endHour]: getSettingInt(SCHEDULE_SURCHARGE_KEYS.endHour, 8),
    [SCHEDULE_SURCHARGE_KEYS.weekends]: getSettingBool(SCHEDULE_SURCHARGE_KEYS.weekends, true),
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
  schedule_surcharge_bps: 'Recargo por horario (%)',
  schedule_surcharge_start_hour: 'Recargo por horario: desde',
  schedule_surcharge_end_hour: 'Recargo por horario: hasta',
  schedule_surcharge_weekends: 'Recargo por horario en fin de semana',
};

export default function ConfigPage() {
  useTick();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const canFinance = useAuth().can('finanzas');
  const [active, setActive] = useState<SectionId>('commission');
  // /config?tab=equipo (p. ej. desde la invitación).
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('tab') ?? '';
    const alias: Record<string, SectionId> = {
      equipo: 'team',
      comisiones: 'commission',
      seguridad: 'security',
      emergencias: 'emergency',
      empresas: 'companies',
      herramientas: 'tools',
    };
    const t = alias[raw] ?? raw;
    if (SECTIONS.some(x => x.id === t)) setActive(t as SectionId);
  }, []);
  const [form, setForm] = useState<SettingsMap>({});
  const [baseline, setBaseline] = useState<SettingsMap>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
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

  if (!canFinance)
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
              <Section title="Comisión de la plataforma">
                {pctField(
                  'commission_bps',
                  'Comisión global',
                  'Se congela en cada orden nueva; las categorías pueden tener la suya (Catálogo).',
                )}
              </Section>
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
                {intField(
                  'default_match_radius_m',
                  'Radio de búsqueda',
                  'm',
                  'Radio por defecto para encontrar técnicos cercanos (si el técnico no define el suyo).',
                )}
                {intField(
                  'unassigned_alert_minutes',
                  'Alerta de solicitud sin técnico',
                  'min',
                  'Las solicitudes que Tumtto debe asignar y llevan más de este tiempo sin técnico avisan en Panel y Notificaciones.',
                )}
              </Section>
              <Section title="Recargo por horario">
                {pctField(
                  'schedule_surcharge_bps',
                  'Recargo',
                  'Porcentaje extra cuando la fecha deseada cae en la franja. 0% = sin recargo. Se congela en cada solicitud.',
                )}
                {intField(
                  'schedule_surcharge_start_hour',
                  'Franja desde',
                  'h (0–23)',
                  'Hora de inicio (hora de Guadalajara). Ej. 20 = 8:00 pm.',
                )}
                {intField(
                  'schedule_surcharge_end_hour',
                  'Franja hasta',
                  'h (0–23)',
                  'Hora de fin. Si es menor que la de inicio la franja cruza la medianoche (20 → 8).',
                )}
                {toggleField(
                  'schedule_surcharge_weekends',
                  'Aplicar en fines de semana',
                  'Sábado y domingo llevan el recargo todo el día.',
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

          {active === 'emergency' && (
            <>
              <Section title="Búsqueda de técnico">
                {intField(
                  'emergency_initial_radius_m',
                  'Radio inicial',
                  'm',
                  'Primera ronda: se avisa a los técnicos elegibles dentro de este radio.',
                )}
                {intField(
                  'emergency_radius_step_m',
                  'Incremento por ronda',
                  'm',
                  'Cuánto se amplía el radio en cada ronda sin respuesta.',
                )}
                {intField(
                  'emergency_max_radius_m',
                  'Radio máximo',
                  'm',
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

          {active === 'team' && <TeamSection />}
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

// ── Equipo y permisos ────────────────────────────────────────────────────────
const ROLE_OPTS = ADMIN_ROLES.map(r => ({ value: r.value, label: r.label, hint: r.desc }));
const roleLabel = (r: AdminRole) => ADMIN_ROLES.find(x => x.value === r)?.label ?? r;

function TeamSection() {
  useTick();
  const admins = getAdmins();
  const { adminRole, can } = useAuth();
  const canUsers = can('usuarios');
  const { busy, run } = useAction();
  const [me, setMe] = useState<string | null>(null);
  const [myMfa, setMyMfa] = useState<boolean | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  // Rol actual de cada admin (app_metadata) vía admin_list_admin_roles.
  const [roles, setRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    void getSessionUserId().then(setMe);
    void getMyMfaVerified().then(setMyMfa);
    if (canUsers) void fetchAdminRoles().then(setRoles);
  }, [canUsers]);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-divider px-5 py-4">
          <div>
            <div className="font-display text-[16px] font-bold text-navy">
              Administradores
            </div>
            <p className="mt-0.5 font-sans text-[12.5px] text-muted">
              {admins.length} con acceso a la consola.
            </p>
          </div>
          {canUsers && (
            <Button icon={Mail} onClick={() => setInviteOpen(true)}>
              Invitar
            </Button>
          )}
        </div>
        <ul className="divide-y divide-divider">
          {admins.map(a => {
            const mine = a.id === me;
            return (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-action font-display text-[12px] font-bold text-white">
                  {(a.full_name ?? 'A')
                    .split(' ')
                    .slice(0, 2)
                    .map(w => w[0])
                    .join('')
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-sans text-[14px] font-semibold text-navy">
                    {a.full_name ?? 'Admin'}
                    {mine && <span className="ml-1.5 text-muted">(tú)</span>}
                  </div>
                  <div className="font-sans text-[12px] text-muted">
                    {a.status === 'active' ? 'Activo' : 'Suspendido'}
                  </div>
                </div>
                {mine ? (
                  <Badge tone="navy">{roleLabel(adminRole)}</Badge>
                ) : canUsers ? (
                  <div className="w-44">
                    <Select
                      options={ROLE_OPTS}
                      value={(roles[a.id] as AdminRole | undefined) ?? null}
                      placeholder="Asignar rol…"
                      disabled={busy === a.id}
                      aria-label={`Rol de ${a.full_name ?? 'admin'}`}
                      onChange={r =>
                        void run(a.id, async () => {
                          const ok = await setAdminRole(a.id, r);
                          if (ok) setRoles(s => ({ ...s, [a.id]: r }));
                          return ok;
                        }, `Rol actualizado · ${roleLabel(r)}`)
                      }
                    />
                  </div>
                ) : (
                  <Badge tone="navy">Admin</Badge>
                )}
                <span className="w-24 text-right font-sans text-[12px]">
                  {mine && myMfa != null ? (
                    myMfa ? (
                      <span className="font-semibold text-success">
                        MFA activo
                      </span>
                    ) : (
                      <span className="font-semibold text-warning-ink">
                        Sin MFA
                      </span>
                    )
                  ) : (
                    <span
                      className="text-faint"
                      title="Supabase solo expone el MFA de tu propia sesión"
                    >
                      MFA —
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-divider px-5 py-4">
          <div className="font-display text-[16px] font-bold text-navy">
            Matriz de permisos
          </div>
          <p className="mt-0.5 font-sans text-[12.5px] text-muted">
            Solo lectura: es el mismo mapa que aplica el backend
            (app.has_permission). Todo admin puede leer la consola.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="bg-panel">
                <th className="px-5 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                  Permiso
                </th>
                {ADMIN_ROLES.map(r => (
                  <th
                    key={r.value}
                    className="px-3 py-2.5 text-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted"
                  >
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]).map(k => (
                <tr key={k} className="border-t border-divider">
                  <td className="px-5 py-3">
                    <div className="font-sans text-[13.5px] font-semibold text-navy">
                      {PERMISSIONS[k].label}
                    </div>
                    <div className="font-sans text-[12px] text-muted">{PERMISSIONS[k].desc}</div>
                  </td>
                  {ADMIN_ROLES.map(r => (
                    <td key={r.value} className="px-3 py-3 text-center">
                      {PERMISSIONS[k].roles.includes(r.value) ? (
                        <Check size={16} className="inline text-success" aria-label="Permitido" />
                      ) : (
                        <Minus size={16} className="inline text-faint" aria-label="Sin permiso" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

function InviteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('soporte');
  const [sending, setSending] = useState(false);
  const invalid = !/^\S+@\S+\.\S+$/.test(email.trim());

  async function send() {
    if (invalid || sending) return;
    setSending(true);
    const ok = await inviteAdmin(email.trim(), name.trim(), role);
    setSending(false);
    if (ok === null) return; // el store ya mostró el error; el modal sigue
    toast.success('Invitación enviada', email.trim());
    setEmail('');
    setName('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!sending}
      title="Invitar administrador"
      description="Recibirá un correo para crear su contraseña y entrar a la consola."
      icon={Mail}
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button
            onClick={() => void send()}
            loading={sending}
            disabled={invalid}
          >
            Enviar invitación
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Correo"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nombre@tumantenimiento.mx"
          error={email && invalid ? 'Correo no válido.' : null}
        />
        <Input
          label="Nombre (opcional)"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre y apellido"
        />
        <div>
          <Kicker className="mb-1.5">Rol en la consola</Kicker>
          <Select options={ROLE_OPTS} value={role} onChange={setRole} aria-label="Rol" />
        </div>
      </div>
    </Modal>
  );
}
