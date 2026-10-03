'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCheck,
  ChevronRight,
  CornerDownLeft,
  FolderTree,
  IdCard,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  LogOut,
  Map,
  Moon,
  PanelLeft,
  RefreshCw,
  Scale,
  Search,
  Settings,
  Siren,
  Sun,
  User,
  Users,
  Wallet,
  Wrench,
  WifiOff,
  X,
  Banknote,
  CreditCard,
  Info,
  Package,
  type LucideIcon,
  Menu as MenuIcon,
} from 'lucide-react';

import { PageTransition } from './motion';
import { BrandMark } from './ui';
import { toast } from './toast';
import { IconButton, Kicker, Portal, ScreenSkeleton, useEscape } from './ds';
import {
  getAllRequests,
  getClients,
  getOpenSupportCount,
  getCashReviewOrders,
  getPendingKyc,
  getProfile,
  getTechniciansWithProfile,
  loadWorld,
  setErrorNotifier,
  subscribeRealtime,
  useTick,
  useWorldFailed,
} from '@/lib/data/store';
import {
  timeAgo,
  useNotifState,
  useNotifications,
  type NotifType,
} from '@/lib/data/notifications';
import { useAuth } from '@/lib/auth';
import { useTheme, applyTheme } from '@/lib/theme';
import { orderCode } from '@/lib/orderCode';

/**
 * Shell de la consola (handoff web · C. Consola admin):
 * - Sidebar #061B3A 256px ↔ riel compacto 76px (solo íconos; badges → punto
 *   cian). Toggle a mitad del borde, botón en el header y ⌘B. Bajo 1100px el
 *   riel queda en flujo y la versión completa se abre encima con scrim.
 * - Header 64px: migas mono + título, buscador que abre la paleta ⌘K, tema
 *   claro/oscuro y campana con el panel de notificaciones (440px).
 * - Skeleton por tipo de pantalla al navegar y banner "Sin conexión".
 */

/* ── Estado del shell (persistido: riel compacto) ── */
interface ShellState {
  compact: boolean;
  drawer: boolean;
  palette: boolean;
  notifs: boolean;
  toggleCompact: () => void;
  setDrawer: (v: boolean) => void;
  setPalette: (v: boolean) => void;
  setNotifs: (v: boolean) => void;
}
export const useShell = create<ShellState>()(
  persist(
    set => ({
      compact: false,
      drawer: false,
      palette: false,
      notifs: false,
      toggleCompact: () => set(s => ({ compact: !s.compact })),
      setDrawer: drawer => set({ drawer }),
      setPalette: palette => set({ palette }),
      setNotifs: notifs => set({ notifs }),
    }),
    {
      name: 'tumtto-admin-shell',
      storage: createJSONStorage(() => localStorage),
      partialize: s => ({ compact: s.compact }),
    },
  ),
);

/** ¿Celular o tablet (≤1024px)? Ahí no hay riel: menú hamburguesa + cajón. */
function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

/* ── Navegación ── */
interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: () => number;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

function useNavGroups(): NavGroup[] {
  useTick();
  const { unread } = useNotifications();
  const { can } = useAuth();
  const finanzas = can('finanzas');
  // Soporte resuelve revisiones de efectivo sin ver todo Finanzas.
  const efectivo = !finanzas && can('soporte');
  return [
    {
      label: 'General',
      items: [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        {
          href: '/notificaciones',
          icon: Bell,
          label: 'Notificaciones',
          badge: () => unread,
        },
      ],
    },
    {
      label: 'Usuarios',
      items: [
        { href: '/clientes', icon: Users, label: 'Clientes' },
        {
          href: '/tecnicos',
          icon: IdCard,
          label: 'Técnicos',
          badge: () => getPendingKyc().length,
        },
      ],
    },
    {
      label: 'Operación',
      items: [
        { href: '/servicios', icon: Wrench, label: 'Servicios' },
        { href: '/inventario', icon: Package, label: 'Inventario' },
        { href: '/regiones', icon: Map, label: 'Regiones' },
        ...(finanzas ? [{ href: '/finanzas', icon: Wallet, label: 'Finanzas', badge: () => getCashReviewOrders().length }] : []),
        ...(efectivo ? [{ href: '/finanzas', icon: Wallet, label: 'Efectivo', badge: () => getCashReviewOrders().length }] : []),
        {
          href: '/soporte',
          icon: Scale,
          label: 'Soporte',
          badge: getOpenSupportCount,
        },
      ],
    },
    {
      label: 'Analítica',
      items: [{ href: '/reportes', icon: BarChart3, label: 'Reportes' }],
    },
    {
      label: 'Sistema',
      items: [
        { href: '/catalogo', icon: FolderTree, label: 'Catálogo' },
        ...(finanzas ? [{ href: '/config', icon: Settings, label: 'Configuración' }] : []),
        // Galería de estados/errores: solo en desarrollo.
        ...(process.env.NODE_ENV === 'production'
          ? []
          : [{ href: '/estados', icon: AlertTriangle, label: 'Estados y errores' }]),
      ],
    },
  ];
}

