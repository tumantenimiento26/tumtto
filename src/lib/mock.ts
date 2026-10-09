// ponytail: modo maqueta solo para `next dev` (NEXT_PUBLIC_MOCK_DATA=1 en .env.local):
// la consola usa el mundo demo de lib/demo/world.ts, sin sesión ni Supabase.
// En build de producción NODE_ENV !== 'development', así que nunca se activa.
export const MOCK =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_MOCK_DATA === '1';
