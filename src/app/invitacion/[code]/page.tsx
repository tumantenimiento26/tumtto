import { OpenInApp } from '@/components/open-in-app';
import { PLAY_STORE_URL } from '@/lib/appLinks';

// Enlace de invitación: https://<dominio>/invitacion/CODIGO[?rol=tecnico].
// Con el App Link verificado Android abre la app directo y esta página no se
// ve; es el respaldo (app sin instalar, navegador de escritorio, iOS).
export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const invite = encodeURIComponent(decodeURIComponent(code).toUpperCase());
  // ponytail: sin tienda publicada el respaldo es el registro web; con
  // NEXT_PUBLIC_PLAY_STORE_URL definido, Android va a la tienda.
  const fallbackUrl = PLAY_STORE_URL || `/registro-tecnico?invite=${invite}`;
  return (
    <OpenInApp
      title="Te invitaron a Tumantenimiento"
      body="Abre la invitación en la app para crear tu cuenta. Si aún no la tienes, puedes registrarte desde aquí."
      fallbackUrl={fallbackUrl}
      fallbackLabel={
        PLAY_STORE_URL ? 'Descargar la app' : 'Registrarme en la web'
      }
    />
  );
}