/** Ruta → [grupo, título] para las migas del header. */
const CRUMB: Record<string, [string, string]> = {
  '/dashboard': ['Inicio', 'Panel de control'],
  '/notificaciones': ['Inicio', 'Centro de notificaciones'],
  '/clientes': ['Usuarios', 'Clientes'],
  '/tecnicos': ['Usuarios', 'Técnicos'],
  '/servicios': ['Operación', 'Servicios'],
  '/inventario': ['Operación', 'Inventario'],
  '/regiones': ['Operación', 'Regiones y cobertura'],
  '/finanzas': ['Operación', 'Finanzas'],
  '/soporte': ['Operación', 'Soporte'],
  '/reportes': ['Analítica', 'Reportes'],
  '/catalogo': ['Sistema', 'Catálogo'],
  '/config': ['Sistema', 'Configuración'],
  '/estados': ['Sistema', 'Estados y errores'],
};
const DETAIL_TITLE: Record<string, string> = {
  '/servicios': 'Detalle de servicio',
  '/inventario': 'Detalle de herramienta',
  '/clientes': 'Detalle de cliente',
  '/tecnicos': 'Detalle de técnico',
};

function isActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

/** Tipo de skeleton según la ruta (dashboard / lista / detalle). */
export function screenKind(pathname: string): 'dashboard' | 'list' | 'detail' {
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  return pathname.split('/').filter(Boolean).length > 1 ? 'detail' : 'list';
}

function useAdminUser() {
  const { usuario, session } = useAuth();
  const name = usuario?.full_name ?? 'Admin';
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('') || 'A';
  return { name, email: session?.user.email ?? '', initials };
}

