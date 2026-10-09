'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Wrench,
  Zap,
  Flame,
  Hammer,
  Paintbrush,
  Square,
  Droplets,
  Wind,
  Plug,
  KeyRound,
  Snowflake,
  Plus,
  Trash2,
  Search,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorPage,
  Field,
  Input,
  Kicker,
  Modal,
  PageHeader,
  ScreenSkeleton,
  Sheet,
  Textarea,
  Toggle,
  snackbar,
  toast,
} from '@/components/ds';
import { useAction } from '@/components/use-action';
import {
  useTick,
  getCategoriesWithCounts,
  getCatalogData,
  toggleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getSettingInt,
  useWorldReady,
  useWorldFailed,
  loadWorld,
  setCategoryBaseFee,
} from '@/lib/data/store';
import { useAuth } from '@/lib/auth';
import { parseRuleValue } from '@/lib/scheduleRules';
import { money } from '../servicios/_components/shared';
import { addIncluded, categoryStats, rangeLabel } from '@/lib/catalogStats';

const ICONS: Record<string, LucideIcon> = {
  wrench: Wrench,
  zap: Zap,
  flame: Flame,
  hammer: Hammer,
  paintbrush: Paintbrush,
  square: Square,
  droplets: Droplets,
  wind: Wind,
  snowflake: Snowflake,
  plug: Plug,
  key: KeyRound,
};

type Cat = ReturnType<typeof getCategoriesWithCounts>[number];

