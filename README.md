# Tumantenimiento · Web

Plataforma mexicana de servicios de mantenimiento a domicilio (ZMG · Guadalajara).
Este repo contiene la **web**: la landing pública de marketing y la **consola de
administración** (operación, soporte y configuración de la plataforma).

> Los prototipos navegables y el PRD que vivían en este repo están archivados en la
> rama [`prototipos`](https://github.com/Thummimlabs/tumtto/tree/prototipos).
> La app móvil (Cliente / Técnico) vive en
> [Thummimlabs/tumtto-mobile](https://github.com/Thummimlabs/tumtto-mobile).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 (tokens CSS-first en
`globals.css`) · framer-motion · lucide-react · Mapbox GL · Zustand.

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Landing pública (hero con mockups, categorías, stats, cómo funciona, técnicos, mapa de cobertura en vivo, precios, únete como técnico, FAQ) |
| `/login` | Acceso admin (demo) |
| `/dashboard` | Consola admin — panel de control |
| `/clientes` `/tecnicos` `/servicios` `/catalogo` `/regiones` `/finanzas` `/soporte` `/reportes` `/config` | Secciones de la consola |

**Login demo:** `admin@tumantenimiento.mx` · `tumtto2026` — sin backend de auth
todavía; la consola se protege con un flag local (`AdminGate`). Sustituir por
Supabase Auth cuando exista el backend.

## Correr en local

```bash
npm install
# crea .env.local con la variable de abajo
npm run dev        # http://localhost:3000
```

`.env.local`:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.…   # mapa de cobertura; sin token hay placeholder
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Estructura

```
src/
  app/
    page.tsx          # landing pública
    login/            # acceso admin (demo) + splash de entrada
    (console)/        # consola admin (AdminShell + AdminGate)
      dashboard/ …    # secciones
    globals.css       # design tokens (marca, tipografía, animaciones)
  components/
    ui.tsx            # kit de UI (BrandMark, botones, cards, badges…)
    landing-map.tsx   # mapa oscuro de la landing (Mapbox)
    coverage-map.tsx  # mapa de cobertura de la consola (Mapbox)
    charts.tsx        # gráficas de la consola
    motion.tsx        # primitivas de animación (framer-motion)
  lib/
    demo/             # datos demo deterministas de la consola
```

Los datos de la consola son **demo** (semilla determinista); no hay backend
conectado aún. Todo el copy es es-MX.

## Versionado

Tags `vX.Y.Z` (actual: `v0.1.0`). Commits en estilo conventional commits.
