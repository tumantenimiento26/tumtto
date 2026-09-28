// Digital Asset Links: autoriza a la app Android a abrir los App Links de
// este dominio (android:autoVerify). Sin el SHA-256 del certificado con que se
// firma la app publicada, Android no verifica y abre el navegador.
//   ANDROID_SHA256_CERT_FINGERPRINTS="AA:BB:…,CC:DD:…"
// (Play App Signing: Play Console › Integridad de la app › Firma de apps.)
import { ANDROID_PACKAGE } from '@/lib/appLinks';

export const dynamic = 'force-dynamic';

export function GET() {
  const fingerprints = (process.env.ANDROID_SHA256_CERT_FINGERPRINTS ?? '')
    .split(',')
    .map(f => f.trim().toUpperCase())
    .filter(Boolean);
  const body = fingerprints.length
    ? [
        {
          relation: ['delegate_permission/common.handle_all_urls'],
          target: {
            namespace: 'android_app',
            package_name: ANDROID_PACKAGE,
            sha256_cert_fingerprints: fingerprints,
          },
        },
      ]
    : [];
  return Response.json(body, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
