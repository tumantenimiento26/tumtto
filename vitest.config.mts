import { defineConfig } from 'vitest/config';
import path from 'node:path';

// ponytail: node environment only — the testable logic lives in the demo
// store (pure functions); component/E2E testing needs Playwright, add when
// there's a real auth flow to protect.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    // La consola formatea en hora de la ZMG; los tests construyen fechas
    // locales, así que el proceso corre en esa zona.
    env: { TZ: 'America/Mexico_City' },
    include: ['src/**/*.test.ts'],
  },
});
