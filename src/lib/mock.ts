// ponytail: modo maqueta solo para `next dev` (NEXT_PUBLIC_MOCK_DATA=1 en .env.local):
// la consola usa el mundo demo de lib/demo/world.ts, sin sesión ni Supabase.
// En build de producción NODE_ENV !== 'development', así que nunca se activa.
export const MOCK =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_MOCK_DATA === '1';

// ponytail: 2FA de mentira para probar en local (NEXT_PUBLIC_SKIP_MFA=1): el
// admin entra con solo correo + contraseña. Igual que MOCK, solo en `next dev`.
// Requiere admin_require_aal2 = false en el backend (default del seed).
export const SKIP_MFA =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_SKIP_MFA === '1';
