'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Movimiento reducido: `prefers-reduced-motion` o `?movimiento=reducido`.
 * Se resuelve en el cliente (false durante SSR).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const byQuery =
      new URLSearchParams(window.location.search).get('movimiento') ===
      'reducido';
    const update = () => setReduced(byQuery || mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** true cuando el elemento entra en vista (una sola vez). */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  threshold = 0.4,
): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      es => {
        if (es.some(e => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}

/**
 * Reveal on scroll para todos los `[data-reveal="<segundos>"]` dentro de la
 * raíz: agrega `.is-in` al entrar en vista (con su retraso escalonado).
 */
export function useReveal(root: RefObject<HTMLElement | null>, off: boolean) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const all = () =>
      Array.from(host.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (off) {
      all().forEach(el => el.classList.add('is-in'));
      return;
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(
      es => {
        for (const en of es) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          const delay = (parseFloat(el.dataset.reveal ?? '0') || 0) * 1000;
          timers.push(window.setTimeout(() => el.classList.add('is-in'), delay));
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    all().forEach(el => io.observe(el));
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [root, off]);
}

/** Desplaza a una sección compensando el nav fijo. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 64,
    behavior: 'smooth',
  });
}
