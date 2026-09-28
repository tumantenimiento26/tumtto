import { OpenInApp } from '@/components/open-in-app';

// Destino de los correos de Supabase (confirmación de registro) cuando el
// App Link no abrió la app: la manda abrir con los mismos parámetros.
export default function AuthCallbackPage() {
  return (
    <OpenInApp
      title="Confirma tu cuenta en la app"
      body="Abre este enlace desde tu celular con la app de Tumantenimiento instalada para terminar de iniciar sesión."
      fallbackUrl="/"
      fallbackLabel="Ir al inicio"
    />
  );
}
