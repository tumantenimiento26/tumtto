// Inyectado en next.config.ts (env) al compilar.
export const BUILD = {
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0',
  sha: process.env.NEXT_PUBLIC_BUILD_SHA || null,
  builtAt: process.env.NEXT_PUBLIC_BUILD_TIME || null,
  env: process.env.NEXT_PUBLIC_BUILD_ENV ?? 'development',
};

/** Etiqueta y tono del entorno (production/preview/development de Vercel). */
export function envLabel(env: string): { label: string; tone: 'ok' | 'warn' | 'dev' } {
  if (env === 'production') return { label: 'Producción', tone: 'ok' };
  if (env === 'preview') return { label: 'Preview', tone: 'warn' };
  return { label: 'Desarrollo', tone: 'dev' };
}
