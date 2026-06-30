'use client';

import { useMemo, useState } from 'react';
import {
  Settings, Building2, Percent, Timer, Ban, Wallet, Bell, ShieldCheck,
  ListChecks, UsersRound, Hash, CreditCard, Store, Banknote, Tag, Rocket,
  Users, Info, ArrowRight, History, AlarmClock, UserX, HardHat, UserMinus,
  TrendingUp, AlertTriangle, FolderTree, ArrowDownToLine, Check, type LucideIcon,
} from 'lucide-react';
import { PageHeading, Panel } from '@/components/admin';
import { PrimaryButton, GhostButton, Input, Toggle, Badge } from '@/components/ui';
import { FadeIn, motion, AnimatePresence } from '@/components/motion';
import { useTick, getCategoriesWithCounts, getMetrics } from '@/lib/demo/store';

const peso = (n: number) => `$${n.toLocaleString('es-MX')}`;
const initials = (n: string) => n.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();

type SectionId =
  | 'general' | 'commission' | 'sla' | 'cancel'
  | 'notifications' | 'team';

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon; count?: number }[] = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'commission', label: 'Comisiones y precios', icon: Percent },
  { id: 'sla', label: 'Tiempos y SLA', icon: Timer },
  { id: 'cancel', label: 'Cancelaciones y penalizaciones', icon: Ban },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'team', label: 'Equipo y permisos', icon: UsersRound, count: 5 },
];

const AUDIT = [
  { author: 'Sofía Martínez', field: 'Comisión Plomería', from: '15%', to: '12%', time: 'Hoy · 14:18', role: 'Admin Soporte' },
  { author: 'Javier Olvera', field: 'SLA disputas', from: '8 h', to: '4 h', time: '18/05 · 09:42', role: 'Super Admin' },
  { author: 'Sofía Martínez', field: 'Comisión OXXO', from: '3.5%', to: '3.8%', time: '17/05 · 16:14', role: 'Admin Soporte' },
  { author: 'Javier Olvera', field: 'Ventana sin costo', from: '2 h', to: '4 h', time: '15/05 · 11:08', role: 'Super Admin' },
];

const TEAM = [
  { name: 'Javier Olvera', email: 'javier@tumtto.mx', role: 'Super Admin', super: true },
  { name: 'Sofía Martínez', email: 'sofia@tumtto.mx', role: 'Admin Soporte', super: false },
  { name: 'Diego Ramírez', email: 'diego@tumtto.mx', role: 'Operaciones', super: false },
  { name: 'Mariana López', email: 'mariana@tumtto.mx', role: 'Finanzas', super: false },
  { name: 'Andrés Cano', email: 'andres@tumtto.mx', role: 'Solo lectura', super: false },
];

// ---------- small building blocks ----------

function SectionHead({ icon: Icon, title, sub, dirty }: { icon: LucideIcon; title: string; sub: string; dirty: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-info-soft">
        <Icon size={20} className="text-cyan" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-xl font-bold tracking-tight text-navy">{title}</h2>
        <p className="mt-0.5 text-[13px] text-muted">{sub}</p>
      </div>
      {dirty > 0 && (
        <span className="inline-flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1.5 text-xs font-semibold text-warning">
          <span className="h-2 w-2 rounded-full bg-warning shadow-[0_0_0_4px] shadow-warning/20" />
          {dirty} {dirty === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}
        </span>
      )}
    </div>
  );
}

function ConfigCard({ title, sub, icon: Icon, headRight, children }: {
  title: string; sub?: string; icon: LucideIcon; headRight?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-info-soft">
          <Icon size={14} className="text-cyan" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-navy">{title}</div>
          {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
        </div>
        {headRight}
      </div>
      <div className="flex flex-col gap-3.5 p-5">{children}</div>
    </div>
  );
}

function Hint({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'success' }) {
  const Icon = tone === 'success' ? Users : Info;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5 text-xs text-muted">
      <Icon size={12} className={tone === 'success' ? 'text-success' : 'text-cyan'} />
      <span>{children}</span>
    </div>
  );
}

