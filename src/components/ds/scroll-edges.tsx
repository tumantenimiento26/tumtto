'use client';
import { useCallback, useEffect, useState } from 'react';

/** Indicio de desplazamiento horizontal: sombra en el borde que tiene más. */
export function useScrollEdges() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const update = useCallback(() => {
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft > 1;
    const right = max - el.scrollLeft > 1;
    setEdges(e => (e.left === left && e.right === right ? e : { left, right }));
  }, [el]);
  useEffect(() => {
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [el, update]);
  return { ref: setEl, ...edges };
}

/** Sombra de borde (pointer-events: none) para un contenedor con scroll horizontal. */
export function EdgeFade({
  side,
  show,
  className = '',
}: {
  side: 'left' | 'right';
  show: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 z-[3] w-6 from-[rgba(6,27,58,0.12)] to-transparent transition-opacity ${
        side === 'left' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'
      } ${show ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
