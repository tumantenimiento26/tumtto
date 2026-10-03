'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  IdCard,
  Navigation,
  Scale,
  Siren,
  UserX,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Button, Card, EmptyState } from '@/components/ds';
import { orderCode } from '@/lib/orderCode';
import { timeAgo } from '@/lib/data/notifications';
import type { ActivityItem } from '@/lib/dashboard';
import { CardHead, STATUS_BADGE, catIcon, money } from './shared';

/* ── Requiere atención ─────────────────────────────────────────────────── */

export interface AttentionItem {
  id: string;
  icon: LucideIcon;
  tile: string;
  title: string;
  sub: string;
  cta: string;
  onClick: () => void;
}

export function AttentionList({ items }: { items: AttentionItem[] }) {
  return (
    <Card className="min-w-0 animate-up overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-2.5 pt-4">
        <h2 className="font-display text-[16px] font-bold text-navy">
          Requiere atención
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${
            items.length
              ? 'bg-error-soft text-error'
              : 'bg-success-soft text-success'
          }`}
        >
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <EmptyState
          compact
          kind="all-clear"
          title="Todo al día"
          description="No hay solicitudes sin técnico, KYC, disputas ni servicios atorados."
        />
      ) : (
        items.slice(0, 5).map(a => (
          <div
            key={a.id}
            className="flex items-center gap-3 border-t border-divider px-5 py-3 transition-colors hover:bg-panel"
          >
            <span
              className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg ${a.tile}`}
            >
              <a.icon size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold text-navy">
                {a.title}
              </div>
              <div className="truncate text-[12.5px] text-muted">{a.sub}</div>
            </div>
            <Button size="sm" variant="secondary" onClick={a.onClick}>
              {a.cta}
            </Button>
          </div>
        ))
      )}
    </Card>
  );
}

/* ── Actividad en vivo ─────────────────────────────────────────────────── */

const EVENT_ICON: Record<string, { icon: LucideIcon; tile: string }> = {
  requested: { icon: Clock, tile: 'bg-warning-soft text-warning-ink' },
  accepted: { icon: CheckCircle2, tile: 'bg-info-soft text-primary' },
  enroute: { icon: Navigation, tile: 'bg-info-soft text-primary' },
  onsite: { icon: Navigation, tile: 'bg-info-soft text-primary' },
  quote: { icon: Wrench, tile: 'bg-warning-soft text-warning-ink' },
  working: { icon: Wrench, tile: 'bg-info-soft text-primary' },
  closing: { icon: CreditCard, tile: 'bg-info-soft text-primary' },
  completed: { icon: CheckCircle2, tile: 'bg-success-soft text-success' },
  paid: { icon: Banknote, tile: 'bg-success-soft text-success' },
  closed: { icon: CheckCircle2, tile: 'bg-success-soft text-success' },
  cancelled: { icon: XCircle, tile: 'bg-error-soft text-error' },
  expired: { icon: XCircle, tile: 'bg-error-soft text-error' },
};

