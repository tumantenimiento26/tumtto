'use client';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { X, type LucideIcon } from 'lucide-react';

/** Monta en document.body (overlays fuera de contenedores con scroll/transform). */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

/** Escape cierra (paleta, modales, sheets, menús). */
export function useEscape(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onEscape, active]);
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
 * y cierra con clic fuera o Escape.
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
}: {
  anchor: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: Align;
  width?: number | 'anchor';
  className?: string;
  offset?: number;
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

  useEscape(onClose, open);

  if (!open) return null;
  return (
    <Portal>
      <div
        ref={panel}
        role="dialog"
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
  return (
    <div role="menu" className="min-w-[180px] p-1.5">
      {items.map((it, i) =>
        it === 'divider' ? (
          <div key={i} className="my-1 h-px bg-divider" />
        ) : (
          <button
            key={it.label}
            role="menuitem"
            type="button"
            disabled={it.disabled}
            onClick={() => {
              onClose();
              it.onSelect();
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors disabled:opacity-40 ${
              it.destructive
                ? 'text-error hover:bg-error-soft'
                : 'text-navy hover:bg-panel'
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
  useEscape(close, open);
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
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="anim-modal pointer-events-auto w-full max-w-[var(--modal-w)] rounded-modal border border-line bg-card p-6 shadow-modal max-[640px]:flex max-[640px]:max-w-none max-[640px]:flex-col max-[640px]:overflow-y-auto max-[640px]:rounded-none max-[640px]:border-0"
          style={{ '--modal-w': `${width}px` } as React.CSSProperties}
        >
          {Icon && (
            <div
              className={`mb-4 grid h-[52px] w-[52px] place-items-center rounded-xl ${tile}`}
            >
              <Icon size={24} />
            </div>
          )}
          <h2 className="font-display text-[19px] font-extrabold tracking-[-0.3px] text-navy">
            {title}
          </h2>
          {description && (
            <div className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
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
  useEscape(onClose, open);
  useScrollLock(open);
  if (!open) return null;
  return (
    <Portal>
      <Scrim onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="anim-sheet fixed inset-y-0 right-0 z-[81] flex w-full flex-col border-l border-line bg-card shadow-sheet"
        style={{ maxWidth: width }}
      >
        <header className="flex items-start gap-3 border-b border-line px-6 py-5">
          <div className="min-w-0 flex-1">
            {kicker && (
              <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-primary">
                {kicker}
              </p>
            )}
            <h2 className="font-display text-[18px] font-extrabold tracking-[-0.3px] text-navy">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
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
