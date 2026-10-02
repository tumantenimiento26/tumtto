'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BellOff,
  Check,
  CheckCheck,
  Inbox,
  MailOpen,
  Trash2,
  X,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  PageHeader,
  Segmented,
  snackbar,
  type Tone,
} from '@/components/ds';
import { NOTIF_ICON } from '@/components/admin-shell';
import {
  NOTIF_TYPES,
  derive,
  timeAgo,
  useNotifState,
  useNotifications,
  type NotifType,
  type NotificationView,
} from '@/lib/data/notifications';
import { useTick } from '@/lib/data/store';
import {
  filterNotifs,
  groupByDay,
  selectionState,
  unreadByType,
  type NotifTab,
} from '@/lib/notifList';

const TYPE_TONE: Record<NotifType, Tone> = {
  kyc: 'warning',
  disputas: 'danger',
  tickets: 'info',
  retiros: 'success',
  servicios: 'warning',
  pagos: 'danger',
  sistema: 'neutral',
};

function Row({
  n,
  selected,
  onSelect,
  onOpen,
  onToggleRead,
  onRemove,
}: {
  n: NotificationView;
  selected: boolean;
  onSelect: (v: boolean) => void;
  onOpen: () => void;
  onToggleRead: () => void;
  onRemove: () => void;
}) {
  const k = NOTIF_ICON[n.type];
  const label = NOTIF_TYPES.find(t => t.type === n.type)?.label ?? n.type;
  return (
    <div
      className={`group flex animate-up items-center gap-3 rounded-box px-3 py-2.5 transition-colors ${
        selected
          ? 'bg-tint'
          : n.read
            ? 'hover:bg-panel'
            : 'bg-panel/60 hover:bg-panel'
      }`}
    >
      <Checkbox checked={selected} onChange={onSelect} className="shrink-0" />
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-btn ${k.tile}`}
        >
          <k.icon size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={`truncate text-[14px] text-navy ${
                n.read ? 'font-semibold' : 'font-bold'
              }`}
            >
              {n.title}
            </span>
            {!n.read && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-primary"
                aria-label="No leída"
              />
            )}
          </span>
          <span className="block truncate text-[12.5px] text-muted">
            {n.body}
          </span>
          <span className="mt-1 flex items-center gap-2">
            <Badge tone={TYPE_TONE[n.type]} mono>
              {label}
            </Badge>
            <span className="font-mono text-[11px] text-faint">
              {timeAgo(n.ts)}
            </span>
          </span>
        </span>
      </button>
      <div className="flex shrink-0 flex-col gap-1 opacity-70 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onToggleRead}
          aria-label={n.read ? 'Marcar como no leída' : 'Marcar como leída'}
          title={n.read ? 'Marcar como no leída' : 'Marcar como leída'}
          className="grid h-7 w-7 place-items-center rounded-lg text-navy hover:bg-card"
        >
          {n.read ? <MailOpen size={15} /> : <Check size={15} />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Eliminar notificación"
          title="Eliminar"
          className="grid h-7 w-7 place-items-center rounded-lg text-navy hover:bg-card hover:text-error"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default function NotificacionesPage() {
  useTick();
  const router = useRouter();
  const { items, unread } = useNotifications();
  const { muted, markRead, markUnread, remove, restore } = useNotifState();
  const [tab, setTab] = useState<NotifTab>('todas');
  const [type, setType] = useState<NotifType | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Cuántos avisos quedan ocultos por tipos silenciados (se ven como etiqueta).
  const mutedCounts = useMemo(() => {
    const out: Partial<Record<NotifType, number>> = {};
    for (const n of derive())
      if (muted.includes(n.type)) out[n.type] = (out[n.type] ?? 0) + 1;
    return out;
    // `items` cambia con cada recarga del snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, muted]);

  const byType = unreadByType(items);
  const visible = filterNotifs(items, tab, type);
  const groups = groupByDay(visible);
  const sel = selectionState(visible, selected);
  const selIds = visible.filter(n => selected.has(n.id)).map(n => n.id);

  const setOne = (id: string, v: boolean) =>
    setSelected(s => {
      const next = new Set(s);
      if (v) next.add(id);
      else next.delete(id);
      return next;
    });
  const clear = () => setSelected(new Set());

  const removeWithUndo = (ids: string[]) => {
    if (!ids.length) return;
    remove(ids);
    clear();
    snackbar.show(
      ids.length === 1
        ? 'Notificación eliminada'
        : `${ids.length} notificaciones eliminadas`,
      { undo: () => restore(ids) },
    );
  };

  const open = (n: NotificationView) => {
    markRead([n.id]);
    router.push(n.href);
  };

  const typeRows: {
    key: NotifType | null;
    label: string;
    count: number;
    muted?: boolean;
  }[] = [
    { key: null, label: 'Todas', count: unread },
    ...NOTIF_TYPES.map(t => ({
      key: t.type,
      label: t.label,
      count: byType[t.type] ?? mutedCounts[t.type] ?? 0,
      muted: muted.includes(t.type),
    })),
  ];

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <PageHeader
        title="Notificaciones"
        description={`${unread} sin leer · cada aviso te lleva a su pantalla.`}
        actions={
          <>
            <Button
              variant="secondary"
              icon={CheckCheck}
              disabled={unread === 0}
              onClick={() => markRead(items.map(n => n.id))}
            >
              Marcar todas como leídas
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Tipos */}
        <nav
          aria-label="Tipo de notificación"
          className="flex gap-1 overflow-x-auto lg:w-[240px] lg:shrink-0 lg:flex-col lg:overflow-visible"
        >
          {typeRows.map(t => {
            const on = type === t.key;
            const Icon = t.key ? NOTIF_ICON[t.key].icon : Inbox;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  setType(t.key);
                  clear();
                }}
                aria-current={on ? 'true' : undefined}
                className={`flex h-10 shrink-0 items-center gap-3 rounded-btn px-3.5 text-left text-[14px] font-semibold transition-colors ${
                  on ? 'bg-action text-white' : 'text-navy hover:bg-panel'
                }`}
              >
                <Icon size={16} className={on ? '' : 'text-muted'} />
                <span className="flex-1">{t.label}</span>
                {t.muted ? (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-medium ${
                      on ? 'text-white/70' : 'text-faint'
                    }`}
                    title="Silenciado en Configuración"
                  >
                    <BellOff size={12} /> silenciado
                  </span>
                ) : (
                  t.count > 0 && (
                    <span
                      className={`min-w-6 rounded-full px-1.5 py-0.5 text-center font-mono text-[11px] ${
                        on ? 'bg-white/20 text-white' : 'bg-chip text-muted'
                      }`}
                    >
                      {t.count}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </nav>

        {/* Lista */}
        <Card className="min-w-0 flex-1 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider px-4 py-3">
            {sel === 'none' ? (
              <Checkbox
                checked={false}
                onChange={v =>
                  setSelected(v ? new Set(visible.map(n => n.id)) : new Set())
                }
                label="Seleccionar todo"
                disabled={visible.length === 0}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Checkbox
                  checked={sel === 'all'}
                  indeterminate={sel === 'some'}
                  onChange={v =>
                    setSelected(v ? new Set(visible.map(n => n.id)) : new Set())
                  }
                  label={`${selIds.length} seleccionadas`}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Check}
                  onClick={() => {
                    markRead(selIds);
                    clear();
                  }}
                >
                  Marcar leídas
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={MailOpen}
                  onClick={() => {
                    markUnread(selIds);
                    clear();
                  }}
                >
                  No leídas
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  icon={Trash2}
                  onClick={() => removeWithUndo(selIds)}
                >
                  Eliminar
                </Button>
              </div>
            )}
            <Segmented
              size="sm"
              value={tab}
              onChange={v => {
                setTab(v);
                clear();
              }}
              aria-label="Filtrar por lectura"
              options={[
                {
                  value: 'todas',
                  label: (
                    <>
                      Todas{' '}
                      <span className="font-mono text-[11px] text-faint">
                        {filterNotifs(items, 'todas', type).length}
                      </span>
                    </>
                  ),
                },
                {
                  value: 'no-leidas',
                  label: (
                    <>
                      No leídas{' '}
                      <span className="font-mono text-[11px] text-faint">
                        {filterNotifs(items, 'no-leidas', type).length}
                      </span>
                    </>
                  ),
                },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1 p-2">
            {groups.map(g => (
              <section key={g.label} aria-label={g.label}>
                <h2 className="px-3 pb-1.5 pt-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                  {g.label}
                </h2>
                <div className="flex flex-col gap-1">
                  {g.items.map(n => (
                    <Row
                      key={n.id}
                      n={n}
                      selected={selected.has(n.id)}
                      onSelect={v => setOne(n.id, v)}
                      onOpen={() => open(n)}
                      onToggleRead={() =>
                        n.read ? markUnread([n.id]) : markRead([n.id])
                      }
                      onRemove={() => removeWithUndo([n.id])}
                    />
                  ))}
                </div>
              </section>
            ))}
            {visible.length === 0 && (
              <EmptyState
                kind={
                  tab === 'no-leidas' || !items.length
                    ? 'all-clear'
                    : 'no-results'
                }
                title={
                  tab === 'no-leidas' || !items.length
                    ? 'Todo al día'
                    : 'Sin avisos de este tipo'
                }
                description={
                  type && muted.includes(type)
                    ? 'Este tipo está silenciado; actívalo en Configuración para verlo aquí.'
                    : 'Cuando algo necesite tu atención aparecerá aquí.'
                }
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
