'use client';

import { useState } from 'react';
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
  Plus,
  Pencil,
  Trash2,
  Search,
  Hash,
  Settings,
  Percent,
  Upload,
  Check,
  type LucideIcon,
} from 'lucide-react';
import {
  PageHeading,
  Panel,
  Modal,
  LoadFailed,
  PageSkeleton,
} from '@/components/admin';
import {
  PrimaryButton,
  GhostButton,
  Input,
  Textarea,
  Toggle,
  Field,
  EmptyState,
} from '@/components/ui';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { toast } from '@/components/toast';
import { useAction } from '@/components/use-action';
import {
  useTick,
  getCategoriesWithCounts,
  toggleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getSettingInt,
  useWorldReady,
  useWorldFailed,
  loadWorld,
} from '@/lib/data/store';

const ICONS: Record<string, LucideIcon> = {
  wrench: Wrench,
  zap: Zap,
  flame: Flame,
  hammer: Hammer,
  paintbrush: Paintbrush,
  square: Square,
  droplets: Droplets,
  wind: Wind,
  plug: Plug,
  key: KeyRound,
};

// ponytail: el esquema desplegado tiene UNA capa de catálogo
// (service_categories). Los precios por servicio viven en technician_rates,
// no en el catálogo — este panel gestiona solo categorías.
export default function CatalogoPage() {
  useTick();
  const cats = getCategoriesWithCounts();
  const [activeId, setActiveId] = useState<string>(cats[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [deleteCatOpen, setDeleteCatOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const { busy, run } = useAction();
  const ready = useWorldReady();
  const failed = useWorldFailed();

  const active = cats.find(c => c.id === activeId) ?? cats[0];
  const ActiveIcon = (active && ICONS[active.icon ?? '']) || Settings;

  const filtered = cats.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );
  const activeCount = cats.filter(c => c.is_active).length;

  function onToggleCategory() {
    if (!active) return;
    void run(
      'toggle',
      () => toggleCategory(active.id),
      `Categoría ${active.is_active ? 'desactivada' : 'activada'} · ${active.name}`,
    );
  }
  async function onSaveConfig() {
    if (!active) return;
    const nextName = (name ?? active.name).trim();
    if (!nextName) {
      toast.error('La categoría necesita un nombre.');
      return;
    }
    const ok = await run(
      'save',
      () =>
        updateCategory(active.id, {
          name: nextName,
          description: description ?? active.description,
        }),
      'Configuración guardada',
    );
    // Los borradores solo se limpian si se guardó; si no, siguen para reintentar.
    if (ok) {
      setName(null);
      setDescription(null);
    }
  }
  async function onDeleteCategory() {
    if (!active) return;
    const result = await deleteCategory(active.id);
    setDeleteCatOpen(false);
    if (result === 'ok') {
      toast.success(`Categoría eliminada · ${active.name}`);
      setActiveId(getCategoriesWithCounts()[0]?.id ?? '');
    } else if (result === 'has-services') {
      toast.error('No puedes eliminar una categoría con servicios registrados');
    } else {
      toast.error('No se pudo eliminar la categoría. Reintenta.');
    }
  }

  // Sin snapshot el catálogo se veía vacío ("0 categorías") en vez de fallar.
  if (failed) return <LoadFailed onRetry={() => void loadWorld(true)} />;
  if (!ready) return <PageSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Catálogo de servicios"
        sub="Administra categorías, iconos y comisiones. Las tarifas las fija cada técnico (technician_rates)."
        actions={
          <div className="flex gap-2.5">
            <GhostButton>
              <span className="inline-flex items-center gap-2">
                <Upload size={14} />
                Importar
              </span>
            </GhostButton>
            <PrimaryButton onClick={() => setNewCatOpen(true)}>
              <span className="inline-flex items-center gap-2">
                <Plus size={14} />
                Nueva categoría
              </span>
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* LEFT — category list */}
        <FadeIn>
          <aside className="bg-surface border border-line rounded-2xl overflow-hidden sticky top-2">
            <div className="p-4 border-b border-line flex flex-col gap-2.5">
              <div className="flex items-center h-9 bg-canvas border border-line rounded-lg px-3 gap-2">
                <Search size={14} className="text-faint" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar categoría…"
                  className="flex-1 bg-transparent outline-none text-sm text-navy"
                />
              </div>
              <div className="text-xs text-muted">
                <b className="text-navy font-semibold">{cats.length}</b>{' '}
                categorías ·{' '}
                <b className="text-success font-semibold">{activeCount}</b>{' '}
                activas
              </div>
            </div>
            <Stagger className="flex flex-col p-2">
              {filtered.map(c => {
                const Icon = ICONS[c.icon ?? ''] ?? Settings;
                const isActive = c.id === active?.id;
                return (
                  <StaggerItem key={c.id}>
                    <button
                      onClick={() => {
                        setActiveId(c.id);
                        setName(null);
                        setDescription(null);
                      }}
                      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-colors ${isActive ? 'bg-canvas border border-primary/20' : 'border border-transparent hover:bg-canvas'}`}
                    >
                      {isActive && (
                        <span className="absolute -left-1 top-2 bottom-2 w-[3px] bg-primary rounded" />
                      )}
                      <span
                        className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${isActive ? 'bg-info-soft' : 'bg-surface-2'}`}
                      >
                        <Icon size={16} className="text-primary" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`text-sm text-navy ${isActive ? 'font-semibold' : 'font-medium'}`}
                          >
                            {c.name}
                          </span>
                        </span>
                        <span className="block text-xs text-muted mt-0.5">
                          {c.services} servicios
                        </span>
                      </span>
                      {!c.is_active && (
                        <span className="text-[10px] text-faint">inactiva</span>
                      )}
                    </button>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </aside>
        </FadeIn>

        {/* RIGHT — detail */}
        <div className="min-w-0 flex flex-col gap-5">
          {!active ? (
            <Panel>
              <EmptyState
                title="Selecciona una categoría"
                body="Elige una categoría del panel izquierdo para configurarla."
                icon={Settings}
              />
            </Panel>
          ) : (
            <>
              <FadeIn>
                <div className="flex flex-wrap items-center gap-4 bg-surface border border-line rounded-2xl p-4 sm:p-5">
                  <div className="w-16 h-16 rounded-2xl bg-info-soft grid place-items-center shrink-0">
                    <ActiveIcon size={28} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-bold text-2xl text-navy flex items-center gap-2">
                      {active.name}
                      <Pencil size={13} className="text-faint" />
                    </h2>
                    <div className="text-xs text-muted mt-1 flex items-center gap-3.5">
                      <span className="flex items-center gap-1.5">
                        <Hash size={12} className="text-faint" />
                        <span className="font-mono">{active.slug}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5 text-success font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        {active.services} servicios
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2 bg-canvas border border-line rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted">Estado</span>
                      <span className="text-sm text-navy font-semibold">
                        {active.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <Toggle on={active.is_active} onChange={onToggleCategory} />
                  </div>
                  <GhostButton onClick={() => setDeleteCatOpen(true)}>
                    <span className="inline-flex items-center gap-2 text-error">
                      <Trash2 size={14} />
                      Eliminar
                    </span>
                  </GhostButton>
                </div>
              </FadeIn>

              {/* Config general */}
              <Panel
                title="Configuración general"
                action={
                  <GhostButton
                    onClick={() => void onSaveConfig()}
                    disabled={!!busy}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Check size={14} />
                      Guardar
                    </span>
                  </GhostButton>
                }
              >
                <SectionLead num="01" icon={Settings} />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Nombre">
                    <Input
                      key={`name-${active.id}`}
                      value={name ?? active.name}
                      onChange={e => setName(e.target.value)}
                    />
                  </Field>
                  <Field label="Slug">
                    <Input
                      key={`slug-${active.id}`}
                      defaultValue={active.slug}
                      className="font-mono"
                      disabled
                    />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Descripción corta">
                      <Textarea
                        key={`desc-${active.id}`}
                        rows={2}
                        value={description ?? active.description ?? ''}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              </Panel>

              {/* Comisión */}
              <CategoryCommission key={active.id} cat={active} />
            </>
          )}
        </div>
      </div>

      {/* Nueva categoría */}
      <NewCategoryModal
        open={newCatOpen}
        onClose={() => setNewCatOpen(false)}
        onCreated={id => setActiveId(id)}
      />

      {/* Confirmar eliminación de categoría */}
      <Modal
        open={deleteCatOpen}
        onClose={() => setDeleteCatOpen(false)}
        title="Eliminar categoría"
        sub="Esta acción quita la categoría del catálogo público."
        icon={<Trash2 size={15} className="text-error" />}
        width={440}
        footer={
          <>
            <GhostButton onClick={() => setDeleteCatOpen(false)}>
              Cancelar
            </GhostButton>
            <button
              onClick={onDeleteCategory}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-error px-4 py-3 font-semibold text-white hover:opacity-90"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-muted">
          ¿Eliminar <b className="font-semibold text-navy">{active?.name}</b>?{' '}
          {active && active.services > 0 ? (
            <span className="text-error">
              Tiene {active.services} servicio(s) registrados: no se puede
              eliminar.
            </span>
          ) : (
            'La categoría no tiene servicios, se puede eliminar de forma segura.'
          )}
        </p>
      </Modal>
    </div>
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
      title="Nueva categoría"
      sub="Se crea activa; los técnicos podrán fijar sus tarifas en ella."
      icon={<Plus size={16} />}
      width={440}
      footer={
        <>
          <GhostButton onClick={onClose} disabled={saving}>
            Cancelar
          </GhostButton>
          <PrimaryButton
            onClick={() => void submit()}
            loading={saving}
            disabled={!name.trim()}
          >
            Crear categoría
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nombre">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Cerrajería"
          />
        </Field>
        <Field label="Icono">
          <div className="flex flex-wrap gap-2">
            {Object.entries(ICONS).map(([key, Icon]) => (
              <button
                key={key}
                onClick={() => setIcon(key)}
                aria-label={key}
                className={`grid h-11 w-11 place-items-center rounded-xl border transition-colors ${
                  icon === key
                    ? 'border-primary bg-info-soft text-primary'
                    : 'border-line bg-surface text-muted hover:bg-surface-2'
                }`}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

function SectionLead({ num, icon: Icon }: { num: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-3 mb-4 -mt-1">
      <span className="font-mono text-[11px] tracking-widest text-faint">
        {num}
      </span>
      <span className="w-7 h-7 rounded-lg bg-info-soft grid place-items-center">
        <Icon size={15} className="text-primary" />
      </span>
    </div>
  );
}

/**
 * Comisión por categoría (service_categories.commission_bps). NULL = usa la
 * global de Configuración. Antes el botón solo mostraba un toast.
 */
function CategoryCommission({
  cat,
}: {
  cat: { id: string; name: string; commission_bps?: number | null };
}) {
  const globalPct = getSettingInt('commission_bps', 1500) / 100;
  const [custom, setCustom] = useState(cat.commission_bps != null);
  const [pct, setPct] = useState(
    cat.commission_bps != null ? String(cat.commission_bps / 100) : '',
  );
  const { busy, run } = useAction();
  const n = Number(pct);
  const invalid =
    custom && (!pct.trim() || !Number.isFinite(n) || n < 0 || n > 100);

  function save() {
    if (invalid) return;
    void run(
      'commission',
      () =>
        updateCategory(cat.id, {
          commission_bps: custom ? Math.round(n * 100) : null,
        }),
      `Comisión guardada · ${cat.name}`,
    );
  }

  return (
    <Panel
      title="Comisión específica"
      action={
        <GhostButton onClick={save} disabled={invalid || !!busy}>
          <span className="inline-flex items-center gap-2">
            <Check size={14} />
            {busy ? 'Guardando…' : 'Guardar'}
          </span>
        </GhostButton>
      }
    >
      <SectionLead num="02" icon={Percent} />
      <div className="flex items-center gap-6 rounded-xl border border-line bg-canvas p-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-navy">
            ¿{cat.name} usa comisión personalizada?
          </div>
          <div className="mt-1 text-xs text-muted">
            Comisión global:{' '}
            <b className="font-semibold text-navy">{globalPct}%</b>
            {custom && pct.trim() && !invalid && (
              <>
                {' '}
                · Personalizada:{' '}
                <b className="font-semibold text-primary">{n}%</b>
              </>
            )}
          </div>
          {invalid && (
            <p className="mt-1 text-[11.5px] text-error" role="alert">
              Escribe un porcentaje entre 0 y 100.
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`flex h-11 w-28 items-center rounded-lg border bg-surface px-3 ${invalid ? 'border-error' : 'border-line'} ${custom ? '' : 'opacity-50'}`}
          >
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              aria-label={`Comisión de ${cat.name}`}
              disabled={!custom}
              value={pct}
              onChange={e => setPct(e.target.value)}
              className="w-full bg-transparent font-display text-xl font-bold text-navy outline-none"
            />
            <span className="font-display text-lg font-bold text-muted">%</span>
          </div>
          <Toggle
            on={custom}
            onChange={() => {
              setCustom(c => !c);
              if (!pct) setPct(String(globalPct));
            }}
          />
        </div>
      </div>
    </Panel>
  );
}