function ToggleRow({ title, sub, on, onChange }: { title: string; sub: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-canvas px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-navy">{title}</div>
        <div className="mt-0.5 text-[11.5px] text-muted">{sub}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function PercentField({ label, value, onChange, big = true }: { label: string; value: number; onChange: (v: number) => void; big?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-medium text-muted">{label}</label>
      <div className="inline-flex w-36 items-baseline gap-1 rounded-xl border border-line bg-surface px-3.5 py-2">
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-16 bg-transparent font-display font-bold tracking-tight text-navy outline-none ${big ? 'text-2xl' : 'text-base'}`}
        />
        <span className="font-display text-lg font-bold text-muted">%</span>
      </div>
    </div>
  );
}

function NumField({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-medium text-muted">{label}</label>
      <div className="inline-flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2">
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-14 bg-transparent font-display text-xl font-bold text-navy outline-none"
        />
        <span className="text-[13px] font-medium text-muted">{unit}</span>
      </div>
    </div>
  );
}

function AuditTrail() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
        <History size={15} className="text-cyan" />
        <span className="text-[13.5px] font-semibold text-navy">Últimos cambios en este módulo</span>
        <span className="font-mono text-[11px] text-faint">{AUDIT.length} eventos</span>
        <a href="#" className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-cyan">
          Ver bitácora completa <ArrowRight size={11} />
        </a>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-canvas">
            {['Autor', 'Campo', 'De', 'A', 'Cuándo'].map((h, i) => (
              <th key={h} className={`border-b border-line px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-faint ${i > 1 ? 'text-right' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AUDIT.map((a, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="border-b border-line last:border-0"
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className={`grid h-7 w-7 place-items-center rounded-full text-[10.5px] font-semibold ${a.role === 'Super Admin' ? 'bg-error/10 text-error' : 'bg-info-soft text-cyan'}`}>{initials(a.author)}</div>
                  <div>
                    <div className="text-[12.5px] font-medium text-navy">{a.author}</div>
                    <div className="text-[10.5px] text-faint">{a.role}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5 text-[12.5px] text-navy">{a.field}</td>
              <td className="px-4 py-2.5 text-right font-mono text-xs text-faint line-through">{a.from}</td>
              <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-cyan">{a.to}</td>
              <td className="px-4 py-2.5 text-right font-mono text-[11.5px] text-muted">{a.time}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- page ----------

export default function ConfigPage() {
  useTick();
  const cats = getCategoriesWithCounts();
  const metrics = getMetrics();

  const [active, setActive] = useState<SectionId>('commission');

  // ---- form state ----
  const [general, setGeneral] = useState({
    name: 'Tu Mantenimiento', email: 'soporte@tumtto.mx', phone: '33 1234 5678',
    city: 'Guadalajara, ZMG', maintenance: false, newSignups: true,
  });
  const [globalCommission, setGlobalCommission] = useState(15);
  const [methods, setMethods] = useState([
    { method: 'Tarjeta', icon: CreditCard, color: 'text-cyan', bg: 'bg-info-soft', pct: 3.5, note: 'Visa / Mastercard' },
    { method: 'OXXO Pay', icon: Store, color: 'text-warning', bg: 'bg-warning/15', pct: 3.8, note: 'Comisión OXXO + IVA' },
    { method: 'MP wallet', icon: Wallet, color: 'text-cyan', bg: 'bg-info-soft', pct: 1.5, note: 'Saldo en cuenta MP' },
    { method: 'Efectivo', icon: Banknote, color: 'text-success', bg: 'bg-success/15', pct: 0.0, note: 'Sin comisión adicional' },
  ]);
  const [program, setProgram] = useState({ on: true, pct: 10, days: 90 });
  const [sla, setSla] = useState({ accept: 30, dispute: 4, reassign: true, firstResponse: 15 });
  const [cancel, setCancel] = useState({ window: 4, penalty: 15, autoCharge: true, maxTech: 3, wait: 20 });
  const [notif, setNotif] = useState({ push: true, email: true, sms: false, weekly: true, kyc: true });
  const [catActive, setCatActive] = useState<Record<string, boolean>>(
    Object.fromEntries(cats.map(c => [c.id, true]))
  );

  // track dirty count loosely vs initial defaults (demo: count flips)
  const [dirty, setDirty] = useState(0);
  const touch = () => setDirty(d => d + 1);

  const [modal, setModal] = useState(false);

  const ActiveSection = SECTIONS.find(s => s.id === active)!;

  return (
    <div className="pb-24">
      <PageHeading
        title="Configuración del sistema"
        sub="Parámetros globales de la plataforma · solo Super Admin."
        actions={
          <div className="flex gap-2.5">
            <GhostButton><span className="inline-flex items-center gap-2"><History size={14} /> Bitácora completa</span></GhostButton>
            <GhostButton><span className="inline-flex items-center gap-2"><ArrowDownToLine size={14} /> Exportar config</span></GhostButton>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-[280px_1fr] items-start gap-6">
        {/* ---- side nav ---- */}
        <aside className="sticky top-4 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
            <Settings size={14} className="text-navy" />
            <span className="text-[13px] font-semibold text-navy">Configuración</span>
            <span className="ml-auto rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-bold text-error">SUPER ADMIN</span>
          </div>
          <nav className="p-2">
            {SECTIONS.map(s => {
              const on = s.id === active;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`relative mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${on ? 'bg-info-soft' : 'hover:bg-canvas'}`}
                >
                  {on && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-cyan" />}
                  <Icon size={15} className={on ? 'text-cyan' : 'text-muted'} />
                  <span className={`text-[13px] ${on ? 'font-semibold text-cyan' : 'font-medium text-navy'}`}>{s.label}</span>
                  {s.count && <span className="ml-auto rounded-full bg-info-soft px-1.5 py-0.5 text-[10px] font-bold text-cyan">{s.count}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ---- content ---- */}
        <div className="min-w-0">
          <FadeIn key={active} className="flex flex-col gap-5">
            <SectionHead icon={ActiveSection.icon} title={ActiveSection.label}
              sub={SUBTITLES[active]} dirty={dirty} />

            {/* GENERAL */}
            {active === 'general' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <ConfigCard title="Datos de la plataforma" icon={Building2}>
                    <Labeled label="Nombre comercial">
                      <Input value={general.name} onChange={e => { setGeneral({ ...general, name: e.target.value }); touch(); }} />
                    </Labeled>
                    <Labeled label="Correo de soporte">
                      <Input value={general.email} onChange={e => { setGeneral({ ...general, email: e.target.value }); touch(); }} />
                    </Labeled>
                    <div className="grid grid-cols-2 gap-3">
                      <Labeled label="Teléfono">
                        <Input value={general.phone} onChange={e => { setGeneral({ ...general, phone: e.target.value }); touch(); }} />
                      </Labeled>
                      <Labeled label="Ciudad base">
                        <Input value={general.city} onChange={e => { setGeneral({ ...general, city: e.target.value }); touch(); }} />
                      </Labeled>
                    </div>
                  </ConfigCard>
                  <ConfigCard title="Estado del servicio" icon={ShieldCheck}>
                    <ToggleRow title="Modo mantenimiento" sub="Suspende temporalmente nuevas solicitudes en toda la plataforma."
                      on={general.maintenance} onChange={v => { setGeneral({ ...general, maintenance: v }); touch(); }} />
                    <ToggleRow title="Aceptar nuevos registros" sub="Permite que clientes y técnicos creen cuentas."
                      on={general.newSignups} onChange={v => { setGeneral({ ...general, newSignups: v }); touch(); }} />
                    <Hint>Plataforma activa con <b className="font-semibold text-navy">{metrics.activeTechs} técnicos</b> y <b className="font-semibold text-navy">{metrics.active} solicitudes</b> en curso.</Hint>
                  </ConfigCard>
                </div>

                <ConfigCard title="Categorías activas" icon={ListChecks}
                  sub="Activa o desactiva la disponibilidad de cada categoría de servicio.">
                  <div className="grid grid-cols-2 gap-3">
                    {cats.map(c => (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold text-navy">{c.name}</div>
                          <div className="font-mono text-[11px] text-faint">{c.services ?? 0} servicios</div>
                        </div>
                        <Toggle on={catActive[c.id]} onChange={v => { setCatActive({ ...catActive, [c.id]: v }); touch(); }} />
                      </div>
                    ))}
                  </div>
                </ConfigCard>
                <AuditTrail />
              </>
            )}

            {/* COMMISSION */}
            {active === 'commission' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <ConfigCard title="Comisión global" icon={Hash}
                    sub="Se aplica a todas las categorías que no tengan comisión específica.">
                    <PercentField label="Porcentaje de comisión default" value={globalCommission}
                      onChange={v => { setGlobalCommission(v); touch(); }} />
                    <Hint>2 categorías tienen overrides: <b className="font-semibold text-navy">Plomería 12%</b> · <b className="font-semibold text-navy">Electricidad 14%</b></Hint>
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-canvas px-3.5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold text-navy">Aplicar a todas las categorías</div>
                        <div className="mt-0.5 text-[11px] text-muted">Sobrescribe los overrides existentes. Requiere confirmación.</div>
                      </div>
                      <GhostButton><span className="inline-flex items-center gap-1.5"><ArrowDownToLine size={12} /> Aplicar</span></GhostButton>
                    </div>
                  </ConfigCard>

                  <ConfigCard title="Comisión por método de pago" icon={CreditCard}
                    sub="Se suma a la comisión global. Cubre comisiones bancarias.">
                    {methods.map((m, i) => {
                      const Icon = m.icon;
                      return (
                        <div key={m.method} className="flex items-center gap-3 rounded-xl border border-line bg-canvas px-3 py-2.5">
                          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${m.bg}`}>
                            <Icon size={14} className={m.color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-semibold text-navy">{m.method}</div>
                            <div className="mt-0.5 text-[11px] text-faint">{m.note}</div>
                          </div>
                          <div className="inline-flex w-[88px] items-baseline gap-1 rounded-lg border border-line bg-surface px-3 py-1.5">
                            <input type="number" step="0.1" value={m.pct}
                              onChange={e => { const n = [...methods]; n[i] = { ...m, pct: Number(e.target.value) }; setMethods(n); touch(); }}
                              className="w-10 bg-transparent font-display text-base font-bold text-navy outline-none" />
                            <span className="font-display text-sm font-bold text-muted">%</span>
                          </div>
                        </div>
                      );
                    })}
                  </ConfigCard>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ConfigCard title="Tarifa base por defecto" icon={Tag}
                    sub="Precios mínimos, máximos y sugeridos por subcategoría.">
                    <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-3.5">
                      <FolderTree size={16} className="text-cyan" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-navy">Configurado en el módulo Catálogo</div>
                        <div className="mt-0.5 text-xs text-muted">{cats.length} categorías · última edición 12/05/2026</div>
                      </div>
                      <a href="/catalogo" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-cyan">Ir a Catálogo <ArrowRight size={12} /></a>
                    </div>
                  </ConfigCard>

                  <ConfigCard title="Programa de comisión reducida" icon={Rocket}
                    sub="Comisión preferente durante los primeros días de cada técnico nuevo."
                    headRight={
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-semibold text-navy">{program.on ? 'Activo' : 'Inactivo'}</span>
                        <Toggle on={program.on} onChange={v => { setProgram({ ...program, on: v }); touch(); }} />
                      </div>
                    }>
                    <div className="grid grid-cols-2 gap-3.5">
                      <PercentField label="Comisión durante el programa" value={program.pct}
                        onChange={v => { setProgram({ ...program, pct: v }); touch(); }} />
                      <NumField label="Duración del programa" value={program.days} unit="días"
                        onChange={v => { setProgram({ ...program, days: v }); touch(); }} />
                    </div>
                    <Hint tone="success"><b className="font-semibold text-navy">32 técnicos</b> bajo el programa · ahorro acumulado <b className="font-semibold text-success">{peso(24180)} MXN</b></Hint>
                  </ConfigCard>
                </div>
                <AuditTrail />
              </>
            )}

            {/* SLA */}
            {active === 'sla' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <ConfigCard title="Tiempo de aceptación" icon={AlarmClock}
                    sub="Minutos para que el técnico acepte o rechace una solicitud.">
                    <NumField label="Ventana de aceptación" value={sla.accept} unit="minutos"
                      onChange={v => { setSla({ ...sla, accept: v }); touch(); }} />
                    <ToggleRow title="Reasignar automáticamente si expira" sub="El sistema busca al siguiente mejor candidato en la zona."
                      on={sla.reassign} onChange={v => { setSla({ ...sla, reassign: v }); touch(); }} />
                    <div className="flex items-center gap-2.5 rounded-lg border border-success/25 bg-success/10 px-3.5 py-3">
                      <TrendingUp size={14} className="text-success" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold text-navy">97% de solicitudes se aceptan en menos de 8 min</div>
                        <div className="mt-0.5 text-[11px] text-faint">Solo 1.2% expira sin respuesta · vs. 4.8% hace 3 meses</div>
                      </div>
                    </div>
                  </ConfigCard>

                  <ConfigCard title="SLA de soporte" icon={Timer}
                    sub="Tiempos objetivo de respuesta del equipo de operaciones.">
                    <div className="grid grid-cols-2 gap-3.5">
                      <NumField label="Primera respuesta" value={sla.firstResponse} unit="min"
                        onChange={v => { setSla({ ...sla, firstResponse: v }); touch(); }} />
                      <NumField label="Resolución de disputas" value={sla.dispute} unit="horas"
                        onChange={v => { setSla({ ...sla, dispute: v }); touch(); }} />
                    </div>
                    <Hint>El incumplimiento de SLA genera alertas automáticas al Super Admin.</Hint>
                  </ConfigCard>
                </div>
                <AuditTrail />
              </>
            )}

            {/* CANCEL */}
            {active === 'cancel' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <ConfigCard title="Política de cancelación del cliente" icon={UserX}>
                    <div className="grid grid-cols-2 gap-3.5">
                      <NumField label="Ventana sin costo" value={cancel.window} unit="h antes"
                        onChange={v => { setCancel({ ...cancel, window: v }); touch(); }} />
                      <PercentField label="Penalización tardía" value={cancel.penalty} big={false}
                        onChange={v => { setCancel({ ...cancel, penalty: v }); touch(); }} />
                    </div>
                    <ToggleRow title="Cobrar penalización automáticamente" sub="Se carga a la tarjeta o saldo del cliente al confirmar."
                      on={cancel.autoCharge} onChange={v => { setCancel({ ...cancel, autoCharge: v }); touch(); }} />
                    <Hint>El cliente verá esta política al confirmar el servicio.</Hint>
                  </ConfigCard>

                  <ConfigCard title="Política de cancelación del técnico" icon={HardHat}>
                    <NumField label="Máximo de cancelaciones en 30 días" value={cancel.maxTech} unit="cancelaciones"
                      onChange={v => { setCancel({ ...cancel, maxTech: v }); touch(); }} />
                    <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/15 px-3.5 py-3 text-[12.5px] leading-relaxed">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
                      <div>
                        <b className="font-semibold text-warning">Al exceder el límite</b>
                        <span className="text-muted"> la cuenta entra en revisión automática por operaciones y no recibe nuevas solicitudes.</span>
                      </div>
                    </div>
                  </ConfigCard>
                </div>

                <ConfigCard title="No-show del cliente" icon={UserMinus}
                  sub="Cuando el cliente no está disponible al momento de la visita.">
                  <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                    <NumField label="Tiempo de espera del técnico" value={cancel.wait} unit="min"
                      onChange={v => { setCancel({ ...cancel, wait: v }); touch(); }} />
                    <div className="rounded-xl border border-line bg-canvas px-4 py-3.5">
                      <div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wider text-faint">Flujo de no-show</div>
                      <ol className="flex flex-col gap-2 text-[12.5px] leading-relaxed text-muted">
                        <li><b className="font-semibold text-navy">1.</b> Técnico toca timbre y espera al cliente.</li>
                        <li><b className="font-semibold text-navy">2.</b> Tras {cancel.wait} min marca &quot;No-show&quot; + foto con geolocalización.</li>
                        <li><b className="font-semibold text-navy">3.</b> Cliente recibe push + email; tarifa de visita ({peso(280)}) se cobra.</li>
                        <li><b className="font-semibold text-navy">4.</b> Soporte revisa la evidencia y cierra el caso en menos de 2 horas.</li>
                      </ol>
                    </div>
                  </div>
                </ConfigCard>
                <AuditTrail />
              </>
            )}

            {/* NOTIFICATIONS */}
            {active === 'notifications' && (
              <>
                <ConfigCard title="Canales de notificación" icon={Bell}
                  sub="Define cómo se comunican los eventos a clientes, técnicos y al equipo.">
                  <ToggleRow title="Notificaciones push" sub="Alertas en la app móvil para clientes y técnicos."
                    on={notif.push} onChange={v => { setNotif({ ...notif, push: v }); touch(); }} />
                  <ToggleRow title="Correo electrónico" sub="Confirmaciones, recibos y resúmenes por email."
                    on={notif.email} onChange={v => { setNotif({ ...notif, email: v }); touch(); }} />
                  <ToggleRow title="SMS" sub="Mensajes de texto para eventos críticos. Tiene costo por envío."
                    on={notif.sms} onChange={v => { setNotif({ ...notif, sms: v }); touch(); }} />
                </ConfigCard>
                <ConfigCard title="Notificaciones internas" icon={ShieldCheck}
                  sub="Avisos para el equipo de administración.">
                  <ToggleRow title="Resumen semanal de operación" sub="Reporte de GMV, solicitudes y disputas cada lunes."
                    on={notif.weekly} onChange={v => { setNotif({ ...notif, weekly: v }); touch(); }} />
                  <ToggleRow title="Alertas de KYC pendiente" sub="Notifica cuando un técnico envía documentos para verificación."
                    on={notif.kyc} onChange={v => { setNotif({ ...notif, kyc: v }); touch(); }} />
                </ConfigCard>
                <AuditTrail />
              </>
            )}

            {/* TEAM */}
            {active === 'team' && (
              <>
                <ConfigCard title="Equipo y permisos" icon={UsersRound}
                  sub="Miembros con acceso al panel de administración y su rol."
                  headRight={<PrimaryButton><span className="inline-flex items-center gap-1.5"><Users size={14} /> Invitar</span></PrimaryButton>}>
                  <div className="overflow-hidden rounded-xl border border-line">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-canvas">
                          {['Miembro', 'Correo', 'Rol', ''].map((h, i) => (
                            <th key={i} className={`border-b border-line px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-faint ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TEAM.map((m, i) => (
                          <motion.tr key={m.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                            className="border-b border-line last:border-0">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold ${m.super ? 'bg-error/10 text-error' : 'bg-info-soft text-cyan'}`}>{initials(m.name)}</div>
                                <span className="text-[13px] font-medium text-navy">{m.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-muted">{m.email}</td>
                            <td className="px-4 py-3">
                              <Badge tone={m.super ? 'error' : 'info'}>{m.role}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <GhostButton>Editar</GhostButton>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ConfigCard>
                <AuditTrail />
              </>
            )}
          </FadeIn>
        </div>
      </div>

      {/* sticky save bar */}
      <AnimatePresence>
        {dirty > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-60 right-0 z-20 flex items-center justify-between border-t border-line bg-surface px-8 py-4 shadow-hover"
          >
            <div className="flex items-center gap-3.5">
              <span className="h-2.5 w-2.5 rounded-full bg-warning shadow-[0_0_0_4px] shadow-warning/20" />
              <div>
                <div className="text-[13.5px] font-semibold text-navy">Tienes {dirty} {dirty === 1 ? 'cambio' : 'cambios'} sin guardar</div>
                <div className="mt-0.5 text-xs text-muted">Los cambios afectan la operación en producción.</div>
              </div>
            </div>
            <div className="flex gap-2.5">
              <GhostButton onClick={() => setDirty(0)}>Descartar</GhostButton>
              <PrimaryButton onClick={() => setModal(true)}>
                <span className="inline-flex items-center gap-2"><ShieldCheck size={14} /> Guardar · requiere MFA</span>
              </PrimaryButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* re-auth modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-navy/50 backdrop-blur-sm"
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-[560px] overflow-hidden rounded-2xl bg-surface shadow-hover"
            >
              <div className="flex items-start gap-3.5 border-b border-line px-6 py-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-error/10">
                  <ShieldCheck size={22} className="text-error" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[17px] font-bold text-navy">Confirma tu identidad</div>
                  <div className="mt-1 text-[13px] text-muted">Los cambios afectan comisión y flujo de pagos. Valida que eres tú antes de guardar.</div>
                </div>
              </div>
              <div className="flex flex-col gap-4 px-6 py-5">
                <div className="rounded-xl border border-line bg-canvas px-4 py-3.5">
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-faint">{dirty} cambios a aplicar</div>
                  <div className="text-[12.5px] text-muted">Se registrarán en la bitácora a tu nombre con timestamp 27/06/2026.</div>
                </div>
                <Labeled label="Código MFA · App autenticadora">
                  <div className="grid grid-cols-6 gap-2">
                    {['4', '8', '2', '7', '1', '9'].map((d, i) => (
                      <div key={i} className="grid h-12 place-items-center rounded-xl border border-cyan bg-info-soft font-display text-xl font-bold text-navy">{d}</div>
                    ))}
                  </div>
                </Labeled>
              </div>
              <div className="flex justify-end gap-2.5 border-t border-line px-6 py-4">
                <GhostButton onClick={() => setModal(false)}>Cancelar</GhostButton>
                <PrimaryButton onClick={() => { setModal(false); setDirty(0); }}>
                  <span className="inline-flex items-center gap-2"><Check size={14} /> Confirmar y guardar</span>
                </PrimaryButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SUBTITLES: Record<SectionId, string> = {
  general: 'Datos de la plataforma, estado del servicio y categorías activas.',
  commission: 'Comisión global, overrides por método de pago y programa de bienvenida.',
  sla: 'Tiempos de aceptación, reasignación y objetivos de soporte.',
  cancel: 'Políticas para clientes y técnicos · no-shows y penalizaciones.',
  notifications: 'Canales de comunicación y alertas internas del equipo.',
  team: 'Miembros con acceso al panel y sus roles.',
};

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}
