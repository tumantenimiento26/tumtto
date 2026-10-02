// Flat ESLint config para Next 15. Envuelve el preset de Next (todavía basado
// en eslintrc) con FlatCompat, igual que el móvil. Reemplaza `next lint`, que
// quedó deprecado en Next 15 y aquí nunca tuvo configuración: `pnpm lint`
// abría un prompt interactivo y salía con error.
// No ignorar este archivo: `next build` detecta el plugin de Next calculando
// la config de eslint.config.mjs; ignorado, avisa "plugin not detected".
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  {
    ignores: [
      'node_modules/',
      // Prototipos HTML/JS del handoff (referencia, no código de la app).
      'docs/',
      '.next/',
      'out/',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Project overrides go here.
    },
  },
];

export default config;
