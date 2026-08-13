'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/**
 * Console gate: Supabase session + profiles.role === 'admin'.
 * ponytail: client-side gate only (todas las páginas son client components y la
 * data va por RLS) — añadir middleware/SSR cuando haya páginas server-rendered.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, session, usuario, usuarioError, isAdmin, signOut, retryUsuario } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.replace('/login');
  }, [loading, session, router]);

  if (loading || !session) return null;

  // Session up, profile still resolving.
  if (!usuario && !usuarioError) return null;

  if (usuarioError) {
    return (
      <Panel
        title="No pudimos cargar tu cuenta"
        body={usuarioError.message}
        actionLabel={usuarioError.kind === 'transient' ? 'Reintentar' : 'Cerrar sesión'}
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

  return <>{children}</>;
}

function Panel({ title, body, actionLabel, onAction }: {
  title: string; body: string; actionLabel: string; onAction: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 text-center shadow-card">
        <h1 className="font-display text-lg font-semibold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <button
          onClick={onAction}
          className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-2"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
