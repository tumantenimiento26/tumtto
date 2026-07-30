'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Wrench, FolderTree, Map, Wallet, LifeBuoy,
  BarChart3, Settings, ChevronRight, ChevronDown, LogOut, Search, HelpCircle, Bell, Menu, X,
  type LucideIcon,
} from 'lucide-react';
import { PageTransition } from './motion';
import { BrandMark } from './ui';
import { getOpenSupportCount, useTick } from '@/lib/demo/store';

/**
 * Admin console shell — 240px deep-navy sidebar with active indicator + sub-items,
 * y header de 64px (breadcrumbs, buscador, acciones, pill de usuario). Wraps every
 * console route. Bajo `lg` la sidebar se vuelve cajón off-canvas con scrim.
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

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  useTick();
  const supportCount = getOpenSupportCount();
  return (
    <aside className="flex h-full w-60 flex-col bg-navy text-white">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-[18px] pb-4 pt-5">
        <BrandMark size={28} className="rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-extrabold leading-none">Tumantenimiento</div>
          <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-white/50">Admin Panel</div>
        </div>
        <button onClick={onClose} aria-label="Cerrar menú" className="-mr-1 grid place-items-center rounded-lg p-1.5 hover:bg-white/5 lg:hidden">
          <X size={18} className="text-white/70" />
        </button>
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

function Header({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const base = '/' + (pathname.split('/')[1] ?? '');
  const crumbs = CRUMB[base] ?? CRUMB[pathname] ?? ['Inicio'];
  return (
    <header className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-line bg-white px-4 md:gap-6 md:px-7">
      <button onClick={onMenu} aria-label="Abrir menú" className="-ml-1 grid flex-shrink-0 place-items-center rounded-[10px] border border-line p-2 hover:bg-surface lg:hidden">
        <Menu size={18} className="text-muted" />
      </button>
      {/* Bajo md solo cabe la última miga; el resto es ruido en pantalla chica. */}
      <div className="flex min-w-0 flex-shrink items-center gap-2 text-[13px]">
        {crumbs.map((c, i) => (
          <span key={i} className={`items-center gap-2 ${i === crumbs.length - 1 ? 'flex min-w-0' : 'hidden md:flex'}`}>
            {i > 0 && <ChevronRight size={12} className="hidden flex-shrink-0 text-faint md:block" />}
            <span className={`truncate ${i === crumbs.length - 1 ? 'font-medium text-navy' : 'text-faint'}`}>{c}</span>
          </span>
        ))}
      </div>
      <div className="hidden h-10 max-w-[540px] flex-1 items-center rounded-[10px] border border-line bg-surface md:flex">
        <Search size={16} className="ml-3.5 flex-shrink-0 text-faint" />
        <input placeholder="Buscar por nombre, ID de servicio, email o teléfono…" className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-navy outline-none placeholder:text-faint" />
        <span className="mr-2 hidden rounded-md border border-line bg-white px-1.5 py-0.5 font-mono text-[11px] text-faint lg:block">⌘ K</span>
      </div>
      <div className="ml-auto flex flex-shrink-0 items-center gap-2.5">
        <button aria-label="Buscar" className="grid place-items-center rounded-[10px] border border-line p-2 hover:bg-surface md:hidden"><Search size={18} className="text-muted" /></button>
        <button aria-label="Ayuda" className="hidden place-items-center rounded-[10px] border border-line p-2 hover:bg-surface sm:grid"><HelpCircle size={18} className="text-muted" /></button>
        <button aria-label="Notificaciones" className="relative grid place-items-center rounded-[10px] border border-line p-2 hover:bg-surface">
          <Bell size={18} className="text-muted" />
          <span className="absolute -right-1 -top-1 rounded-full border-2 border-white bg-error px-[5px] text-[10px] font-bold text-white">3</span>
        </button>
        <div className="flex cursor-pointer items-center gap-2.5 rounded-full border border-line bg-white p-1 xl:pr-3">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-primary/[0.12] text-[12px] font-semibold text-primary">{USER.initials}</span>
          <div className="hidden leading-tight xl:block">
            <div className="text-[13px] font-semibold text-navy">{USER.name}</div>
            <div className="text-[11px] text-muted">{USER.role}</div>
          </div>
          <ChevronDown size={14} className="hidden text-faint xl:block" />
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Navegar cierra el cajón; en desktop nunca está abierto porque el aside es estático.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-navy/45 backdrop-blur-[2px] lg:hidden" />}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out motion-reduce:transition-none lg:static lg:translate-x-0 ${open ? 'translate-x-0 shadow-overlay' : '-translate-x-full'}`}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-canvas p-4 sm:p-6 lg:p-7">
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
