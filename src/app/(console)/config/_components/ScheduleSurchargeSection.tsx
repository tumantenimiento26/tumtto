'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, FlaskConical, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Input,
  Kicker,
  Modal,
  Segmented,
  Select,
  Toggle,
  toast,
} from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { useAction } from '@/components/use-action';
import {
  deleteHoliday,
  deleteScheduleRule,
  getCategories,
  getHolidays,
  getScheduleRules,
  loadExtras,
  previewScheduleSurcharge,
  saveHoliday,
  saveScheduleRule,
  setScheduleRuleActive,
  useExtras,
  useTick,
} from '@/lib/data/store';
import {
  RULE_KIND_LABEL,
  RULE_KIND_OPTIONS,
  WEEKDAYS,
  emptyRuleForm,
  holidayDateLabel,
  isValidDate,
  mxInstant,
  ruleToForm,
  sortHolidays,
  sortRules,
  surchargeBadge,
  validateRuleForm,
  whenLabel,
  type Preview,
  type RuleErrors,
  type RuleForm,
  type ScheduleRule,
  type SurchargeType,
} from '@/lib/scheduleRules';
import { money } from '../../servicios/_components/shared';

const KIND_TONE = { time_band: 'info', weekday: 'navy', holiday: 'warning' } as const;

/** Configuración › «Recargos por horario»: reglas, calendario de festivos y «Probar». */
export function ScheduleSurchargeSection() {
  useTick();
  const loaded = useExtras(s => s.loaded);
  const unavailable = useExtras(s => s.unavailable.scheduleRules || s.unavailable.holidays);
  const canEdit = useAuth().can('finanzas');
  useEffect(() => {
    void loadExtras();
  }, []);

  if (!loaded) return <Card padded><p className="text-[13px] text-muted">Cargando reglas…</p></Card>;
  if (unavailable)
    return (
      <Card padded>
        <p className="text-[13px] text-muted">
          Los recargos por horario aún no están disponibles en este entorno (falta aplicar la migración de precios v2).
        </p>
      </Card>
    );
  return (
    <>
      <Card padded className="!py-3.5">
        <p className="font-sans text-[12.5px] leading-relaxed text-muted">
          Un recargo se suma a la <b className="font-semibold text-navy">tarifa base de visita</b> de la solicitud, en hora de
          Guadalajara. Si aplican varias reglas gana <b className="font-semibold text-navy">la de mayor monto</b> (no se suman).
          El recargo de emergencia es aparte y sí se suma. Los cambios solo afectan solicitudes nuevas.
        </p>
      </Card>
      <RulesCard canEdit={canEdit} />
      <HolidaysCard canEdit={canEdit} />
      <TryCard />
    </>
  );
}

// ── Reglas ───────────────────────────────────────────────────────────────────

