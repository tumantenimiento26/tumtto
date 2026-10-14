'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { roleFromMetadata, type AdminRole, type Permission } from '@/lib/rbac';
import {
  canLegacy,
  canSection,
  fullAccess,
  legacyPermissions,
  type MyPermissions,
} from '@/lib/staffRoles';
import { fetchMyPermissions } from '@/lib/data/staff';
import type { Database } from '@/types/supabase';
import { MOCK } from '@/lib/mock';

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
  /** Hay una resolución de perfil en curso (Reintentar deshabilitado). */
  resolving: boolean;
};

export type PermissionsStatus = 'idle' | 'loading' | 'ready';

export type AuthContextValue = AuthState & {
  /** Permisos por sección (my_permissions); null hasta cargarlos. */
  permissions: MyPermissions | null;
  permissionsStatus: PermissionsStatus;
  /** Carga/recarga my_permissions (el gate la llama cuando ya hay 2FA). */
  loadPermissions: () => Promise<void>;
  /** app_metadata.must_change_password: contraseña temporal pendiente. */
  mustChangePassword: boolean;
  /** ¿Puede ver la sección? (admin_sections.slug) */
  canView: (section: string) => boolean;
  /** ¿Puede editar la sección? */
  canEdit: (section: string) => boolean;
  /** Consola = solo staff: sesión válida + profiles.role admin. */
  isAdmin: boolean;
  /** app_metadata.admin_role (fallback super_admin). */
  adminRole: AdminRole;
  /** API anterior: `can('finanzas')` = editar la sección equivalente. */
  can: (perm: Permission) => boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  retryUsuario: () => Promise<void>;
};

const RETRY_DELAY_MS = 1500;
const MAX_ATTEMPTS = 2;
// Sin timeout, una consulta colgada deja la consola en blanco para siempre.
const PROFILE_TIMEOUT_MS = 10_000;

const TRANSIENT_MESSAGE =
  'No pudimos cargar tu cuenta. Verifica tu conexión e inténtalo de nuevo.';
const NO_ACCOUNT_MESSAGE =
  'No encontramos tu cuenta. Contacta al administrador o cierra sesión.';

async function resolveUsuario(userId: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .abortSignal(AbortSignal.timeout(PROFILE_TIMEOUT_MS))
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
    resolving: false,
  });
  // Usuario cuyo perfil ya está cargado (o cargando): los eventos del mismo
  // usuario (TOKEN_REFRESHED, SIGNED_IN al volver a la pestaña) no lo tiran.
  const resolvedFor = useRef<string | null>(null);
  const [permissions, setPermissions] = useState<MyPermissions | null>(null);
  const [permissionsStatus, setPermissionsStatus] =
    useState<PermissionsStatus>('idle');

  const refreshUsuario = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setState(s => ({ ...s, usuario: null, usuarioError: null }));
      return;
    }
    setState(s => ({ ...s, resolving: true }));
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const usuario = await resolveUsuario(session.user.id);
        if (!usuario) {
          setState(s => ({
            ...s,
            usuario: null,
            resolving: false,
            usuarioError: { kind: 'no-account', message: NO_ACCOUNT_MESSAGE },
          }));
          return;
        }
        setState(s => ({ ...s, usuario, usuarioError: null, resolving: false }));
        return;
      } catch {
        if (attempt < MAX_ATTEMPTS)
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      }
    }
    setState(s => ({
      ...s,
      usuario: null,
      resolving: false,
      usuarioError: { kind: 'transient', message: TRANSIENT_MESSAGE },
    }));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const userId = session?.user.id ?? null;
      // Mismo usuario (refresh de token, pestaña que vuelve): solo la sesión.
      // Tirar `usuario` aquí desmontaba la consola y perdía lo capturado.
      if (event !== 'SIGNED_OUT' && userId && userId === resolvedFor.current) {
        setState(s => ({ ...s, session, loading: false }));
        return;
      }
      resolvedFor.current = userId;
      setPermissions(null);
      setPermissionsStatus('idle');
      setState(s => ({
        ...s,
        session,
        loading: false,
        usuario: null,
        usuarioError: null,
      }));
      void refreshUsuario(session);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshUsuario]);

  const loadPermissions = useCallback(async () => {
    setPermissionsStatus('loading');
    const p = await fetchMyPermissions();
    // Si el RPC no responde (migración pendiente) se cae al mapa estático
    // de los roles del sistema en vez de dejar la consola en blanco.
    let fallback: MyPermissions | null = null;
    if (!p) {
      const { data } = await supabase.auth.getSession();
      fallback = legacyPermissions(roleFromMetadata(data.session?.user.app_metadata));
    }
    setPermissions(p ?? fallback);
    setPermissionsStatus('ready');
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? error.message : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    resolvedFor.current = null;
    setPermissions(null);
    setPermissionsStatus('idle');
    setState({
      session: null,
      usuario: null,
      loading: false,
      usuarioError: null,
      resolving: false,
    });
  }, []);

  const retryUsuario = useCallback(
    () => refreshUsuario(state.session),
    [refreshUsuario, state.session],
  );

  const value = useMemo<AuthContextValue>(() => {
    if (MOCK) return mockAuth(signOut);
    const meta = state.session?.user.app_metadata;
    const adminRole = roleFromMetadata(meta);
    return {
      ...state,
      isAdmin: !!state.session && state.usuario?.role === 'admin',
      adminRole,
      permissions,
      permissionsStatus,
      loadPermissions,
      mustChangePassword:
        (meta as { must_change_password?: unknown } | undefined)?.must_change_password === true,
      canView: section => canSection(permissions, section, 'view'),
      canEdit: section => canSection(permissions, section, 'edit'),
      can: perm => canLegacy(permissions, perm),
      signIn,
      signOut,
      retryUsuario,
    };
  }, [state, permissions, permissionsStatus, loadPermissions, signIn, signOut, retryUsuario]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Admin falso para el modo maqueta (ver lib/mock.ts). */
function mockAuth(signOut: () => Promise<void>): AuthContextValue {
  const now = new Date().toISOString();
  return {
    session: { user: { id: 'demo-admin', email: 'demo@tumtto.local', app_metadata: {} } } as Session,
    usuario: {
      id: 'demo-admin',
      full_name: 'Admin (maqueta)',
      phone: null,
      role: 'admin',
      avatar_path: null,
      avatar_icon: 'casco',
      status: 'active',
      stripe_customer_id: null,
      created_at: now,
      updated_at: now,
    } as Usuario,
    loading: false,
    usuarioError: null,
    resolving: false,
    isAdmin: true,
    adminRole: 'super_admin',
    permissions: fullAccess(),
    permissionsStatus: 'ready',
    loadPermissions: async () => {},
    mustChangePassword: false,
    canView: () => true,
    canEdit: () => true,
    can: () => true,
    signIn: async () => ({ error: null }),
    signOut,
    retryUsuario: async () => {},
  };
}

/** App-wide auth — must be rendered inside `<AuthProvider>` (root layout). */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error(
      'useAuth requiere <AuthProvider> (envuélvelo en el layout raíz).',
    );
  return ctx;
}
