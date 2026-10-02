# Tumantenimiento · Web

Plataforma mexicana de servicios de mantenimiento a domicilio (ZMG · Guadalajara).
Este repo contiene la **web**: la landing pública de marketing y la **consola de
administración** (operación, soporte, finanzas y configuración), conectada al
backend real de Supabase ([Thummimlabs/tumtto-backend](https://github.com/Thummimlabs/tumtto-backend)).

> Los prototipos navegables y el PRD que vivían en este repo están archivados en la
> rama [`prototipos`](https://github.com/Thummimlabs/tumtto/tree/prototipos).
> La app móvil (Cliente / Técnico) vive en
> [Thummimlabs/tumtto-mobile](https://github.com/Thummimlabs/tumtto-mobile).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 (tokens CSS-first en
`globals.css`) · framer-motion · lucide-react · Mapbox GL · Zustand ·
Supabase (`@supabase/ssr`, cliente de navegador) · pnpm 11 · Node ≥ 22.

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Landing pública (hero, categorías, cómo funciona, mapa de cobertura, precios, únete como técnico, FAQ) |
| `/login` | Acceso de administradores (correo + contraseña + TOTP obligatorio) |
| `/restablecer` | Fija la contraseña desde el enlace de invitación o de recuperación |
| `/dashboard` | Consola admin — panel de control |
| `/clientes` `/tecnicos` `/servicios` `/catalogo` `/regiones` `/finanzas` `/soporte` `/reportes` `/config` | Secciones de la consola (`/finanzas` y `/config` solo para `super_admin`) |
| `/estados` | Galería de estados/errores (solo en desarrollo) |

## Acceso

- **Login real**: usuarios con `profiles.role = 'admin'` del proyecto Supabase (los admins
  del `seed.sql` del backend en local/staging; en producción los invitados desde
  Config › Equipo). No hay credenciales demo.
- **MFA obligatoria**: al primer acceso la consola pide enrolar TOTP (Google
  Authenticator, 1Password, Authy); no se puede posponer. `AdminGate` manda a
  `/login?mfa=1` a cualquier sesión sin factor verificado o en `aal1`.
- **Roles** (`app_metadata.admin_role`): `super_admin` (todo), `soporte`, `onboarding`
  (KYC), `legal` (disputas). Sin claim → `super_admin` (admins anteriores). El mapa de
  permisos vive en `src/lib/rbac.ts` y se refleja en Config › Equipo.
- **Gate solo en cliente**: todas las páginas son client components y los datos van
  por RLS/RPC con la sesión del admin. Falta el middleware SSR (cookies con
  `@supabase/ssr`) para bloquear el HTML de la consola antes de hidratar; queda
  anotado como pendiente.

## Correr en local

```bash
pnpm install
cp .env.example .env.local   # llena las variables de abajo
pnpm dev                     # http://localhost:3000
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.…   # mapas; sin token hay placeholder
# opcionales (smoke de integración): TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD
```

El cliente de Supabase se crea en el primer uso (no al importar), así que
`pnpm build` pasa aunque falten las variables; en Vercel deben estar definidas
para que la consola funcione.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build |
| `pnpm lint` | ESLint (config flat + plugin de Next) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest (puras: `src/**/*.test.ts`, en zona `America/Mexico_City`) |
| `RUN_INTEGRATION=1 pnpm test` | Además el smoke contra Supabase (`connection.test.ts`) |
| `pnpm gen:types` | Regenera `src/types/supabase.ts` (tras desplegar migraciones) |

## Datos

La consola carga un snapshot paginado (`src/lib/data/store.ts`, `fetchAll` con
`.range()`) de las tablas que usa, se suscribe por Realtime a órdenes, disputas,
tickets y retiros, y recarga al volver el foco. Las escrituras van por RPC
(`approve_payout_requests`, `admin_resolve_dispute`, `upsert_platform_setting`,
`add_admin_note`, `upsert_coverage_zone`…) o Edge Functions (`admin-users`,
`stripe-refund-order`, `stripe-create-payout`). Tablas/RPC que los tipos generados
aún no conocen usan el cast laxo (`RawQuery`/`rawRpc`) marcado con `// types: regen`.

## Estructura

```
src/
  app/
    page.tsx          # landing pública
    login/ restablecer/  # acceso admin (MFA) y alta de contraseña
    (console)/        # consola admin (AdminGate + AdminShell)
      dashboard/ …    # secciones
    globals.css       # design tokens (marca, tipografía, animaciones)
  components/
    ds/               # design system (botones, campos, overlays, tablas)
    admin-gate.tsx    # sesión + rol admin + MFA
    coverage-map.tsx  # mapa de cobertura de la consola (zonas reales, Mapbox)
    landing-map.tsx   # mapa decorativo de la landing
  lib/
    data/store.ts     # snapshot + mutators (Supabase)
    rbac.ts dates.ts geo.ts orderCode.ts …  # lógica pura probada con vitest
    demo/world.ts     # tipos de filas + mundo demo para tests
```

## Versionado

Tags `vX.Y.Z`. Commits en estilo conventional commits (español).
