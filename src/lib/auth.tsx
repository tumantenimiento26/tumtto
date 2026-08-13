'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

// Mirrors the mobile dual-layer rule: a Supabase session AND a matching
// `profiles` row (id = auth user id). Session without row ≠ authenticated.
export type Usuario = Database['public']['Tables']['profiles']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];

export type UsuarioErrorKind = 'transient' | 'no-account';
export type UsuarioError = { kind: UsuarioErrorKind; message: string };

export type AuthState = {
  session: Session | null;
  usuario: Usuario | null;
  loading: boolean;
  usuarioError: UsuarioError | null;
};

export type AuthContextValue = AuthState & {
  /** Consola = solo staff: sesión válida + profiles.role admin. */
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  retryUsuario: () => Promise<void>;
};

const RETRY_DELAY_MS = 1500;
const MAX_ATTEMPTS = 2;

const TRANSIENT_MESSAGE =
  'No pudimos cargar tu cuenta. Verifica tu conexión e inténtalo de nuevo.';
const NO_ACCOUNT_MESSAGE =
  'No encontramos tu cuenta. Contacta al administrador o cierra sesión.';

async function resolveUsuario(userId: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    usuario: null,
    loading: true,
    usuarioError: null,
  });

  const refreshUsuario = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setState(s => ({ ...s, usuario: null, usuarioError: null }));
      return;
    }
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const usuario = await resolveUsuario(session.user.id);
        if (!usuario) {
          setState(s => ({
            ...s,
            usuario: null,
            usuarioError: { kind: 'no-account', message: NO_ACCOUNT_MESSAGE },
          }));
          return;
        }
        setState(s => ({ ...s, usuario, usuarioError: null }));
        return;
      } catch {
        if (attempt < MAX_ATTEMPTS) await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    }
    setState(s => ({
      ...s,
      usuario: null,
      usuarioError: { kind: 'transient', message: TRANSIENT_MESSAGE },
    }));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(s => ({ ...s, session, loading: false, usuario: null, usuarioError: null }));
      void refreshUsuario(session);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshUsuario]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ session: null, usuario: null, loading: false, usuarioError: null });
  }, []);

  const retryUsuario = useCallback(
    () => refreshUsuario(state.session),
    [refreshUsuario, state.session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAdmin: !!state.session && state.usuario?.role === 'admin',
      signIn,
      signOut,
      retryUsuario,
    }),
    [state, signIn, signOut, retryUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** App-wide auth — must be rendered inside `<AuthProvider>` (root layout). */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth requiere <AuthProvider> (envuélvelo en el layout raíz).');
  return ctx;
}