// ponytail: "servicios incluidos" no tiene tabla (el esquema tiene una sola
// capa: service_categories). Se guardan en este navegador; subir a una
// columna/tabla cuando el catálogo tenga subservicios.
const INCLUDED_KEY = 'tumtto-catalog-included';
function readIncluded(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(INCLUDED_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function writeIncluded(v: Record<string, string[]>) {
  try {
    localStorage.setItem(INCLUDED_KEY, JSON.stringify(v));
  } catch {
    /* modo privado / cuota llena: solo en memoria */
  }
}

export default function CatalogoPage() {
  useTick();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const cats = getCategoriesWithCounts();
  const data = getCatalogData();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [included, setIncluded] = useState<Record<string, string[]>>({});
  const { busy, run } = useAction();

  useEffect(() => setIncluded(readIncluded()), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? cats.filter(c => c.name.toLowerCase().includes(q)) : cats;
  }, [cats, query]);
  const published = cats.filter(c => c.is_active).length;

  async function onToggle(c: Cat) {
    const ok = await run(`toggle-${c.id}`, () => toggleCategory(c.id));
    if (!ok) return;
    snackbar.show(`${c.name} ${c.is_active ? 'pausada' : 'publicada'}`, {
      undo: () => void toggleCategory(c.id),
    });
  }

  function saveIncluded(catId: string, list: string[]) {
    const next = { ...included, [catId]: list };
    setIncluded(next);
    writeIncluded(next);
  }

  if (failed)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready) return <ScreenSkeleton kind="list" />;

  const active = cats.find(c => c.id === editing) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Catálogo de servicios"
        description="Categorías que ve el cliente en la app, con rangos de precio y comisión."
        actions={
          <Button icon={Plus} onClick={() => setCreating(true)}>
            Nueva categoría
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-[320px]">
          <Input
            icon={Search}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar categoría…"
            aria-label="Buscar categoría"
          />
        </div>
        <span className="font-sans text-[13px] text-muted">
          <b className="font-semibold text-navy">{cats.length}</b> categorías ·{' '}
          <b className="font-semibold text-success">{published}</b> publicadas
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card padded>
          <EmptyState
            kind={cats.length ? 'no-results' : 'first-use'}
            title={cats.length ? 'Sin coincidencias' : 'Aún no hay categorías'}
            description={
              cats.length
                ? `Ninguna categoría coincide con "${query.trim()}".`
                : 'Crea la primera para que aparezca en la app.'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => {
            const Icon = ICONS[c.icon ?? ''] ?? Settings;
            const s = categoryStats(c.id, data);
            const inc = included[c.id]?.length ?? 0;
            return (
              <Card
                key={c.id}
                hover
                onClick={() => setEditing(c.id)}
                className={`animate-up cursor-pointer p-5 ${
                  editing === c.id ? 'border-primary' : ''
                }`}
              >
                <div
                  className="flex items-start justify-between"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-btn bg-info-soft">
                    <Icon size={20} className="text-primary" />
                  </span>
                  {/* El toggle no abre el editor */}
                  <span onClick={e => e.stopPropagation()}>
                    <Toggle
                      checked={c.is_active}
                      disabled={busy === `toggle-${c.id}`}
                      onChange={() => void onToggle(c)}
                      label={
                        <span className="sr-only">
                          {c.is_active ? 'Pausar' : 'Publicar'} {c.name}
                        </span>
                      }
                    />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-[17px] font-bold text-navy">
                  {c.name}
                </h3>
                <span
                  className={`font-sans text-[12.5px] font-semibold ${
                    c.is_active ? 'text-success' : 'text-muted'
                  }`}
                >
                  {c.is_active ? 'Publicada' : 'Pausada'}
                </span>
                <div className="mt-3 flex items-center justify-between gap-2 rounded-btn bg-panel px-3 py-2">
                  <span className="font-sans text-[12px] text-muted">Tarifa base de visita</span>
                  {c.base_visit_fee_cents != null ? (
                    <span className="font-mono text-[13px] font-semibold text-navy tabular">
                      {money(c.base_visit_fee_cents)}
                    </span>
                  ) : (
                    <Badge tone="warning">Sin configurar</Badge>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-y-1 font-sans text-[12.5px] text-muted">
                  <span>{inc ? `${inc} servicios` : 'Sin servicios'}</span>
                  <span className="text-right">{s.technicians} técnicos</span>
                  <span className="font-mono text-[12px] font-medium text-primary tabular">
                    {rangeLabel(s)}
                  </span>
                  <span className="text-right">{s.orders} servicios</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {active && (
        <CategoryEditor
          key={active.id}
          cat={active}
          included={included[active.id] ?? []}
          onIncluded={list => saveIncluded(active.id, list)}
          onClose={() => setEditing(null)}
        />
      )}

      <NewCategoryModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={id => setEditing(id)}
      />
    </div>
  );
}

function CategoryEditor({
  cat,
  included,
  onIncluded,
  onClose,
}: {
  cat: Cat;
  included: string[];
  onIncluded: (list: string[]) => void;
  onClose: () => void;
}) {
  const stats = categoryStats(cat.id, getCatalogData());
  const globalPct = getSettingInt('commission_bps', 1500) / 100;
  const [name, setName] = useState(cat.name);
  const [description, setDescription] = useState(cat.description ?? '');
  const [custom, setCustom] = useState(cat.commission_bps != null);
  const [pct, setPct] = useState(
    cat.commission_bps != null ? String(cat.commission_bps / 100) : '',
  );
  const canFinance = useAuth().can('finanzas');
  const [baseText, setBaseText] = useState(
    cat.base_visit_fee_cents != null ? String(cat.base_visit_fee_cents / 100) : '',
  );
  const [chip, setChip] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shake, setShake] = useState(false);
  const { busy, run } = useAction();

  const n = Number(pct);
  const pctError =
    custom && (!pct.trim() || !Number.isFinite(n) || n < 0 || n > 100)
      ? 'Escribe un porcentaje entre 0 y 100.'
      : null;
  const nameError = !name.trim() ? 'La categoría necesita un nombre.' : null;
  // Tarifa base: vacío = sin configurar (solo válido mientras siga así).
  const baseCents = baseText.trim() === '' ? null : parseRuleValue('fixed', baseText);
  const baseError =
    baseCents != null && (Number.isNaN(baseCents) || baseCents < 0)
      ? 'Escribe un monto en pesos (0 si la visita no se cobra).'
      : baseCents == null && cat.base_visit_fee_cents != null
        ? 'Indica el monto; usa 0 si la visita no se cobra.'
        : null;
  const baseChanged = canFinance && baseCents !== null && baseCents !== (cat.base_visit_fee_cents ?? null);
  const profileChanged =
    name.trim() !== cat.name ||
    description !== (cat.description ?? '') ||
    (custom ? Math.round(n * 100) : null) !== (cat.commission_bps ?? null);
  const dirty = profileChanged || baseChanged;

  async function save() {
    if (nameError || pctError || (canFinance && baseError)) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    const ok = await run(
      'save',
      async () => {
        // La tarifa base va por su RPC (finanzas); el resto, por la tabla.
        if (profileChanged) {
          const r = await updateCategory(cat.id, {
            name: name.trim(),
            description: description.trim() || null,
            commission_bps: custom ? Math.round(n * 100) : null,
          });
          if (r === null) return null;
        }
        if (baseChanged && baseCents != null) return setCategoryBaseFee(cat.id, baseCents);
        return true;
      },
      `Categoría guardada · ${name.trim()}`,
    );
    if (ok) onClose();
  }

  async function remove() {
    setDeleting(true);
    const result = await deleteCategory(cat.id);
    setDeleting(false);
    setConfirmDelete(false);
    if (result === 'ok') {
      toast.success(`Categoría eliminada · ${cat.name}`);
      onClose();
    } else if (result === 'has-services') {
      toast.error('No puedes eliminar una categoría con servicios registrados');
    } else {
      toast.error(
        'No se pudo eliminar la categoría',
        'Reintenta en un momento.',
      );
    }
  }

  function addChip() {
    const next = addIncluded(included, chip);
    if (next !== included) {
      onIncluded(next);
      toast.local('Servicio agregado (solo en este navegador)');
    }
    setChip('');
  }

  return (
    <>
      <Sheet
        open
        onClose={onClose}
        kicker="Editar categoría"
        title={cat.name}
        width={480}
        footerClassName={shake ? 'animate-shake' : ''}
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => setConfirmDelete(true)}
              className="text-error"
            >
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => void save()}
                loading={busy === 'save'}
                disabled={!dirty}
              >
                Guardar
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <Kicker>Datos</Kicker>
            <Input
              label="Nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              error={nameError}
            />
            <Input
              label="Slug"
              value={cat.slug}
              disabled
              className="font-mono"
              hint="Se genera al crear la categoría; la app lo usa como clave."
            />
            <Field label="Descripción corta">
              <Textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Lo que ve el cliente bajo el nombre"
              />
            </Field>
          </section>

          <section className="flex flex-col gap-3">
            <Kicker>Tarifa base de visita</Kicker>
            <Input
              type="number"
              min={0}
              step="1"
              prefix="$"
              suffix="MXN"
              value={baseText}
              onChange={e => setBaseText(e.target.value)}
              disabled={!canFinance}
              error={canFinance ? baseError : null}
              placeholder="Sin configurar"
              aria-label={`Tarifa base de visita de ${cat.name}`}
              hint={
                canFinance
                  ? 'Lo que el cliente paga en la app por la visita. Se congela en cada solicitud nueva.'
                  : 'Solo finanzas puede cambiar la tarifa base.'
              }
            />
            {cat.base_visit_fee_cents == null && (
              <p className="rounded-btn bg-warning-soft px-3 py-2 font-sans text-[12.5px] text-body">
                Sin configurar: las solicitudes usan la tarifa de visita del técnico o el mínimo de la categoría.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <Kicker>Rango de precio</Kicker>
            <div className="flex items-center justify-between rounded-box border border-line bg-panel px-4 py-3">
              <span className="font-mono text-[15px] font-semibold text-navy tabular">
                {rangeLabel(stats)}
              </span>
              <Badge tone="neutral">{stats.technicians} técnicos</Badge>
            </div>
            <p className="font-sans text-[12px] text-muted">
              Sale de las tarifas de visita que fija cada técnico; no se edita
              aquí.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <Kicker>Comisión</Kicker>
            <Toggle
              checked={custom}
              disabled={!canFinance}
              onChange={next => {
                setCustom(next);
                if (next && !pct) setPct(String(globalPct));
              }}
              label={
                <span className="font-sans text-[13.5px] text-navy">
                  Comisión específica{' '}
                  <span className="text-muted">(global: {globalPct}%)</span>
                </span>
              }
            />
            {custom && (
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={pct}
                onChange={e => setPct(e.target.value)}
                suffix="%"
                disabled={!canFinance}
                error={pctError}
                aria-label={`Comisión de ${cat.name}`}
              />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <Kicker>Servicios incluidos</Kicker>
            <div className="flex flex-wrap gap-2">
              {included.length === 0 && (
                <span className="font-sans text-[12.5px] text-muted">
                  Aún no agregas servicios.
                </span>
              )}
              {included.map(sv => (
                <Chip
                  key={sv}
                  onRemove={() => onIncluded(included.filter(x => x !== sv))}
                >
                  {sv}
                </Chip>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={chip}
                onChange={e => setChip(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChip();
                  }
                }}
                placeholder="Ej. Reparación de fugas"
                wrapperClassName="flex-1"
                aria-label="Agregar servicio incluido"
              />
              <Button variant="secondary" icon={Plus} onClick={addChip}>
                Agregar
              </Button>
            </div>
            <p className="font-sans text-[12px] text-muted">
              Se guardan en este navegador: el backend aún no tiene subservicios
              por categoría.
            </p>
          </section>
        </div>
      </Sheet>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        dismissible={!deleting}
        title="Eliminar categoría"
        description="Esta acción quita la categoría del catálogo público."
        icon={Trash2}
        tone="danger"
        width={440}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              icon={Trash2}
              loading={deleting}
              disabled={stats.orders > 0}
              onClick={() => void remove()}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="font-sans text-[13.5px] leading-relaxed text-muted">
          {stats.orders > 0 ? (
            <span className="text-error">
              {cat.name} tiene {stats.orders} servicio(s) registrados: no se
              puede eliminar. Pausa la categoría para ocultarla de la app.
            </span>
          ) : (
            <>
              ¿Eliminar <b className="font-semibold text-navy">{cat.name}</b>?
              No tiene servicios, se puede eliminar de forma segura.
            </>
          )}
        </p>
      </Modal>
    </>
  );
}

function NewCategoryModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('wrench');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim() || saving) return;
    setSaving(true);
    const cat = await createCategory(name.trim(), icon);
    setSaving(false);
    // createCategory ya avisó el error (duplicado 23505 incluido).
    if (!cat) return;
    toast.success(`Categoría creada · ${cat.name}`);
    setName('');
    setIcon('wrench');
    onClose();
    onCreated(cat.id);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title="Nueva categoría"
      description="Se crea publicada; los técnicos podrán fijar sus tarifas en ella."
      icon={Plus}
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={() => void submit()}
            loading={saving}
            disabled={!name.trim()}
          >
            Crear categoría
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej. Cerrajería"
          onKeyDown={e => {
            if (e.key === 'Enter') void submit();
          }}
        />
        <Field label="Ícono">
          <div className="flex flex-wrap gap-2">
            {Object.entries(ICONS).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                aria-label={key}
                aria-pressed={icon === key}
                className={`grid h-11 w-11 place-items-center rounded-btn border transition-colors ${
                  icon === key
                    ? 'border-primary bg-info-soft text-primary'
                    : 'border-line bg-card text-muted hover:bg-panel'
                }`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