/* ── Sidebar ── */
function Sidebar({
  compact,
  overlay,
  onToggle,
  onClose,
}: {
  compact: boolean;
  /** Versión completa sobre el contenido (pantallas angostas). */
  overlay?: boolean;
  onToggle: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const user = useAdminUser();
  const groups = useNavGroups();

  return (
    <aside
      className={`relative flex h-full flex-col bg-sidebar text-white transition-[width] duration-300 ease-[cubic-bezier(.3,1,.4,1)] ${
        compact ? 'w-[76px]' : 'w-64'
      } ${overlay ? 'shadow-modal' : ''}`}
    >
      <div
        className={`flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-white/[0.06] ${compact ? 'justify-center' : 'px-5'}`}
      >
        <BrandMark size={32} className="rounded-lg" />
        {!compact && (
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-extrabold leading-none">
              Tumantenimiento
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
              Consola admin
            </div>
          </div>
        )}
        {overlay && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5"
          >
            <X size={18} className="text-white/70" />
          </button>
        )}
      </div>

      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3"
        aria-label="Principal"
      >
        {groups.map(g => (
          <div key={g.label} className="mb-3">
            {compact ? (
              <div className="mx-auto my-2 h-px w-8 bg-white/[0.08]" />
            ) : (
              <p className="px-3 pb-1.5 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                {g.label}
              </p>
            )}
            {g.items.map(it => {
              const active = isActive(it.href, pathname);
              const n = it.badge?.() ?? 0;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  title={compact ? it.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`relative mb-0.5 flex items-center gap-3 rounded-btn py-2.5 transition-colors ${
                    compact ? 'justify-center px-0' : 'px-3'
                  } ${active ? 'bg-[#0a6bcf] text-white' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'}`}
                >
                  <span className="relative">
                    <it.icon size={19} strokeWidth={1.9} />
                    {compact && n > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-cyan" />
                    )}
                  </span>
                  {!compact && (
                    <>
                      <span className="flex-1 truncate text-[13.5px] font-medium">
                        {it.label}
                      </span>
                      {n > 0 && (
                        <span
                          className={`min-w-[22px] rounded-full px-1.5 py-px text-center font-mono text-[11px] font-semibold ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-cyan/15 text-cyan'
                          }`}
                        >
                          {n}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        className={`border-t border-white/[0.06] p-3 ${compact ? 'flex justify-center' : ''}`}
      >
        <div
          className={`flex items-center gap-2.5 rounded-btn bg-white/[0.04] ${compact ? 'p-2' : 'p-2.5'}`}
        >
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#0a6bcf] font-display text-[12.5px] font-bold">
            {user.initials}
          </span>
          {!compact && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">
                  {user.name}
                </div>
                <div className="truncate text-[11px] text-white/50">
                  {user.email || 'Admin'}
                </div>
              </div>
              <button
                onClick={() =>
                  void signOut().then(() => router.replace('/login?out=1'))
                }
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/[0.08] hover:text-white"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toggle a mitad del borde */}
      {!overlay && (
        <button
          onClick={onToggle}
          aria-label={compact ? 'Expandir menú' : 'Contraer menú'}
          title="⌘B"
          className="absolute -right-3.5 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-navy shadow-float transition-transform hover:scale-105"
        >
          <ChevronRight
            size={15}
            className={`transition-transform duration-300 ${compact ? '' : 'rotate-180'}`}
          />
        </button>
      )}
    </aside>
  );
}

/* ── Paleta ⌘K ── */
interface PaletteItem {
  id: string;
  group: 'Pantallas' | 'Servicios' | 'Clientes' | 'Técnicos';
  label: string;
  hint?: string;
  icon: LucideIcon;
  href: string;
}
const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function CommandPalette() {
  const { palette, setPalette } = useShell();
  const router = useRouter();
  const groups = useNavGroups();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const close = useCallback(() => {
    setPalette(false);
    setQ('');
    setIdx(0);
  }, [setPalette]);
  useEscape(close, palette);

  const items = useMemo<PaletteItem[]>(() => {
    if (!palette) return [];
    const screens: PaletteItem[] = groups.flatMap(g =>
      g.items.map(i => ({
        id: i.href,
        group: 'Pantallas' as const,
        label: i.label,
        hint: g.label,
        icon: i.icon,
        href: i.href,
      })),
    );
    const services: PaletteItem[] = getAllRequests().map(o => ({
      id: o.id,
      group: 'Servicios',
      label: `${orderCode(o.id)} · ${o.title ?? o.description ?? 'Servicio'}`,
      hint: getProfile(o.client_id)?.full_name ?? undefined,
      icon: Wrench,
      href: `/servicios/${o.id}`,
    }));
    const clients: PaletteItem[] = getClients().map(p => ({
      id: p.id,
      group: 'Clientes',
      label: p.full_name ?? 'Cliente',
      hint: p.phone ?? undefined,
      icon: User,
      href: `/clientes/${p.id}`,
    }));
    const techs: PaletteItem[] = getTechniciansWithProfile().map(
      ({ tech, profile }) => ({
        id: tech.id,
        group: 'Técnicos',
        label: profile?.full_name ?? tech.display_name ?? 'Técnico',
        hint: tech.kyc_status,
        icon: IdCard,
        href: `/tecnicos/${tech.id}`,
      }),
    );
    const all = [...screens, ...services, ...clients, ...techs];
    if (!q.trim()) return screens;
    const nq = norm(q.trim());
    return all
      .filter(i => norm(`${i.label} ${i.hint ?? ''}`).includes(nq))
      .slice(0, 40);
  }, [palette, q, groups]);

  const go = (it: PaletteItem) => {
    router.push(it.href);
    close();
  };
  if (!palette) return null;

  let last = '';
  return (
    <Portal>
      <div
        className="anim-fade fixed inset-0 z-[80] bg-[rgba(6,27,58,0.55)] backdrop-blur-[3px]"
        onClick={close}
      />
      <div className="pointer-events-none fixed inset-0 z-[81] flex justify-center px-4 pt-[12vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscar"
          className="anim-modal pointer-events-auto flex max-h-[70vh] w-full max-w-[620px] flex-col overflow-hidden rounded-modal border border-line bg-card shadow-modal"
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search size={18} className="text-muted" />
            <input
              autoFocus
              value={q}
              onChange={e => {
                setQ(e.target.value);
                setIdx(0);
              }}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setIdx(i => Math.min(i + 1, items.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setIdx(i => Math.max(i - 1, 0));
                } else if (e.key === 'Enter' && items[idx]) {
                  e.preventDefault();
                  go(items[idx]);
                }
              }}
              placeholder="Buscar servicio, cliente, técnico o pantalla"
              aria-label="Buscar"
              className="h-14 flex-1 bg-transparent text-[15px] text-navy outline-none placeholder:text-faint"
            />
            <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-faint">
              esc
            </kbd>
          </div>
          <div className="overflow-y-auto p-2">
            {items.length === 0 && (
              <p className="px-3 py-8 text-center text-[13.5px] text-muted">
                Sin resultados para “{q}”
              </p>
            )}
            {items.map((it, i) => {
              const header = it.group !== last;
              last = it.group;
              return (
                <div key={`${it.group}-${it.id}`}>
                  {header && (
                    <Kicker className="px-3 pb-1.5 pt-3">{it.group}</Kicker>
                  )}
                  <button
                    type="button"
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => go(it)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${i === idx ? 'bg-panel' : ''}`}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-chip text-muted">
                      <it.icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-navy">
                      {it.label}
                    </span>
                    {it.hint && (
                      <span className="truncate text-[12px] text-muted">
                        {it.hint}
                      </span>
                    )}
                    {i === idx && (
                      <CornerDownLeft size={14} className="text-faint" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 border-t border-line px-4 py-2.5 font-mono text-[11px] text-faint">
            <span>↑↓ moverse</span>
            <span>↵ abrir</span>
            <span>esc cerrar</span>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ── Panel de notificaciones (campana) ── */
const NOTIF_ICON: Record<NotifType, { icon: LucideIcon; tile: string }> = {
  kyc: { icon: IdCard, tile: 'bg-warning-soft text-warning-ink' },
  disputas: { icon: Scale, tile: 'bg-error-soft text-error' },
  tickets: { icon: LifeBuoy, tile: 'bg-info-soft text-primary' },
  contacto: { icon: Mail, tile: 'bg-info-soft text-primary' },
  retiros: { icon: Banknote, tile: 'bg-success-soft text-success' },
  emergencias: { icon: Siren, tile: 'bg-error-soft text-error' },
  servicios: { icon: Wrench, tile: 'bg-warning-soft text-warning-ink' },
  pagos: { icon: CreditCard, tile: 'bg-error-soft text-error' },
  sistema: { icon: Info, tile: 'bg-chip text-muted' },
};
export { NOTIF_ICON };

function NotificationsPanel({
  anchor,
}: {
  anchor: React.RefObject<HTMLElement | null>;
}) {
  const { notifs, setNotifs } = useShell();
  const router = useRouter();
  const { items, unread } = useNotifications();
  const { markRead } = useNotifState();
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setNotifs(false), [setNotifs]);
  useEscape(close, notifs);
  useEffect(() => {
    if (!notifs) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || anchor.current?.contains(t)) return;
      close();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [notifs, close, anchor]);
  if (!notifs) return null;
  return (
    <Portal>
      <div
        ref={panel}
        role="dialog"
        aria-label="Notificaciones"
        className="anim-pop fixed right-4 top-[72px] z-[85] flex max-h-[min(640px,calc(100vh-96px))] w-[440px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-box border border-line bg-card shadow-float"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="font-display text-[16px] font-bold text-navy">
              Notificaciones
            </p>
            <p className="text-[12.5px] text-muted">{unread} sin leer</p>
          </div>
          <button
            type="button"
            disabled={unread === 0}
            onClick={() => markRead(items.map(n => n.id))}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary disabled:opacity-40"
          >
            <CheckCheck size={15} /> Marcar leídas
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 && (
            <p className="px-5 py-10 text-center text-[13.5px] text-muted">
              Todo al día. Sin avisos pendientes.
            </p>
          )}
          {items.slice(0, 12).map(n => {
            const k = NOTIF_ICON[n.type];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  markRead([n.id]);
                  close();
                  router.push(n.href);
                }}
                className="flex w-full items-start gap-3 border-b border-divider px-5 py-3.5 text-left hover:bg-panel"
              >
                <span
                  className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${k.tile}`}
                >
                  <k.icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={`truncate text-[13.5px] text-navy ${n.read ? 'font-medium' : 'font-bold'}`}
                    >
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-muted">
                    {n.body}
                  </span>
                  <span className="mt-1 block font-mono text-[11px] text-faint">
                    {timeAgo(n.ts)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <Link
          href="/notificaciones"
          onClick={close}
          className="border-t border-line px-5 py-3 text-center text-[13px] font-semibold text-primary hover:bg-panel"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </Portal>
  );
}

/* ── Header ── */
function Header({ onMenu, narrow }: { onMenu: () => void; narrow: boolean }) {
  const pathname = usePathname();
  const { setPalette, notifs, setNotifs } = useShell();
  const { theme, toggle } = useTheme();
  const { unread } = useNotifications();
  const bell = useRef<HTMLDivElement>(null);
  const base = '/' + (pathname.split('/')[1] ?? '');
  const isDetail = pathname.split('/').filter(Boolean).length > 1;
  const [group, title] = CRUMB[base] ?? ['Consola', 'Página no encontrada'];
  const shownTitle = isDetail ? (DETAIL_TITLE[base] ?? title) : title;

  return (
    <header className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-line bg-card px-4 md:gap-5 md:px-6">
      <IconButton
        icon={narrow ? MenuIcon : PanelLeft}
        label={narrow ? 'Abrir menú' : 'Menú (⌘B)'}
        onClick={onMenu}
        size={narrow ? 44 : 40}
      />
      <div className="min-w-0">
        <Kicker className="!text-[10px]">{group}</Kicker>
        <p className="truncate font-display text-[16px] font-bold text-navy">
          {shownTitle}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setPalette(true)}
        className="mx-auto hidden h-10 w-full max-w-[480px] items-center gap-2.5 rounded-btn border border-line bg-panel px-3.5 text-left text-[13.5px] text-faint transition-colors hover:border-line-strong md:flex"
      >
        <Search size={16} />
        <span className="flex-1 truncate">
          Buscar servicio, cliente, técnico o pantalla
        </span>
        <kbd className="rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[11px]">
          ⌘K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-2.5 md:ml-0">
        <IconButton
          icon={Search}
          label="Buscar (⌘K)"
          onClick={() => setPalette(true)}
          className="md:hidden"
        />
        <IconButton
          icon={theme === 'dark' ? Sun : Moon}
          label={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          onClick={toggle}
        />
        <div ref={bell}>
          <IconButton
            icon={Bell}
            label="Notificaciones"
            active={notifs}
            badge={unread}
            onClick={() => setNotifs(!notifs)}
          />
        </div>
        <NotificationsPanel anchor={bell} />
      </div>
    </header>
  );
}

/* ── Banner sin conexión ── */
function OfflineBanner() {
  const failed = useWorldFailed();
  const [offline, setOffline] = useState(false);
  const [retrying, setRetrying] = useState(false);
  useEffect(() => {
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', on);
    };
  }, []);
  if (!offline && !failed) return null;
  return (
    <div
      role="alert"
      className="flex items-center gap-3 border-b border-warning-ring bg-warning-soft px-6 py-2.5 text-[13.5px] text-warning-ink"
    >
      <WifiOff size={16} />
      <span className="flex-1 font-medium">
        {offline
          ? 'Sin conexión. Los datos pueden estar desactualizados.'
          : 'No pudimos actualizar los datos.'}
      </span>
      <button
        type="button"
        disabled={retrying}
        onClick={() => {
          setRetrying(true);
          void loadWorld(true).finally(() => setRetrying(false));
        }}
        className="inline-flex items-center gap-1.5 font-semibold hover:underline disabled:opacity-50"
      >
        <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />{' '}
        Reintentar
      </button>
    </div>
  );
}

/* ── Shell ── */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const narrow = useNarrow();
  const { compact, toggleCompact, drawer, setDrawer, setPalette, setNotifs } =
    useShell();
  const hydrateTheme = useTheme(s => s.hydrate);
  const [navigating, setNavigating] = useState(false);
  const first = useRef(true);

  // Tema solo dentro de la consola; al salir (login) se quita.
  useEffect(() => {
    hydrateTheme();
    return () => applyTheme(null);
  }, [hydrateTheme]);
  // Marca en <body> (no en el shell) para que modales/menús en portal también
  // reciban las reglas táctiles de globals.css.
  useEffect(() => {
    document.body.dataset.console = '';
    return () => {
      delete document.body.dataset.console;
    };
  }, []);

  // Primer snapshot del backend al montar la consola (el gate ya validó admin)
  // + realtime (órdenes, disputas, tickets, retiros) y recarga al volver el foco.
  useEffect(() => {
    setErrorNotifier(m => toast.error(m));
    void loadWorld();
    return subscribeRealtime();
  }, []);

  // Al navegar: cierra cajón/paneles y muestra el skeleton de la pantalla 480 ms.
  useEffect(() => {
    setDrawer(false);
    setNotifs(false);
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setNavigating(true);
    const t = setTimeout(() => setNavigating(false), 480);
    return () => clearTimeout(t);
  }, [pathname, setDrawer, setNotifs]);

  // ⌘K paleta · ⌘B menú.
  const onMenu = useCallback(() => {
    if (narrow) setDrawer(!useShell.getState().drawer);
    else toggleCompact();
  }, [narrow, setDrawer, toggleCompact]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'k') {
        e.preventDefault();
        setPalette(!useShell.getState().palette);
      } else if (k === 'b') {
        e.preventDefault();
        onMenu();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onMenu, setPalette]);

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {/* Sidebar en flujo solo en escritorio (>1024px); en celular/tablet vive en el cajón. */}
      <div className="relative z-30 hidden flex-shrink-0 min-[1025px]:block">
        <Sidebar compact={compact} onToggle={onMenu} />
      </div>
      {/* Angosto: versión completa encima con scrim */}
      {narrow && drawer && (
        <>
          <div
            className="anim-fade fixed inset-0 z-[60] bg-[rgba(6,27,58,0.55)] backdrop-blur-[2px]"
            onClick={() => setDrawer(false)}
          />
          <div className="anim-fade fixed inset-y-0 left-0 z-[61]">
            <Sidebar
              compact={false}
              overlay
              onToggle={onMenu}
              onClose={() => setDrawer(false)}
            />
          </div>
        </>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={onMenu} narrow={narrow} />
        <OfflineBanner />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          {navigating ? (
            <ScreenSkeleton kind={screenKind(pathname)} />
          ) : (
            <PageTransition key={pathname}>{children}</PageTransition>
          )}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

/**
 * @deprecated Popover anterior (absoluto, se recorta dentro de contenedores con
 * overflow). Usa `Popover` de `@/components/ds` (fixed + portal). Se conserva
 * para las pantallas aún no rediseñadas.
 */
export function Popover({
  onClose,
  children,
  className = '',
}: {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" />
      <div
        className={`absolute right-0 top-full z-50 mt-2 rounded-xl border border-line bg-card p-1.5 shadow-overlay ${className}`}
      >
        {children}
      </div>
    </>
  );
}
