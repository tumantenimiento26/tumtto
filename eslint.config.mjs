// Flat ESLint config para Next 15. Envuelve el preset de Next (todavía basado
// en eslintrc) con FlatCompat, igual que el móvil. Reemplaza `next lint`, que
// quedó deprecado en Next 15 y aquí nunca tuvo configuración: `pnpm lint`
// abría un prompt interactivo y salía con error.
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'next-env.d.ts',
      'eslint.config.mjs',
      'postcss.config.mjs',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Project overrides go here.
    },
  },
];
