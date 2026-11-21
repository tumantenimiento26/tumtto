'use client';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { X, type LucideIcon } from 'lucide-react';

const noopSubscribe = () => () => {};

/**
 * Monta en document.body (overlays fuera de contenedores con scroll/transform).
 * En cliente monta en el mismo commit, así los efectos de foco ya encuentran
 * el panel; solo en la hidratación espera al segundo render.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return mounted ? createPortal(children, document.body) : null;
}

/* ── Capas con foco (WCAG 2.4.3 / 2.1.1) ──
   Pila de overlays abiertos: solo la capa de arriba atiende Escape y Tab, así
   un Select abierto dentro de un Sheet cierra solo el Select. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => !el.closest('[inert]') && el.getClientRects().length > 0,
  );
}

type LayerKind = 'modal' | 'dialog' | 'menu' | 'listbox';
interface Layer {
  root: () => HTMLElement | null;
  kind: LayerKind;
  onEscape?: () => void;
  /** menu/listbox: Tab cierra y el foco sigue desde el disparador. */
  onTabOut?: () => void;
}
const layers: Layer[] = [];

function onLayerKey(e: KeyboardEvent) {
  const top = layers[layers.length - 1];
  if (!top) return;
  if (e.key === 'Escape') {
    if (!top.onEscape) return;
    e.preventDefault();
    e.stopPropagation();
    top.onEscape();
    return;
  }
  if (e.key !== 'Tab') return;
  if (top.kind === 'menu' || top.kind === 'listbox') {
    // Sin preventDefault: el navegador mueve el foco desde el disparador.
    top.onTabOut?.();
    return;
  }
  const root = top.root();
  if (!root) return;
  const list = focusables(root);
  const active = document.activeElement as HTMLElement | null;
  if (list.length === 0) {
    e.preventDefault();
    root.focus();
    return;
  }
  const first = list[0];
  const last = list[list.length - 1];
  const inside = !!active && root.contains(active);
  if (e.shiftKey && (!inside || active === first || active === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (!inside || active === last)) {
    e.preventDefault();
    first.focus();
  }
}

const coarse = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches;

/**
 * Registra un overlay en la pila de foco mientras `active`:
 * - al abrir mueve el foco adentro (`initial`: primer control, el propio
 *   panel o nada si el foco se queda en el disparador, p. ej. un Select);
 * - Tab queda atrapado (modal/dialog) o cierra (menu/listbox);
 * - Escape llama `onEscape`; al cerrar devuelve el foco a `returnTo` (o a lo
 *   que estaba enfocado al abrir) si el foco no se fue a otro lado.
 */
export function useFocusLayer(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  {
    kind,
    onEscape,
    onTabOut,
    initial = 'first',
    returnTo,
  }: {
    kind: LayerKind;
    onEscape?: () => void;
    onTabOut?: () => void;
    initial?: 'first' | 'container' | 'none';
    returnTo?: React.RefObject<HTMLElement | null>;
  },
) {
  const cbs = useRef({ onEscape, onTabOut });
  cbs.current = { onEscape, onTabOut };
  useEffect(() => {
    if (!active) return;
    const prev = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const trigger = returnTo?.current ?? prev;
    const layer: Layer = {
      root: () => ref.current,
      kind,
      onEscape: () => cbs.current.onEscape?.(),
      onTabOut: () => cbs.current.onTabOut?.(),
    };
    if (layers.length === 0) document.addEventListener('keydown', onLayerKey, true);
    layers.push(layer);

    if (root && !root.contains(document.activeElement) && initial !== 'none') {
      const pick =
        initial === 'container' || coarse()
          ? null
          : (root.querySelector<HTMLElement>('[data-autofocus]') ??
            (kind === 'menu'
              ? root.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
              : focusables(root).find(el => !el.hasAttribute('data-overlay-close')) ??
                focusables(root)[0]));
      if (pick) pick.focus();
      else {
        if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
        root.focus({ preventScroll: true });
      }
    }

    return () => {
      const i = layers.indexOf(layer);
      if (i >= 0) layers.splice(i, 1);
      if (layers.length === 0) document.removeEventListener('keydown', onLayerKey, true);
      const now = document.activeElement;
      const lost = !now || now === document.body || !!root?.contains(now);
      if (trigger?.isConnected && lost) trigger.focus({ preventScroll: true });
    };
    // `initial`/`kind` solo importan al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

/** Bloquea el scroll del body mientras hay un overlay modal abierto. */
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

type Align = 'start' | 'end';

/**
 * Popover anclado a un elemento, en position:fixed dentro de un portal, así
 * no lo recorta el overflow de tablas/tarjetas. Se reposiciona en scroll/resize
 * y cierra con clic fuera o Escape (el foco vuelve al disparador).
 * `kind`: dialog (foco adentro, Tab circula), menu (foco al primer ítem,
 * flechas, Tab cierra) o listbox (el foco se queda en el disparador o en el
 * buscador; Tab cierra).
 */
export function Popover({
  anchor,
  open,
  onClose,
  children,
  align = 'start',
  width,
  className = '',
  offset = 6,
  kind = 'dialog',
  'aria-label': ariaLabel,
}: {
  anchor: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: Align;
  width?: number | 'anchor';
  className?: string;
  offset?: number;
  kind?: 'dialog' | 'menu' | 'listbox';
  'aria-label'?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; w?: number }>();

  const place = useCallback(() => {
    const a = anchor.current?.getBoundingClientRect();
    if (!a) return;
    const pw =
      width === 'anchor'
        ? a.width
        : (width ?? panel.current?.offsetWidth ?? 240);
    const ph = panel.current?.offsetHeight ?? 0;
    let left = align === 'end' ? a.right - pw : a.left;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    let top = a.bottom + offset;
    // Si no cabe abajo, se abre hacia arriba.
    if (ph && top + ph > window.innerHeight - 8 && a.top - ph - offset > 8)
      top = a.top - ph - offset;
    setPos({ top, left, w: width === 'anchor' ? a.width : undefined });
  }, [anchor, align, width, offset]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || anchor.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose, anchor]);

  useFocusLayer(panel, open, {
    kind,
    onEscape: onClose,
    onTabOut: () => {
      // El foco pasa al disparador y el Tab del navegador sigue desde ahí.
      if (panel.current?.contains(document.activeElement)) anchor.current?.focus();
      onClose();
    },
    initial: kind === 'listbox' ? 'none' : 'first',
    returnTo: anchor,
  });

  if (!open) return null;
  return (
    <Portal>
      <div
        ref={panel}
        role={kind === 'dialog' ? 'dialog' : undefined}
        aria-label={kind === 'dialog' ? ariaLabel : undefined}
        className={`anim-pop fixed z-[90] rounded-box border border-line bg-card shadow-float ${className}`}
        style={{
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          width: pos?.w ?? (typeof width === 'number' ? width : undefined),
        }}
      >
        {children}
      </div>
    </Portal>
  );
}

export type MenuItem = {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

/** Lista de acciones para un Popover (menú ⋯ de filas, menú de usuario). */
export function Menu({
  items,
  onClose,
}: {
  items: (MenuItem | 'divider')[];
  onClose: () => void;
}) {
  // Flechas ↑↓ / Inicio / Fin entre ítems (WAI-ARIA menu); Tab cierra (Popover).
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const list = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled])',
      ),
    );
    if (!list.length) return;
    const i = list.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'ArrowDown'
        ? list[(i + 1) % list.length]
        : e.key === 'ArrowUp'
          ? list[(i - 1 + list.length) % list.length]
          : e.key === 'Home'
            ? list[0]
            : e.key === 'End'
              ? list[list.length - 1]
              : null;
    if (!next) return;
    e.preventDefault();
    next.focus();
  };
  return (
    <div role="menu" className="min-w-[180px] p-1.5" onKeyDown={onKeyDown}>
      {items.map((it, i) =>
        it === 'divider' ? (
          <div key={i} role="separator" className="my-1 h-px bg-divider" />
        ) : (
          <button
            key={it.label}
            role="menuitem"
            type="button"
            tabIndex={-1}
            disabled={it.disabled}
            onClick={() => {
              onClose();
              it.onSelect();
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors focus-visible:-outline-offset-2 disabled:opacity-40 ${
              it.destructive
                ? 'text-error hover:bg-error-soft focus:bg-error-soft'
                : 'text-navy hover:bg-panel focus:bg-panel'
            }`}
          >
            {it.icon && (
              <it.icon
                size={15}
                className={it.destructive ? 'text-error' : 'text-muted'}
              />
            )}
            {it.label}
          </button>
        ),
      )}
    </div>
  );
}

/** Backdrop compartido de Modal/Sheet: navy .55 + blur 3px. */
function Scrim({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      aria-hidden
      className="anim-fade fixed inset-0 z-[80] bg-[rgba(6,27,58,0.55)] backdrop-blur-[3px]"
    />
  );
}

/**
 * Modal centrado (handoff: radio 14, ícono en tile 52×52, título Manrope
 * 19/800, entrada 320 ms). `footer` para los botones (Cancelar + Confirmar).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  tone = 'info',
  children,
  footer,
  width = 440,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  /** false mientras una acción corre (no se cierra con Escape/clic fuera). */
  dismissible?: boolean;
}) {
  const close = useCallback(() => {
    if (dismissible) onClose();
  }, [dismissible, onClose]);
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  useFocusLayer(box, open, { kind: 'modal', onEscape: close });
  useScrollLock(open);
  if (!open) return null;
  const tile = {
    info: 'bg-info-soft text-primary',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning-ink',
    danger: 'bg-error-soft text-error',
  }[tone];
  return (
    <Portal>
      <Scrim onClick={close} />
      {/* Celular (≤640 px): pantalla completa con scroll y botones al pie. */}
      <div className="pointer-events-none fixed inset-0 z-[81] grid place-items-center p-4 max-[640px]:place-items-stretch max-[640px]:p-0">
        <div
          ref={box}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className="anim-modal pointer-events-auto outline-none w-full max-w-[var(--modal-w)] rounded-modal border border-line bg-card p-6 shadow-modal max-[640px]:flex max-[640px]:max-w-none max-[640px]:flex-col max-[640px]:overflow-y-auto max-[640px]:rounded-none max-[640px]:border-0"
          style={{ '--modal-w': `${width}px` } as React.CSSProperties}
        >
          {Icon && (
            <div
              className={`mb-4 grid h-[52px] w-[52px] place-items-center rounded-xl ${tile}`}
            >
              <Icon size={24} />
            </div>
          )}
          <h2
            id={titleId}
            className="font-display text-[19px] font-extrabold tracking-[-0.3px] text-navy"
          >
            {title}
          </h2>
          {description && (
            <div
              id={descId}
              className="mt-1.5 text-[13.5px] leading-relaxed text-muted"
            >
              {description}
            </div>
          )}
          {children && <div className="mt-4">{children}</div>}
          {footer && (
            <div className="mt-6 flex flex-wrap justify-end gap-2.5 max-[640px]:mt-auto max-[640px]:pt-6 max-[640px]:[&>*]:flex-1">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/**
 * Panel lateral derecho a altura completa (filtros 400px, formularios 480px).
 * Header con kicker/título + cerrar, cuerpo con scroll, footer fijo.
 */
export function Sheet({
  open,
  onClose,
  title,
  kicker,
  children,
  footer,
  width = 480,
  footerClassName = '',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 400 | 480 | number;
  /** Para animar el footer (p. ej. `animate-shake` al fallar la validación). */
  footerClassName?: string;
}) {
  const box = useRef<HTMLElement>(null);
  const titleId = useId();
  useFocusLayer(box, open, { kind: 'modal', onEscape: onClose });
  useScrollLock(open);
  if (!open) return null;
  return (
    <Portal>
      <Scrim onClick={onClose} />
      <aside
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="anim-sheet fixed inset-y-0 right-0 z-[81] flex w-full flex-col border-l border-line bg-card shadow-sheet outline-none"
        style={{ maxWidth: width }}
      >
        <header className="flex items-start gap-3 border-b border-line px-6 py-5">
          <div className="min-w-0 flex-1">
            {kicker && (
              <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary">
                {kicker}
              </p>
            )}
            <h2
              id={titleId}
              className="font-display text-[18px] font-extrabold tracking-[-0.3px] text-navy"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            data-overlay-close
            className="grid h-9 w-9 place-items-center rounded-btn text-muted hover:bg-panel hover:text-navy"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer
            className={`flex items-center justify-end gap-2.5 border-t border-line px-6 py-4 ${footerClassName}`}
          >
            {footer}
          </footer>
        )}
      </aside>
    </Portal>
  );
}
