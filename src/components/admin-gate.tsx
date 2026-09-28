'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { enforceEphemeralSession } from '@/lib/sessionPrefs';
import { Spinner } from '@/components/ui';

/**
 * Console gate: Supabase session + profiles.role === 'admin'.
 * ponytail: client-side gate only (todas las páginas son client components y la
 * data va por RLS) — añadir middleware/SSR cuando haya páginas server-rendered.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    loading,
    session,
    usuario,
    usuarioError,
    isAdmin,
    resolving,
    signOut,
    retryUsuario,
  } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.replace('/login');
  }, [loading, session, router]);

  // "Mantener sesión" desmarcado + navegador cerrado → cerrar sesión.
  useEffect(() => {
    void enforceEphemeralSession();
  }, []);

  // Verificación en 2 pasos: si el admin tiene un factor verificado pero esta
  // sesión sigue en aal1, termina el paso en /login. Sin factor se permite
  // entrar (el login ofrece activarlo).
  // ponytail: gate solo en el cliente; exigir aal2 también en RLS si se quiere
  // blindar la API.
  const [mfaOk, setMfaOk] = useState<boolean | null>(null);
  useEffect(() => {
    if (!session || !isAdmin) return;
    void supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      const needs = data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2';
      if (needs) router.replace('/login?mfa=1');
      setMfaOk(!needs);
    });
  }, [session, isAdmin, router]);

  // Sesión o perfil resolviéndose: spinner, nunca pantalla en blanco (la
  // consulta del perfil tiene timeout y cae al panel de error).
  if (loading || !session || (!usuario && !usuarioError)) return <Resolving />;

  if (usuarioError) {
    return (
      <Panel
        title="No pudimos cargar tu cuenta"
        body={usuarioError.message}
        actionLabel={
          usuarioError.kind === 'transient'
            ? resolving
              ? 'Reintentando…'
              : 'Reintentar'
            : 'Cerrar sesión'
        }
        busy={resolving}
        onAction={() => {
          if (usuarioError.kind === 'transient') void retryUsuario();
          else void signOut().then(() => router.replace('/login'));
        }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <Panel
        title="Acceso restringido"
        body="Esta consola es solo para cuentas administradoras."
        actionLabel="Cerrar sesión"
        onAction={() => void signOut().then(() => router.replace('/login'))}
      />
    );
  }

  if (!mfaOk) return <Resolving />;

  return <>{children}</>;
}

function Panel({
  title,
  body,
  actionLabel,
  onAction,
  busy,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  busy?: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 text-center shadow-card">
        <h1 className="font-display text-lg font-semibold text-navy">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <button
          onClick={onAction}
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function Resolving() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-app"
      role="status"
      aria-label="Cargando tu cuenta"
    >
      <Spinner className="text-primary" />
    </div>
  );
}
