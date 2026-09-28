'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Home,
  Banknote,
  Clock,
  X as XIcon,
  Bell,
  Users,
  Mail,
  ShieldCheck,
  Check,
  Minus,
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
  Toggle,
  toast,
} from '@/components/ds';
import {
  useTick,
  useWorldReady,
  useWorldFailed,
  loadWorld,
  getSettingInt,
  getSettingBool,
  getSettingStr,
  saveSettings,
  getAdmins,
  inviteAdmin,
  getMyMfaVerified,
  getSessionUserId,
} from '@/lib/data/store';
import {
  changedSettings,
  pctToBps,
  validateSettings,
  type Settings as SettingsMap,
} from '@/lib/settingsRules';
import {
  NOTIF_CHANNELS,
  mutedTypes,
  notifKey,
  readMatrix,
  type PrefMatrix,
} from '@/lib/notifPrefs';
import { NOTIF_TYPES, useNotifState } from '@/lib/data/notifications';

type SectionId =
  'general' | 'commission' | 'sla' | 'cancel' | 'notifications' | 'team';

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'general', label: 'General', icon: Home },
  { id: 'commission', label: 'Comisiones y precios', icon: Banknote },
  { id: 'sla', label: 'Tiempos y SLA', icon: Clock },
  { id: 'cancel', label: 'Cancelaciones', icon: XIcon },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'team', label: 'Equipo y permisos', icon: Users },
];

// Comisión por método de pago → key de platform_settings (en bps).
const METHODS = [
  { key: 'card', label: 'Tarjeta', note: 'Visa / Mastercard' },
  { key: 'oxxo', label: 'OXXO Pay', note: 'Comisión OXXO + IVA' },
  { key: 'wallet', label: 'Monedero', note: 'Saldo en cuenta' },
  { key: 'cash', label: 'Efectivo', note: 'Sin comisión adicional' },
] as const;

const TYPE_KEYS = NOTIF_TYPES.map(t => t.type);

/** Lee todo el formulario desde platform_settings. */
function readForm(): SettingsMap {
  const m = readMatrix(TYPE_KEYS, getSettingBool);
  return {
    platform_name: getSettingStr('platform_name', 'Tumantenimiento'),
    support_email: getSettingStr('support_email', 'soporte@tumantenimiento.mx'),
    support_phone: getSettingStr('support_phone', '+52 33 0000 0000'),
    base_city: getSettingStr('base_city', 'Guadalajara, ZMG'),
    rfc: getSettingStr('rfc', ''),
    maintenance_mode: getSettingBool('maintenance_mode', false),
    signups_enabled: getSettingBool('signups_enabled', true),
    commission_bps: getSettingInt('commission_bps', 1500),
    fee_card_bps: getSettingInt('fee_card_bps', 350),
    fee_oxxo_bps: getSettingInt('fee_oxxo_bps', 380),
    fee_wallet_bps: getSettingInt('fee_wallet_bps', 150),
    fee_cash_bps: getSettingInt('fee_cash_bps', 0),
    intro_program_enabled: getSettingBool('intro_program_enabled', true),
    intro_commission_bps: getSettingInt('intro_commission_bps', 1000),
    intro_program_days: getSettingInt('intro_program_days', 90),
    request_ttl_minutes: getSettingInt('request_ttl_minutes', 30),
    sla_first_response_minutes: getSettingInt('sla_first_response_minutes', 15),
    sla_dispute_hours: getSettingInt('sla_dispute_hours', 4),
    auto_reassign_enabled: getSettingBool('auto_reassign_enabled', true),
    cancel_free_window_hours: getSettingInt('cancel_free_window_hours', 4),
    cancel_penalty_bps: getSettingInt('cancel_penalty_bps', 1500),
    cancel_auto_charge: getSettingBool('cancel_auto_charge', true),
    tech_max_cancellations_30d: getSettingInt('tech_max_cancellations_30d', 3),
    noshow_wait_minutes: getSettingInt('noshow_wait_minutes', 20),
    quiet_hours_enabled: getSettingBool('quiet_hours_enabled', false),
    quiet_start_hours: getSettingInt('quiet_start_hours', 22),
    quiet_end_hours: getSettingInt('quiet_end_hours', 7),
    ...m,
  };
}

const LABELS: Record<string, string> = {
  platform_name: 'Nombre comercial',
  support_email: 'Correo de soporte',
  support_phone: 'Teléfono de soporte',
  base_city: 'Ciudad base',
  rfc: 'RFC',
  commission_bps: 'Comisión global',
  request_ttl_minutes: 'Ventana de aceptación',
};