function RulesCard({ canEdit }: { canEdit: boolean }) {
  const rules = sortRules(getScheduleRules());
  const { busy, run } = useAction();
  const [form, setForm] = useState<RuleForm | null>(null);
  const [del, setDel] = useState<ScheduleRule | null>(null);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider px-5 py-4">
        <div>
          <div className="font-display text-[16px] font-bold text-navy">Reglas de recargo</div>
          <div className="font-sans text-[12px] text-muted">
            {rules.filter(r => r.is_active).length} activas de {rules.length}.
          </div>
        </div>
        <Button
          icon={Plus}
          disabled={!canEdit}
          title={canEdit ? undefined : 'Solo finanzas edita los recargos'}
          onClick={() => setForm(emptyRuleForm())}
        >
          Nueva regla
        </Button>
      </div>
      {rules.length === 0 ? (
        <EmptyState compact kind="first-use" title="Sin reglas de recargo" description="Crea una franja nocturna, un día o un festivo." />
      ) : (
        <ul className="divide-y divide-divider">
          {rules.map(r => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
              <div className="min-w-0 flex-1 basis-56">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-sans text-[14px] font-semibold ${r.is_active ? 'text-navy' : 'text-muted'}`}>
                    {r.name}
                  </span>
                  <Badge tone={KIND_TONE[r.kind as keyof typeof KIND_TONE] ?? 'neutral'}>
                    {RULE_KIND_LABEL[r.kind as keyof typeof RULE_KIND_LABEL] ?? r.kind}
                  </Badge>
                  {!r.is_active && <Badge tone="neutral">Inactiva</Badge>}
                </div>
                <div className="mt-0.5 font-sans text-[12.5px] text-muted">{whenLabel(r)}</div>
              </div>
              <span className="font-mono text-[14px] font-semibold text-navy tabular">
                {surchargeBadge(r.surcharge_type, r.value)}
                <span className="ml-1.5 font-sans text-[11.5px] font-medium text-muted">
                  {r.surcharge_type === 'fixed' ? 'fijo' : 'de la base'}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <Toggle
                  checked={r.is_active}
                  disabled={!canEdit || busy === `act-${r.id}`}
                  aria-label={`${r.is_active ? 'Desactivar' : 'Activar'} ${r.name}`}
                  onChange={on =>
                    void run(`act-${r.id}`, () => setScheduleRuleActive(r.id, on), on ? `${r.name} activada` : `${r.name} desactivada`)
                  }
                />
                <Button size="sm" variant="secondary" icon={Pencil} disabled={!canEdit} onClick={() => setForm(ruleToForm(r))}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  className="text-error"
                  disabled={!canEdit}
                  aria-label={`Eliminar ${r.name}`}
                  onClick={() => setDel(r)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && <RuleModal key={form.id ?? 'new'} initial={form} onClose={() => setForm(null)} />}

      <Modal
        open={!!del}
        onClose={() => busy === null && setDel(null)}
        dismissible={busy === null}
        icon={Trash2}
        tone="danger"
        title="Eliminar regla"
        description="Las solicitudes ya creadas conservan el recargo que se les congeló; solo dejarás de aplicarlo a las nuevas."
        footer={
          <>
            <Button variant="secondary" disabled={busy !== null} onClick={() => setDel(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              icon={Trash2}
              loading={busy === 'del'}
              onClick={async () => {
                if (!del) return;
                const ok = await run('del', () => deleteScheduleRule(del.id), `Regla eliminada · ${del.name}`);
                if (ok) setDel(null);
              }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="font-sans text-[13.5px] text-muted">
          ¿Eliminar <b className="font-semibold text-navy">{del?.name}</b> ({del ? whenLabel(del) : ''})?
        </p>
      </Modal>
    </Card>
  );
}

function RuleModal({ initial, onClose }: { initial: RuleForm; onClose: () => void }) {
  const [f, setF] = useState<RuleForm>(initial);
  const [errs, setErrs] = useState<RuleErrors>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof RuleForm>(k: K, v: RuleForm[K]) => setF(x => ({ ...x, [k]: v }));
  const editing = initial.id != null;

  async function submit() {
    const e = validateRuleForm(f);
    setErrs(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const ok = await saveScheduleRule(f);
    setSaving(false);
    if (!ok) return; // el store ya mostró el error
    toast.success(editing ? 'Regla actualizada' : 'Regla creada', f.name.trim());
    onClose();
  }

  const toggleDay = (d: number) =>
    set('weekdays', f.weekdays.includes(d) ? f.weekdays.filter(x => x !== d) : [...f.weekdays, d]);

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!saving}
      title={editing ? 'Editar regla' : 'Nueva regla de recargo'}
      description="Aplica a solicitudes nuevas; las existentes conservan su recargo."
      icon={FlaskConical}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} loading={saving}>
            {editing ? 'Guardar' : 'Crear regla'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nombre"
          value={f.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Ej. Nocturno"
          error={errs.name}
        />
        <Field label="Tipo de regla">
          <Select
            aria-label="Tipo de regla"
            options={RULE_KIND_OPTIONS}
            value={f.kind}
            onChange={k => set('kind', k)}
          />
        </Field>

        {f.kind === 'time_band' && (
          <div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Desde" type="time" value={f.start} onChange={e => set('start', e.target.value)} error={errs.start} />
              <Input label="Hasta" type="time" value={f.end} onChange={e => set('end', e.target.value)} error={errs.end} />
            </div>
            <p className="mt-1.5 text-[12px] text-muted">
              Si «Hasta» es menor que «Desde», la franja cruza la medianoche (21:00 → 07:00). La hora final no se incluye.
            </p>
          </div>
        )}

        {f.kind !== 'holiday' && (
          <Field
            label={f.kind === 'weekday' ? 'Días de la semana' : 'Solo en estos días (opcional)'}
            error={errs.weekdays}
            hint={f.kind === 'time_band' ? 'Sin días elegidos = todos los días.' : undefined}
          >
            <div className="flex flex-wrap gap-2" role="group" aria-label="Días de la semana">
              {WEEKDAYS.map(d => (
                <Chip key={d.value} active={f.weekdays.includes(d.value)} onClick={() => toggleDay(d.value)}>
                  {d.short}
                </Chip>
              ))}
            </div>
          </Field>
        )}
        {f.kind === 'holiday' && (
          <p className="rounded-btn bg-panel px-3 py-2 text-[12.5px] text-muted">
            Aplica a todas las fechas del calendario de festivos de abajo.
          </p>
        )}

        <Field label="Recargo">
          <div className="flex flex-wrap items-start gap-3">
            <Segmented<SurchargeType>
              aria-label="Tipo de recargo"
              options={[
                { value: 'percent', label: 'Porcentaje' },
                { value: 'fixed', label: 'Monto fijo' },
              ]}
              value={f.type}
              onChange={t => set('type', t)}
            />
            <div className="min-w-[140px] flex-1">
              <Input
                type="number"
                min={0}
                step={f.type === 'percent' ? '0.01' : '1'}
                prefix={f.type === 'fixed' ? '$' : undefined}
                suffix={f.type === 'percent' ? '%' : 'MXN'}
                value={f.value}
                onChange={e => set('value', e.target.value)}
                error={errs.value}
                aria-label={f.type === 'percent' ? 'Porcentaje del recargo' : 'Monto fijo del recargo'}
              />
            </div>
          </div>
          <p className="mt-1.5 text-[12px] text-muted">
            {f.type === 'percent' ? 'Porcentaje sobre la tarifa base de visita.' : 'Monto en pesos, igual para cualquier categoría.'}
          </p>
        </Field>

        <Toggle
          checked={f.active}
          onChange={v => set('active', v)}
          label={<span className="font-sans text-[13.5px] text-navy">Regla activa</span>}
        />
      </div>
    </Modal>
  );
}

// ── Festivos ─────────────────────────────────────────────────────────────────

function HolidaysCard({ canEdit }: { canEdit: boolean }) {
  const holidays = sortHolidays(getHolidays());
  const { busy, run } = useAction();
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = holidays.filter(h => h.date >= today);
  const past = holidays.filter(h => h.date < today);
  const dupe = holidays.find(h => h.date === date);
  const invalid = !isValidDate(date) || !name.trim();

  async function add() {
    if (invalid) return;
    const ok = await run('add', () => saveHoliday(date, name), dupe ? 'Festivo actualizado' : 'Festivo agregado');
    if (ok) {
      setDate('');
      setName('');
    }
  }

  const row = (h: (typeof holidays)[number], dim = false) => (
    <li key={h.date} className="flex items-center gap-3 px-5 py-2.5">
      <CalendarDays size={15} className={dim ? 'text-faint' : 'text-primary'} aria-hidden />
      <div className="min-w-0 flex-1">
        <span className={`font-sans text-[13.5px] font-semibold ${dim ? 'text-muted' : 'text-navy'}`}>{h.name}</span>
        <span className="ml-2 font-sans text-[12.5px] text-muted">{holidayDateLabel(h.date)}</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        icon={Trash2}
        className="text-error"
        disabled={!canEdit || busy === `rm-${h.date}`}
        aria-label={`Quitar ${h.name} ${h.date}`}
        onClick={() => void run(`rm-${h.date}`, () => deleteHoliday(h.date), `Festivo quitado · ${h.name}`)}
      />
    </li>
  );

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-divider px-5 py-4">
        <div className="font-display text-[16px] font-bold text-navy">Calendario de festivos</div>
        <div className="font-sans text-[12px] text-muted">
          Las reglas de tipo «Día festivo» aplican en estas fechas. Vienen sembrados los festivos obligatorios de la LFT.
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-b border-divider bg-panel/50 px-5 py-3.5">
        <div className="w-[170px]">
          <Input
            label="Fecha"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            disabled={!canEdit}
            hint={dupe ? `Ya existe: se renombra «${dupe.name}».` : undefined}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <Input
            label="Nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Día del Padre (local)"
            disabled={!canEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') void add();
            }}
          />
        </div>
        <Button icon={Plus} loading={busy === 'add'} disabled={!canEdit || invalid} onClick={() => void add()}>
          Agregar festivo
        </Button>
      </div>
      {holidays.length === 0 ? (
        <EmptyState compact kind="first-use" title="Sin festivos" />
      ) : (
        <ul className="max-h-[340px] divide-y divide-divider overflow-y-auto">
          {upcoming.map(h => row(h))}
          {past.length > 0 && (
            <li className="bg-panel px-5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Pasados</li>
          )}
          {past.reverse().map(h => row(h, true))}
        </ul>
      )}
    </Card>
  );
}

// ── Probar ───────────────────────────────────────────────────────────────────

function TryCard() {
  const cats = getCategories().filter(c => c.is_active);
  const rules = getScheduleRules();
  const holidays = getHolidays();
  const options = useMemo(
    () =>
      cats.map(c => ({
        value: c.id,
        label: c.name,
        hint: c.base_visit_fee_cents == null ? 'sin tarifa base' : money(c.base_visit_fee_cents),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cats.map(c => `${c.id}:${c.base_visit_fee_cents}`).join('|')],
  );
  const [cat, setCat] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('22:00');
  const [res, setRes] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  // Cualquier cambio de reglas o festivos invalida el resultado mostrado.
  useEffect(() => setRes(null), [rules, holidays]);
  const ready = !!cat && isValidDate(date) && !!time;

  async function test() {
    if (!ready || !cat) return;
    setBusy(true);
    const r = await previewScheduleSurcharge(cat, mxInstant(date, time));
    setBusy(false);
    setRes(r);
  }

  return (
    <Card padded>
      <div className="mb-1 flex items-center gap-2">
        <FlaskConical size={16} className="text-primary" aria-hidden />
        <h3 className="font-display text-[16px] font-bold text-navy">Probar</h3>
      </div>
      <p className="mb-4 font-sans text-[12.5px] text-muted">
        Elige una categoría y una fecha y hora (hora de Guadalajara) para ver qué recargo se aplicaría hoy con las reglas activas.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] sm:items-end">
        <Field label="Categoría">
          <Select aria-label="Categoría a probar" options={options} value={cat} onChange={setCat} placeholder="Elige categoría…" />
        </Field>
        <Input label="Fecha" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Hora" type="time" value={time} onChange={e => setTime(e.target.value)} />
        <Button icon={FlaskConical} disabled={!ready} loading={busy} onClick={() => void test()}>
          Probar
        </Button>
      </div>

      {res && (
        <div role="status" aria-label="Resultado de la prueba" className="mt-4 rounded-box border border-line bg-panel p-4">
          <Kicker className="mb-2">Resultado · {res.local_time || `${date} ${time}`}</Kicker>
          {res.rule_name ? (
            <p className="mb-3 font-sans text-[13.5px] text-body">
              Aplica <b className="font-semibold text-navy">{res.rule_name}</b>{' '}
              {res.surcharge_type && res.surcharge_value != null && (
                <Badge tone="info">{surchargeBadge(res.surcharge_type, res.surcharge_value)}</Badge>
              )}
              {res.is_holiday && <Badge tone="warning" className="ml-1.5">Día festivo</Badge>}
            </p>
          ) : (
            <p className="mb-3 font-sans text-[13.5px] text-body">
              Ninguna regla activa aplica en ese horario{res.is_holiday ? ' (es festivo, pero no hay regla de festivo activa)' : ''}.
            </p>
          )}
          <dl className="flex flex-col gap-1.5 text-[13.5px]">
            <Pair label="Tarifa base de visita" value={res.source === 'none' && res.base_fee_cents === 0 ? 'Sin configurar' : money(res.base_fee_cents, true)} />
            <Pair label={res.rule_name ? `Recargo ${res.rule_name}` : 'Recargo de horario'} value={money(res.surcharge_cents, true)} />
            <div className="my-0.5 border-t border-divider" />
            <Pair strong label="Total a pagar ahora" value={money(res.total_cents, true)} />
          </dl>
          <p className="mt-2 text-[12px] text-muted">El recargo de emergencia, si aplica, se suma aparte.</p>
        </div>
      )}
    </Card>
  );
}

function Pair({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={strong ? 'font-display font-bold text-navy' : 'text-muted'}>{label}</dt>
      <dd className={`font-mono tabular ${strong ? 'text-[15px] font-semibold text-navy' : 'text-body'}`}>{value}</dd>
    </div>
  );
}
