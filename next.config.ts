import type { NextConfig } from 'next';
import pkg from './package.json';

// CSP: la consola habla solo con Supabase (REST/Realtime/Storage), Mapbox y
// Google Fonts. `unsafe-inline`/`unsafe-eval` en script por el runtime de Next
// y Mapbox GL; frame-ancestors 'none' sustituye a X-Frame-Options.
// Also allow the configured Supabase origin so a local/self-hosted stack works.
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;
const SB_HTTP = SUPABASE ? ` ${SUPABASE.origin}` : '';
const SB_WS = SUPABASE ? ` ${SUPABASE.origin.replace(/^http/, 'ws')}` : '';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
  'font-src \'self\' data: https://fonts.gstatic.com',
  `img-src 'self' data: blob: https://*.supabase.co${SB_HTTP} https://api.mapbox.com https://*.tiles.mapbox.com`,
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${SB_HTTP}${SB_WS} https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com`,
  "worker-src 'self' blob:",
  "child-src blob:",
  // TUM-03: vista previa del comprobante PDF (URL firmada de Storage; blob: en maqueta).
  `frame-src 'self' blob: https://*.supabase.co${SB_HTTP}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  // Datos de la compilación que muestra el login de la consola (lib/buildInfo).
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_SHA: (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7),
    NEXT_PUBLIC_BUILD_ENV: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  // TUM-03: «Revisión de efectivo» ahora es la pestaña Efectivo de «Revisión de pagos».
  async redirects() {
    return [{ source: '/revision-efectivo', destination: '/revision-pagos?tab=efectivo', permanent: false }];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