// ponytail: el prototipo simula un evento nuevo cada 8 s; aquí la lista se
// re-deriva con cada recarga del snapshot. Para tiempo real, suscribirse a
// service_order_status_events con Supabase Realtime.
export function LiveActivity({
  items,
  onOpen,
}: {
  items: ActivityItem[];
  onOpen: (href: string) => void;
}) {
  return (
    <Card className="min-w-0 animate-up overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-2.5 pt-4">
        <h2 className="font-display text-[16px] font-bold text-navy">
          Actividad en vivo
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 font-mono text-[10.5px] font-semibold tracking-[0.1em] text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-approve" />
          EN VIVO
        </span>
      </div>
      {items.length === 0 ? (
        <EmptyState compact kind="first-use" title="Sin actividad todavía" />
      ) : (
        items.map(e => {
          const k = EVENT_ICON[e.status] ?? {
            icon: AlertTriangle,
            tile: 'bg-chip text-muted',
          };
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onOpen(e.href)}
              className="flex w-full animate-up items-center gap-3 border-t border-divider px-5 py-[11px] text-left transition-colors hover:bg-panel"
            >
              <span
                className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg ${k.tile}`}
              >
                <k.icon size={15} />
              </span>
              <span className="min-w-0 flex-1 text-[13px] leading-[1.4] text-navy">
                {e.text}
              </span>
              <span className="whitespace-nowrap font-mono text-[11px] text-faint">
                {timeAgo(e.ts)}
              </span>
            </button>
          );
        })
      )}
    </Card>
  );
}

/* ── Servicios por categoría ───────────────────────────────────────────── */

export function CategoryBars({
  rows,
  onOpenReports,
  onOpenCategory,
}: {
  rows: {
    id: string;
    slug: string;
    label: string;
    value: number;
    pct: number;
  }[];
  onOpenReports: () => void;
  onOpenCategory: (id: string) => void;
}) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <Card className="min-w-0 animate-up px-5 pb-[18px] pt-4">
      <div className="mb-2.5">
        <CardHead
          title="Servicios por categoría"
          link="Reportes"
          onLink={onOpenReports}
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState
          compact
          kind="first-use"
          title="Sin servicios en el periodo"
        />
      ) : (
        <div
          className="flex flex-col gap-0.5"
          onMouseLeave={() => setHover(null)}
        >
          {rows.map((b, i) => {
            const Icon = catIcon(b.slug);
            const on = hover === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onMouseEnter={() => setHover(b.id)}
                onClick={() => onOpenCategory(b.id)}
                className={`rounded-lg px-2.5 py-2 text-left transition-colors ${
                  on ? 'bg-panel' : ''
                }`}
              >
                <div className="mb-1.5 flex items-center gap-2 text-[13px] text-navy">
                  <Icon
                    size={15}
                    className={on ? 'text-primary' : 'text-muted'}
                  />
                  <span className="flex-1 font-medium">{b.label}</span>
                  <b className="font-mono font-semibold">{b.value}</b>
                  <span className="w-10 text-right font-mono text-[11.5px] text-faint">
                    {b.pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-divider">
                  <motion.div
                    className={`h-full origin-left rounded-full transition-colors ${
                      on || hover == null ? 'bg-primary' : 'bg-bar-idle'
                    }`}
                    style={{ width: `${(b.value / max) * 100}%` }}
                    initial={reduced ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.9,
                      delay: i * 0.04,
                      ease: [0.3, 0.8, 0.3, 1],
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/* ── Servicios recientes ───────────────────────────────────────────────── */

export interface RecentRow {
  id: string;
  cliente: string;
  categoria: string;
  slug: string;
  tecnico: string | null;
  ts: string;
  status: string;
  totalPesos: number | null;
}

export function RecentServices({
  rows,
  onOpen,
  onAll,
}: {
  rows: RecentRow[];
  onOpen: (id: string) => void;
  onAll: () => void;
}) {
  return (
    <Card className="animate-up overflow-hidden">
      <div className="px-5 pb-3 pt-4">
        <CardHead title="Servicios recientes" link="Ver todos" onLink={onAll} />
      </div>
      {rows.length === 0 ? (
        <EmptyState
          compact
          kind="first-use"
          title="Aún no hay servicios"
          description="Las solicitudes nuevas aparecerán aquí."
        />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            {rows.map(r => {
              const Icon = catIcon(r.slug);
              const s = STATUS_BADGE[r.status] ?? {
                label: r.status,
                tone: 'neutral' as const,
              };
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onOpen(r.id)}
                  className="grid min-h-[54px] w-full grid-cols-[100px_1.3fr_1.3fr_1fr_170px_90px_24px] items-center gap-3 border-t border-divider px-5 text-left text-[13.5px] transition-colors hover:bg-panel"
                >
                  <span className="font-mono text-[12.5px] font-semibold text-primary">
                    {orderCode(r.id)}
                  </span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-tint text-primary">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-navy">
                        {r.cliente}
                      </span>
                      <span className="block text-[12px] text-muted">
                        {r.categoria}
                      </span>
                    </span>
                  </span>
                  <span
                    className={`truncate ${r.tecnico ? 'text-body' : 'text-warning-ink'}`}
                  >
                    {r.tecnico ?? 'Sin asignar'}
                  </span>
                  <span className="text-[12.5px] text-faint">
                    {timeAgo(r.ts)}
                  </span>
                  <span>
                    <Badge tone={s.tone} dot>
                      {s.label}
                    </Badge>
                  </span>
                  <span className="text-right font-mono text-[13px] text-navy">
                    {r.totalPesos != null ? money(r.totalPesos) : '—'}
                  </span>
                  <ChevronRight size={16} className="text-faint" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

export const ATTENTION_ICON = {
  emergency: { icon: Siren, tile: 'bg-error-soft text-error' },
  kyc: { icon: IdCard, tile: 'bg-warning-soft text-warning-ink' },
  dispute: { icon: Scale, tile: 'bg-error-soft text-error' },
  stuck: { icon: AlertTriangle, tile: 'bg-warning-soft text-warning-ink' },
  unassigned: { icon: UserX, tile: 'bg-error-soft text-error' },
  waiting: { icon: Clock, tile: 'bg-info-soft text-primary' },
  payment: { icon: CreditCard, tile: 'bg-error-soft text-error' },
} as const;
