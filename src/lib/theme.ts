'use client';
import { create } from 'zustand';

/**
 * Tema claro/oscuro de la consola: `data-theme` en <html>, persistido en
 * localStorage. Las páginas públicas (landing, login, registro) tienen su
 * propio look y no lo aplican; ver THEME_SCRIPT en app/layout.tsx.
 */
export type Theme = 'light' | 'dark';
export const THEME_KEY = 'tumtto-theme';

/** Rutas públicas que ignoran el tema de la consola. */
export const PUBLIC_ROUTE_RE =
  /^\/($|login|registro-tecnico|invitacion|auth|restablecer)/;

export function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* modo privado / sin storage */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyTheme(t: Theme | null) {
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  /** Sincroniza con lo guardado (llamar al montar la consola). */
  hydrate: () => void;
};

export const useTheme = create<ThemeState>((set, get) => ({
  theme: 'light',
  setTheme: t => {
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      /* noop */
    }
    applyTheme(t);
    set({ theme: t });
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
  hydrate: () => {
    const t = readStoredTheme();
    applyTheme(t);
    set({ theme: t });
  },
}));

/** Script inline para <head>: aplica el tema antes de pintar (sin parpadeo). */
export const THEME_SCRIPT = `(function(){try{if(${PUBLIC_ROUTE_RE}.test(location.pathname))return;var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}})()`;
