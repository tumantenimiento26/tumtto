'use client';

import { useEffect, useRef, type AnimationEvent } from 'react';
import {
  categoryIconStylesheet,
  nextIdleDelayMs,
  resolveCategoryIconFirst,
  tileMetrics,
} from '@/lib/categoryIcons';

export type CategoryIconProps = {
  /** Id, nombre, alias o slug de BD (`plumbing`, `cat-plumbing`, «Plomería»…). */
  cat: string | null | undefined;
  /** Candidatos extra si `cat` no se reconoce (p. ej. el nombre de la categoría). */
  fallback?: (string | null | undefined)[];
  size?: number;
  variant?: 'glyph' | 'tile';
  state?: 'inactive' | 'active' | 'disabled';
  motion?: 'auto' | 'hover' | 'loop' | 'none';
  /** Fuerza claro/oscuro (landing, siempre oscura); por defecto sigue data-theme de la consola. */
  theme?: 'light' | 'dark';
  /** Nombre accesible; por defecto el de la categoría. Con `decorative` se oculta. */
  label?: string;
  decorative?: boolean;
  className?: string;
};

const HOST_SELECTOR =
  'button, a, label, [role="button"], [role="tab"], [data-cat-hover]';
const CSS = categoryIconStylesheet();

/** Ícono de categoría animado (handoff «Íconos de categoría Tumtto»). */
export function CategoryIcon({
  cat,
  fallback = [],
  size = 20,
  variant = 'glyph',
  state = 'inactive',
  motion = 'auto',
  theme,
  label,
  decorative,
  className,
}: CategoryIconProps) {
  const def = resolveCategoryIconFirst(cat, ...fallback);
  const ref = useRef<HTMLSpanElement>(null);
  const stopReq = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (motion === 'none' || reduce) return;

    let visible = false;
    let introDone = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let introTimer: ReturnType<typeof setTimeout> | undefined;

    const play = () => {
      stopReq.current = false;
      el.setAttribute('data-play', '');
    };
    // Termina el ciclo en curso antes de detenerse (lo resuelve animationiteration).
    const stop = () => {
      if (motion !== 'loop') stopReq.current = true;
    };
    const once = () => {
      if (el.hasAttribute('data-hover')) return;
      play();
      stopReq.current = true;
    };
    const idle = () => {
      clearTimeout(idleTimer);
      if (motion !== 'auto') return;
      idleTimer = setTimeout(() => {
        if (visible) once();
        idle();
      }, nextIdleDelayMs());
    };
    const on = () => {
      el.setAttribute('data-hover', '');
      play();
    };
    const off = () => {
      el.removeAttribute('data-hover');
      stop();
    };

    if (motion === 'loop') el.setAttribute('data-play', '');
    const host = el.closest(HOST_SELECTOR) ?? el.parentElement;
    host?.addEventListener('pointerenter', on);
    host?.addEventListener('focusin', on);
    host?.addEventListener('pointerleave', off);
    host?.addEventListener('focusout', off);

    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        entries => {
          visible = entries.some(e => e.isIntersecting);
          if (visible && !introDone) {
            introDone = true;
            el.setAttribute('data-in', '');
            introTimer = setTimeout(once, 380);
          }
        },
        { threshold: 0.5 },
      );
      io.observe(el);
    } else {
      visible = true;
    }
    idle();

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(introTimer);
      io?.disconnect();
      host?.removeEventListener('pointerenter', on);
      host?.removeEventListener('focusin', on);
      host?.removeEventListener('pointerleave', off);
      host?.removeEventListener('focusout', off);
      el.removeAttribute('data-play');
      el.removeAttribute('data-hover');
    };
  }, [motion, def.id]);

  const onIteration = (e: AnimationEvent<HTMLSpanElement>) => {
    if (!stopReq.current || !e.animationName.startsWith('tm-')) return;
    stopReq.current = false;
    e.currentTarget.removeAttribute('data-play');
  };

  const tile = variant === 'tile';
  const { side, radius } = tileMetrics(size);
  const svg = (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: def.svgInner }}
    />
  );

  return (
    <>
      <style href="tmci-styles" precedence="default">
        {CSS}
      </style>
      <span
        ref={ref}
        className={`tmci${className ? ` ${className}` : ''}`}
        data-cat={def.id}
        data-state={state}
        data-variant={variant}
        data-tm-theme={theme}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : (label ?? def.name)}
        aria-hidden={decorative ? true : undefined}
        style={{ ['--tmci-dur' as string]: `${def.durationSec}s` }}
        onAnimationIteration={onIteration}
      >
        <span className="tmci-wrap">
          {tile ? (
            <span
              className="tmci-tile"
              style={{ width: side, height: side, borderRadius: radius }}
            >
              {svg}
            </span>
          ) : (
            <span className="tmci-glyph">
              <span className="tmci-glow" />
              {svg}
            </span>
          )}
        </span>
      </span>
    </>
  );
}
