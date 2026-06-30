'use client';

import { useMemo, useState } from 'react';
import {
  Wrench, Zap, Flame, Hammer, Paintbrush, Square, Droplets, Plus, Pencil,
  Trash2, Search, Hash, Settings, ListChecks, Percent, Upload, Check,
  X, type LucideIcon,
} from 'lucide-react';
import { PageHeading, Panel } from '@/components/admin';
import {
  PrimaryButton, GhostButton, Input, Textarea, Toggle, Field, EmptyState,
} from '@/components/ui';
import { FadeIn, Stagger, StaggerItem, motion } from '@/components/motion';
import {
  useTick, getCategoriesWithCounts, getSubcategories,
} from '@/lib/demo/store';
import type { Subcategory } from '@/lib/demo/world';

const ICONS: Record<string, LucideIcon> = {
  wrench: Wrench, zap: Zap, flame: Flame, hammer: Hammer,
  paintbrush: Paintbrush, square: Square, droplets: Droplets,
};
const peso = (n: number) => `$${n.toLocaleString('es-MX')}`;

type SubDraft = { name: string; description: string; price_min: number; price_max: number; base_price_suggested: number };

export default function CatalogoPage() {
  useTick();
  const cats = getCategoriesWithCounts();
  const [activeId, setActiveId] = useState<string>(cats[0]?.id ?? '');
  const [query, setQuery] = useState('');

  const active = cats.find(c => c.id === activeId) ?? cats[0];
  const ActiveIcon = (active && ICONS[active.icon ?? '']) || Settings;

  // Local overlay state for subcategory edits/additions (demo world is read-only for subs).
  const baseSubs = useMemo(() => getSubcategories(active?.id), [active?.id]);
  const [overrides, setOverrides] = useState<Record<string, Partial<Subcategory> & { _deleted?: boolean }>>({});
  const [extraSubs, setExtraSubs] = useState<Record<string, Subcategory[]>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<SubDraft | null>(null);

  const subs: Subcategory[] = [
    ...baseSubs.map(s => ({ ...s, ...overrides[s.id] })).filter(s => !overrides[s.id]?._deleted),
    ...(extraSubs[active?.id ?? ''] ?? []),
  ];

  const filtered = cats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  const activeCount = cats.filter(c => c.is_active).length;

  function startNew() {
    setEditing('__new__');
    setDraft({ name: '', description: '', price_min: 300, price_max: 1500, base_price_suggested: 900 });
  }
  function startEdit(s: Subcategory) {
    setEditing(s.id);
    setDraft({
      name: s.name, description: s.description ?? '',
      price_min: s.price_min ?? 0, price_max: s.price_max ?? 0, base_price_suggested: s.base_price_suggested ?? 0,
    });
  }
  function saveDraft() {
    if (!draft || !active) return;
    if (editing === '__new__') {
      const id = `local-${Date.now()}`;
      const ns: Subcategory = {
        id, category_id: active.id, name: draft.name || 'Nueva subcategoría',
        description: draft.description || null, price_min: draft.price_min,
        price_max: draft.price_max, base_price_suggested: draft.base_price_suggested,
        is_active: true, created_at: '', updated_at: '',
      };
      setExtraSubs(p => ({ ...p, [active.id]: [...(p[active.id] ?? []), ns] }));
    } else if (editing) {
      const isExtra = (extraSubs[active.id] ?? []).some(s => s.id === editing);
      if (isExtra) {
        setExtraSubs(p => ({
          ...p,
          [active.id]: (p[active.id] ?? []).map(s => s.id === editing ? { ...s, ...draft, description: draft.description || null } : s),
        }));
      } else {
        setOverrides(p => ({ ...p, [editing]: { ...p[editing], ...draft, description: draft.description || null } }));
      }
    }
    setEditing(null); setDraft(null);
  }
  function toggleSub(s: Subcategory) {
    const isExtra = (extraSubs[active!.id] ?? []).some(x => x.id === s.id);
    if (isExtra) {
      setExtraSubs(p => ({ ...p, [active!.id]: (p[active!.id] ?? []).map(x => x.id === s.id ? { ...x, is_active: !x.is_active } : x) }));
    } else {
      setOverrides(p => ({ ...p, [s.id]: { ...p[s.id], is_active: !(p[s.id]?.is_active ?? s.is_active) } }));
    }
  }
  function deleteSub(s: Subcategory) {
    const isExtra = (extraSubs[active!.id] ?? []).some(x => x.id === s.id);
    if (isExtra) setExtraSubs(p => ({ ...p, [active!.id]: (p[active!.id] ?? []).filter(x => x.id !== s.id) }));
    else setOverrides(p => ({ ...p, [s.id]: { ...p[s.id], _deleted: true } }));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Catálogo de servicios"
        sub="Administra categorías, subcategorías, iconos y rangos de precio."
        actions={
          <div className="flex gap-2.5">
            <GhostButton><span className="inline-flex items-center gap-2"><Upload size={14} />Importar</span></GhostButton>
            <PrimaryButton><span className="inline-flex items-center gap-2"><Plus size={14} />Nueva categoría</span></PrimaryButton>
          </div>
        }
      />

      <div className="grid grid-cols-[320px_1fr] gap-6 items-start">
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
                <b className="text-navy font-semibold">{cats.length}</b> categorías ·{' '}
                <b className="text-success font-semibold">{activeCount}</b> activas
              </div>
            </div>
            <Stagger className="flex flex-col p-2">
              {filtered.map(c => {
                const Icon = ICONS[c.icon ?? ''] ?? Settings;
                const isActive = c.id === active?.id;
                return (
                  <StaggerItem key={c.id}>
                    <button
                      onClick={() => { setActiveId(c.id); setEditing(null); }}
                      className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-colors ${isActive ? 'bg-canvas border border-primary/20' : 'border border-transparent hover:bg-canvas'}`}
                    >
                      {isActive && <span className="absolute -left-1 top-2 bottom-2 w-[3px] bg-primary rounded" />}
                      <span className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${isActive ? 'bg-info-soft' : 'bg-surface-2'}`}>
                        <Icon size={16} className="text-primary" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className={`text-sm text-navy ${isActive ? 'font-semibold' : 'font-medium'}`}>{c.name}</span>
                        </span>
                        <span className="block text-xs text-muted mt-0.5">{getSubcategories(c.id).length} subcategorías · {c.services} servicios</span>
                      </span>
                      {!c.is_active && <span className="text-[10px] text-faint">inactiva</span>}
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
            <Panel><EmptyState title="Selecciona una categoría" body="Elige una categoría del panel izquierdo para configurar sus subcategorías y precios." icon={Settings} /></Panel>
          ) : (
            <>
              <FadeIn>
                <div className="flex items-center gap-4 bg-surface border border-line rounded-2xl p-5">
                  <div className="w-16 h-16 rounded-2xl bg-info-soft grid place-items-center shrink-0">
                    <ActiveIcon size={28} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-bold text-2xl text-navy flex items-center gap-2">
                      {active.name}
                      <Pencil size={13} className="text-faint" />
                    </h2>
                    <div className="text-xs text-muted mt-1 flex items-center gap-3.5">
                      <span className="flex items-center gap-1.5"><Hash size={12} className="text-faint" /><span className="font-mono">{active.id}</span></span>
                      <span>·</span>
                      <span>{subs.length} subcategorías</span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5 text-success font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />{active.services} servicios
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2 bg-canvas border border-line rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted">Estado</span>
                      <span className="text-sm text-navy font-semibold">{active.is_active ? 'Activa' : 'Inactiva'}</span>
                    </div>
                    <Toggle on={active.is_active} onChange={() => {}} />
                  </div>
                  <GhostButton><span className="inline-flex items-center gap-2 text-error"><Trash2 size={14} />Eliminar</span></GhostButton>
                </div>
              </FadeIn>

              {/* Config general */}
              <Panel title="Configuración general">
                <SectionLead num="01" icon={Settings} />
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Nombre"><Input defaultValue={active.name} /></Field>
                  <Field label="Slug"><Input defaultValue={active.id} className="font-mono" /></Field>
                  <div className="col-span-2">
                    <Field label="Descripción corta">
                      <Textarea rows={2} defaultValue={active.description ?? 'Servicios certificados con garantía y refacciones de origen.'} />
                    </Field>
                  </div>
                </div>
              </Panel>

              {/* Subcategorías */}
              <Panel
                title={`Subcategorías (${subs.length})`}
                action={<GhostButton onClick={startNew}><span className="inline-flex items-center gap-2"><Plus size={14} />Agregar</span></GhostButton>}
              >
                <SectionLead num="02" icon={ListChecks} />
                <div className="border border-line rounded-xl overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-canvas">
                        <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted font-semibold">Nombre / descripción</th>
                        <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted font-semibold">Mín</th>
                        <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted font-semibold">Máx</th>
                        <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted font-semibold">Sugerido</th>
                        <th className="text-center px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted font-semibold w-20">Activa</th>
                        <th className="px-4 py-2.5 w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map(s => (
                        <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-line">
                          <td className="px-4 py-3 align-middle">
                            <div className="text-sm font-semibold text-navy">{s.name}</div>
                            <div className="text-xs text-muted mt-0.5">{s.description ?? 'Sin descripción'}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-muted">{peso(s.price_min ?? 0)}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-muted">{peso(s.price_max ?? 0)}</td>
                          <td className="px-4 py-3 text-right font-display font-bold text-sm text-navy">{peso(s.base_price_suggested ?? 0)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center"><Toggle on={s.is_active} onChange={() => toggleSub(s)} /></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg border border-line hover:bg-canvas"><Pencil size={13} className="text-primary" /></button>
                              <button onClick={() => deleteSub(s)} className="p-1.5 rounded-lg border border-line hover:bg-canvas"><Trash2 size={13} className="text-error" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                      {subs.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">Sin subcategorías. Agrega la primera.</td></tr>
                      )}
                    </tbody>
                  </table>
                  <div className="p-3 border-t border-line bg-canvas">
                    <button onClick={startNew} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-[1.5px] border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-info-soft">
                      <Plus size={14} />Agregar subcategoría
                    </button>
                  </div>
                </div>

                {editing && draft && (
                  <FadeIn>
                    <div className="mt-4 border border-primary/30 bg-canvas rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-navy">{editing === '__new__' ? 'Nueva subcategoría' : 'Editar subcategoría'}</span>
                        <button onClick={() => { setEditing(null); setDraft(null); }} className="p-1.5 rounded-lg border border-line hover:bg-surface"><X size={14} className="text-muted" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Field label="Nombre"><Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></Field>
                        </div>
                        <div className="col-span-2">
                          <Field label="Descripción"><Input value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></Field>
                        </div>
                        <Field label="Precio mín"><Input type="number" value={draft.price_min} onChange={e => setDraft({ ...draft, price_min: +e.target.value })} /></Field>
                        <Field label="Precio máx"><Input type="number" value={draft.price_max} onChange={e => setDraft({ ...draft, price_max: +e.target.value })} /></Field>
                        <Field label="Base sugerida"><Input type="number" value={draft.base_price_suggested} onChange={e => setDraft({ ...draft, base_price_suggested: +e.target.value })} /></Field>
                      </div>
                      <div className="flex justify-end gap-2.5 mt-4">
                        <GhostButton onClick={() => { setEditing(null); setDraft(null); }}>Cancelar</GhostButton>
                        <PrimaryButton onClick={saveDraft}><span className="inline-flex items-center gap-2"><Check size={14} />Guardar</span></PrimaryButton>
                      </div>
                    </div>
                  </FadeIn>
                )}
              </Panel>

              {/* Comisión */}
              <Panel title="Comisión específica">
                <SectionLead num="03" icon={Percent} />
                <div className="flex items-center gap-6 p-4 bg-canvas border border-line rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-navy">¿{active.name} usa comisión personalizada?</div>
                    <div className="text-xs text-muted mt-1">
                      Comisión global: <b className="text-navy font-semibold">15%</b> · Personalizada:{' '}
                      <b className="text-primary font-semibold">12%</b> · Ahorro al técnico:{' '}
                      <b className="text-success font-semibold">~$95 MXN por servicio</b>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-surface border border-line rounded-lg px-3 h-11 w-28">
                      <input type="number" defaultValue={12} className="w-full bg-transparent outline-none font-display font-bold text-xl text-navy" />
                      <span className="font-display font-bold text-lg text-muted">%</span>
                    </div>
                    <Toggle on onChange={() => {}} />
                  </div>
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLead({ num, icon: Icon }: { num: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-3 mb-4 -mt-1">
      <span className="font-mono text-[11px] tracking-widest text-faint">{num}</span>
      <span className="w-7 h-7 rounded-lg bg-info-soft grid place-items-center"><Icon size={15} className="text-primary" /></span>
    </div>
  );
}
