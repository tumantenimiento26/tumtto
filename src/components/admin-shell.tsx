'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Wrench, FolderTree, Map, Wallet, LifeBuoy,
  BarChart3, Settings, ChevronRight, ChevronDown, LogOut, Search, HelpCircle, Bell,
  type LucideIcon,
} from 'lucide-react';
import { PageTransition } from './motion';
import { BrandMark } from './ui';
import { getOpenSupportCount, useTick } from '@/lib/demo/store';

/**
 * Desktop admin console shell — mirrors admin-shell.jsx: 240px deep-navy sidebar
 * with active indicator + sub-items, and a 64px top header (breadcrumbs, command
 * search, actions, user pill). Wraps every console route.
 */
const USER = { name: 'Sofía Martínez', role: 'Admin Soporte', initials: 'SM' };

interface NavItem { href: string; icon: LucideIcon; label: string; live?: boolean; sub?: { href: string; label: string }[] }
const NAV: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clientes', icon: Users, label: 'Usuarios', sub: [{ href: '/clientes', label: 'Clientes' }, { href: '/tecnicos', label: 'Técnicos' }] },
  { href: '/servicios', icon: Wrench, label: 'Servicios' },
  { href: '/catalogo', icon: FolderTree, label: 'Catálogo' },
  { href: '/regiones', icon: Map, label: 'Regiones y cobertura' },
  { href: '/finanzas', icon: Wallet, label: 'Finanzas' },
  { href: '/soporte', icon: LifeBuoy, label: 'Soporte y disputas', live: true },
  { href: '/reportes', icon: BarChart3, label: 'Reportes' },
  { href: '/config', icon: Settings, label: 'Configuración' },
];

// pathname -> breadcrumb trail
const CRUMB: Record<string, string[]> = {
  '/dashboard': ['Inicio', 'Dashboard'],
  '/clientes': ['Usuarios', 'Clientes'],
  '/tecnicos': ['Usuarios', 'Técnicos'],
  '/servicios': ['Operación', 'Servicios'],
  '/catalogo': ['Configuración', 'Catálogo'],
  '/regiones': ['Operación', 'Regiones y cobertura'],
  '/finanzas': ['Operación', 'Finanzas'],
  '/soporte': ['Operación', 'Soporte y disputas'],
  '/reportes': ['Analítica', 'Reportes'],
  '/config': ['Configuración', 'General'],
};

function useActive(href: string, pathname: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
}

function Sidebar() {
  const pathname = usePathname();
  useTick();
  const supportCount = getOpenSupportCount();
  return (
    <aside className="flex h-screen w-60 flex-col bg-navy text-white">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-[18px] pb-4 pt-5">
        <BrandMark size={28} className="rounded-lg" />
        <div>
          <div className="font-display text-sm font-extrabold leading-none">Tumantenimiento</div>
          <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-white/50">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV.map(it => {
          const active = useActive(it.href, pathname);
          const subOpen = it.sub?.some(s => useActive(s.href, pathname));
          const Icon = it.icon;
          return (
            <div key={it.label}>
              <Link href={it.href} className={`relative mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${active || subOpen ? 'bg-primary/20' : 'hover:bg-white/5'}`}>
                {(active || subOpen) && <span className="absolute -left-3 bottom-1.5 top-1.5 w-[3px] rounded bg-cyan" />}
                <Icon size={18} className={active || subOpen ? 'text-white' : 'text-white/75'} strokeWidth={1.75} />
                <span className={`flex-1 text-[13.5px] font-medium ${active || subOpen ? 'text-white' : 'text-white/[0.78]'}`}>{it.label}</span>
                {it.live && supportCount > 0 && <span className="rounded-full bg-error/[0.18] px-[7px] py-px text-[11px] font-semibold text-error-soft">{supportCount}</span>}
                {it.sub && (subOpen ? <ChevronDown size={14} className="text-white/50" /> : <ChevronRight size={14} className="text-white/50" />)}
              </Link>
              {it.sub && subOpen && (
                <div className="mb-1.5 ml-[38px] mt-0.5">
                  {it.sub.map(s => {
                    const sActive = useActive(s.href, pathname);
                    return (
                      <Link key={s.href} href={s.href} className={`block rounded-md px-3 py-1.5 text-[12.5px] ${sActive ? 'bg-cyan/10 font-semibold text-cyan' : 'text-white/60 hover:text-white/90'}`}>{s.label}</Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-4 py-3.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/30 text-[12px] font-semibold">{USER.initials}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold">{USER.name}</div>
          <div className="text-[11px] text-white/55">{USER.role}</div>
        </div>
        <Link href="/login" onClick={() => localStorage.removeItem('tumtto-admin')} aria-label="Cerrar sesión" className="grid place-items-center rounded-lg border border-white/[0.08] p-1.5 hover:bg-white/5"><LogOut size={16} className="text-white/70" /></Link>
      </div>
    </aside>
  );
}

function Header() {
  const pathname = usePathname();
  const base = '/' + (pathname.split('/')[1] ?? '');
  const crumbs = CRUMB[base] ?? CRUMB[pathname] ?? ['Inicio'];
  return (
    <header className="flex h-16 flex-shrink-0 items-center gap-6 border-b border-line bg-white px-7">
      <div className="flex flex-shrink-0 items-center gap-2 text-[13px]">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={12} className="text-faint" />}
            <span className={i === crumbs.length - 1 ? 'font-medium text-navy' : 'text-faint'}>{c}</span>
          </span>
        ))}
      </div>
      <div className="flex h-10 max-w-[540px] flex-1 items-center rounded-[10px] border border-line bg-surface">
        <Search size={16} className="ml-3.5 text-faint" />
        <input placeholder="Buscar por nombre, ID de servicio, email o teléfono…" className="flex-1 bg-transparent px-3 text-[13px] text-navy outline-none placeholder:text-faint" />
        <span className="mr-2 rounded-md border border-line bg-white px-1.5 py-0.5 font-mono text-[11px] text-faint">⌘ K</span>
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <button aria-label="Ayuda" className="grid place-items-center rounded-[10px] border border-line p-2 hover:bg-surface"><HelpCircle size={18} className="text-muted" /></button>
        <button aria-label="Notificaciones" className="relative grid place-items-center rounded-[10px] border border-line p-2 hover:bg-surface">
          <Bell size={18} className="text-muted" />
          <span className="absolute -right-1 -top-1 rounded-full border-2 border-white bg-error px-[5px] text-[10px] font-bold text-white">3</span>
        </button>
        <div className="flex cursor-pointer items-center gap-2.5 rounded-full border border-line bg-white py-1 pl-1 pr-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/[0.12] text-[12px] font-semibold text-primary">{USER.initials}</span>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-navy">{USER.name}</div>
            <div className="text-[11px] text-muted">{USER.role}</div>
          </div>
          <ChevronDown size={14} className="text-faint" />
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-canvas p-7">
          {/* Re-key on route change so content re-animates on navigation.
              No AnimatePresence here: route-level presence tracking flakily
              leaves the entering page frozen at opacity 0 after many
              navigations. Keyed remount plays the enter animation reliably. */}
          <PageTransition key={pathname}>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