export default function ConfigPage() {
  useTick();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const [active, setActive] = useState<SectionId>('general');
  const [form, setForm] = useState<SettingsMap>({});
  const [baseline, setBaseline] = useState<SettingsMap>({});
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const setMuted = useNotifState(s => s.setMuted);

  // Solo se edita con el snapshot listo: si no, se mostrarían (y guardarían)
  // los defaults del código como si fueran los valores reales.
  useEffect(() => {
    if (!ready) return;
    const f = readForm();
    setForm(f);
    setBaseline(f);
    setMuted(mutedTypes(TYPE_KEYS, f as PrefMatrix));
  }, [ready, setMuted]);

  const changes = useMemo(
    () => changedSettings(form, baseline),
    [form, baseline],
  );
  const dirty = Object.keys(changes).length;

  const set = (key: string, value: string | number | boolean) =>
    setForm(f => ({ ...f, [key]: value }));
  const num = (key: string) => form[key] as number;
  const bool = (key: string) => form[key] as boolean;
  const str = (key: string) => (form[key] as string) ?? '';

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
    setMuted(mutedTypes(TYPE_KEYS, form as PrefMatrix));
    toast.success('Configuración guardada', `${dirty} cambio(s) aplicados`);
  }

  function discard() {
    setForm(baseline);
    setErrs({});
  }

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
  const textField = (key: string, label: string, desc?: string) => (
    <Row label={label} desc={desc} error={errs[key]}>
      <Input
        value={str(key)}
        onChange={e => set(key, e.target.value)}
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
        description="Reglas globales de la plataforma. Los cambios aplican a solicitudes nuevas."
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
          {active === 'general' && (
            <>
              <Section title="Datos de la plataforma">
                {textField(
                  'platform_name',
                  'Nombre comercial',
                  'Aparece en recibos y notificaciones.',
                )}
                {textField(
                  'support_email',
                  'Correo de soporte',
                  'Destino de respuestas de clientes y técnicos.',
                )}
                {textField('support_phone', 'Teléfono de soporte')}
                {textField('rfc', 'RFC', 'Para facturación CFDI.')}
                {textField('base_city', 'Ciudad base')}
              </Section>
              <Section title="Estado del servicio">
                {toggleField(
                  'maintenance_mode',
                  'Modo mantenimiento',
                  'Suspende temporalmente las solicitudes nuevas en toda la plataforma.',
                )}
                {toggleField(
                  'signups_enabled',
                  'Aceptar nuevos registros',
                  'Permite que clientes y técnicos creen cuentas.',
                )}
              </Section>
            </>
          )}

          {active === 'commission' && (
            <>
              <Section title="Comisión de la plataforma">
                {pctField(
                  'commission_bps',
                  'Comisión global',
                  'Aplica a categorías sin comisión específica (se edita en Catálogo).',
                )}
              </Section>
              <Section title="Comisión por método de pago">
                {METHODS.map(m => (
                  <div key={m.key}>
                    {pctField(`fee_${m.key}_bps`, m.label, m.note)}
                  </div>
                ))}
              </Section>
              <Section title="Programa de comisión reducida">
                {toggleField(
                  'intro_program_enabled',
                  'Programa activo',
                  'Comisión menor para técnicos nuevos durante su primer periodo.',
                )}
                {bool('intro_program_enabled') && (
                  <>
                    {pctField('intro_commission_bps', 'Comisión del programa')}
                    {intField('intro_program_days', 'Duración', 'días')}
                  </>
                )}
              </Section>
            </>
          )}

          {active === 'sla' && (
            <Section title="Tiempos y SLA">
              {intField(
                'request_ttl_minutes',
                'Ventana de aceptación',
                'min',
                'Tiempo que una solicitud espera técnico antes de expirar.',
              )}
              {intField(
                'sla_first_response_minutes',
                'Primera respuesta de soporte',
                'min',
              )}
              {intField('sla_dispute_hours', 'Resolución de disputas', 'h')}
              {toggleField(
                'auto_reassign_enabled',
                'Reasignación automática',
                'Si el técnico no llega a tiempo, se ofrece la orden a otro.',
              )}
            </Section>
          )}

          {active === 'cancel' && (
            <Section title="Cancelaciones y penalizaciones">
              {intField(
                'cancel_free_window_hours',
                'Ventana sin costo',
                'h',
                'Antes de la cita el cliente cancela sin cargo.',
              )}
              {pctField(
                'cancel_penalty_bps',
                'Penalización',
                'Porcentaje de la visita que se cobra fuera de la ventana.',
              )}
              {toggleField(
                'cancel_auto_charge',
                'Cobro automático de penalización',
              )}
              {intField(
                'tech_max_cancellations_30d',
                'Máximo de cancelaciones del técnico',
                'en 30 días',
              )}
              {intField('noshow_wait_minutes', 'Espera por no-show', 'min')}
            </Section>
          )}

          {active === 'notifications' && (
            <NotificationsSection form={form} set={set} errs={errs} />
          )}

          {active === 'team' && <TeamSection />}
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
  if (key.endsWith('_bps') && typeof v === 'number') return `${v / 100}%`;
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

// ── Notificaciones ───────────────────────────────────────────────────────────
function NotificationsSection({
  form,
  set,
  errs,
}: {
  form: SettingsMap;
  set: (key: string, v: string | number | boolean) => void;
  errs: Record<string, string>;
}) {
  const muted = mutedTypes(TYPE_KEYS, form as PrefMatrix);
  const hours = Array.from({ length: 24 }, (_, h) => h);
  return (
    <>
      <Card className="overflow-hidden">
        <div className="border-b border-divider px-5 py-4">
          <div className="font-display text-[16px] font-bold text-navy">
            Tipos y canales
          </div>
          <p className="mt-0.5 font-sans text-[12.5px] text-muted">
            Un tipo con todos los canales apagados deja de aparecer en la
            campana de la consola.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="bg-panel">
                <th className="px-5 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                  Tipo
                </th>
                {NOTIF_CHANNELS.map(c => (
                  <th
                    key={c.key}
                    className="px-3 py-2.5 text-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIF_TYPES.map(t => (
                <tr key={t.type} className="border-t border-divider">
                  <td className="px-5 py-3 font-sans text-[14px] font-semibold text-navy">
                    {t.label}
                    {muted.includes(t.type) && (
                      <Badge tone="neutral" className="ml-2">
                        Silenciado
                      </Badge>
                    )}
                  </td>
                  {NOTIF_CHANNELS.map(c => {
                    const k = notifKey(t.type, c.key);
                    return (
                      <td key={c.key} className="px-3 py-3">
                        <div className="flex justify-center">
                          <Toggle
                            checked={form[k] === true}
                            onChange={v => set(k, v)}
                            label={
                              <span className="sr-only">
                                {t.label} por {c.label}
                              </span>
                            }
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-divider px-5 py-3 font-sans text-[12px] text-muted">
          Push, correo y SMS a administradores se envían cuando el backend tenga
          notificaciones de admin; hoy estas preferencias ya filtran la campana
          y el sonido de la consola.
        </p>
      </Card>

      <Section title="No molestar">
        <Row
          label="Horario silencioso"
          desc="Sin sonido ni push fuera del horario laboral."
        >
          <div className="flex justify-end">
            <Toggle
              checked={form.quiet_hours_enabled === true}
              onChange={v => set('quiet_hours_enabled', v)}
            />
          </div>
        </Row>
        {form.quiet_hours_enabled === true && (
          <Row
            label="De / hasta"
            desc="Puede cruzar la medianoche (p. ej. 22:00 a 07:00)."
            error={errs.quiet_start_hours ?? errs.quiet_end_hours}
          >
            <div className="flex items-center gap-2">
              {(['quiet_start_hours', 'quiet_end_hours'] as const).map(
                (k, i) => (
                  <select
                    key={k}
                    value={String(form[k])}
                    onChange={e => set(k, Number(e.target.value))}
                    aria-label={i ? 'Hasta' : 'Desde'}
                    className="h-10 flex-1 rounded-btn border border-line bg-card px-3 font-mono text-[13px] text-navy outline-none focus:border-primary focus:shadow-focus"
                  >
                    {hours.map(h => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                ),
              )}
            </div>
          </Row>
        )}
      </Section>
    </>
  );
}

// ── Equipo y permisos ────────────────────────────────────────────────────────
const MODULES = [
  'Dashboard',
  'Clientes y técnicos',
  'Servicios',
  'Finanzas y reembolsos',
  'Soporte y disputas',
  'Catálogo',
  'Configuración',
];

function TeamSection() {
  useTick();
  const admins = getAdmins();
  const [me, setMe] = useState<string | null>(null);
  const [myMfa, setMyMfa] = useState<boolean | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    void getSessionUserId().then(setMe);
    void getMyMfaVerified().then(setMyMfa);
  }, []);

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
          <Button icon={Mail} onClick={() => setInviteOpen(true)}>
            Invitar
          </Button>
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
                <Badge tone="navy">Admin</Badge>
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
            Hoy existe un solo rol de consola (admin) con acceso total. Los
            roles granulares se habilitarán cuando el backend los soporte.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="bg-panel">
                {['Módulo', 'Ver', 'Editar'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted ${
                      i ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(m => (
                <tr key={m} className="border-t border-divider">
                  <td className="px-5 py-3 font-sans text-[13.5px] text-navy">
                    {m}
                  </td>
                  {[0, 1].map(i => (
                    <td key={i} className="px-5 py-3 text-center">
                      <Check
                        size={16}
                        className="inline text-success"
                        aria-label="Permitido"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-divider">
                <td className="px-5 py-3 font-sans text-[13.5px] text-muted">
                  Soporte (solo lectura)
                </td>
                {[0, 1].map(i => (
                  <td key={i} className="px-5 py-3 text-center">
                    <Minus
                      size={16}
                      className="inline text-faint"
                      aria-label="No disponible"
                    />
                  </td>
                ))}
              </tr>
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
  const [sending, setSending] = useState(false);
  const invalid = !/^\S+@\S+\.\S+$/.test(email.trim());

  async function send() {
    if (invalid || sending) return;
    setSending(true);
    const ok = await inviteAdmin(email.trim(), name.trim());
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
        <Kicker>Se invita con rol admin</Kicker>
      </div>
    </Modal>
  );
}
