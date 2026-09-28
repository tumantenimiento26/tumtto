# Rediseño web — contrato de implementación (fase 1: base)

Handoff: `README.md` (tokens, pantallas, tiempos) · capturas en `screenshots/` ·
prototipos en `design_files/` (abrir `Web Prototipo.dc.html`; la consola acepta
`#s=<pantalla>`). Este documento describe **la base ya construida** y las reglas
para las pantallas.

## Reglas para agentes de pantallas

1. **No edites archivos compartidos**: `src/app/globals.css`, `src/app/layout.tsx`,
   `src/components/ds/**`, `src/components/admin-shell.tsx`,
   `src/components/toast.tsx`, `src/lib/theme.ts`, `src/lib/calendar.ts`,
   `src/lib/table.ts`, `src/lib/orderCode.ts`, `src/lib/data/notifications.ts`.
   Si necesitas algo nuevo y reutilizable, créalo junto a tu pantalla
   (`src/app/(console)/<ruta>/_components/…`) y menciónalo en tu reporte.
2. Importa las primitivas de **`@/components/ds`**. Lo viejo
   (`@/components/ui`, `@/components/admin`) sigue compilando, pero migra tus
   pantallas a `ds`.
3. **Colores solo por tokens** (`bg-card text-navy border-line …`). Nada de
   `bg-white`, `text-[#…]` ni `dark:` para superficies: los tokens cambian solos
   con `data-theme="dark"`. Excepción: el sidebar y la banda del dashboard usan
   `bg-sidebar` / `bg-deep` (siempre oscuros).
4. **Tipografía**: `font-display` (Manrope, títulos/montos/botones, `font-bold` o
   `font-extrabold`), `font-sans` (Inter, cuerpo), `font-mono` (JetBrains Mono:
   kickers, encabezados de tabla, IDs, montos de tabla). KPIs con `tabular`.
5. Datos desde `src/lib/data/store.ts` (getters + mutators). Donde el backend no
   soporta algo del diseño, implementa la UI y deja `ponytail:`/TODO explicando
   qué falta. **No escribas en producción** para probar.
6. Revisa cada pantalla en **claro y oscuro** (botón de luna en el header).
7. Checks: `pnpm typecheck`, `pnpm lint` (0 errores), `pnpm vitest run`
   (`connection.test.ts` falla desde antes: contraseña admin de prod). Vitest no
   compila TSX: la lógica pura va en `src/lib/*.ts` con su `*.test.ts`.

## Tema

- Tokens en `globals.css` `@theme` (claro) y `[data-theme='dark']` (oscuro).
- `@/lib/theme`: `useTheme()` → `{ theme, setTheme, toggle, hydrate }`;
  persistido en `localStorage['tumtto-theme']`. `THEME_SCRIPT` (en `<head>`)
  lo aplica antes de pintar **solo en rutas de consola**; landing, login,
  registro, invitación y auth quedan en claro (`PUBLIC_ROUTE_RE`).
- Variante `dark:` disponible (`@custom-variant dark`) para casos puntuales.

### Tokens principales (claro → oscuro)

| Token | Uso |
|---|---|
| `page` | fondo de la consola |
| `card` | tarjetas, inputs, popovers |
| `panel` | header de tabla, hover de fila |
| `segment` / `chip` | fondo de segmentado / chip gris |
| `line` / `divider` / `line-strong` | borde / divisor / borde de botón secundario |
| `navy` | texto principal (claro #0E2C56 → #E8EEF7) |
| `body` / `muted` / `faint` | cuerpo / secundario / sutil |
| `action` (+`-hover`/`-pressed`) | fondo del botón primario (navy → azul) |
| `primary` | acento, links (#0A6BCF → #5AB0FF) |
| `approve` | botón aprobar |
| `success` `warning-ink` `error` + `-soft` (+`-ring`/`-line`) | estados |
| `info-soft` `tint` | fondos informativos / fila seleccionada |
| `sidebar` `deep` `tooltip` | sidebar, banda del dashboard, tooltips/snackbar |
| `bar-idle` `cyan` | barras no seleccionadas / kickers e indicadores |
| `lp-*` | landing (azul fijo): `lp-page #050F22`, `lp-card`, `lp-line`, `lp-band`, `lp-footer`, `lp-text`, `lp-body`, `lp-muted` |

Sombras: `shadow-float`, `shadow-modal`, `shadow-sheet`, `shadow-kpi`,
`shadow-focus`. Radios: `rounded-box` (12), `rounded-btn` (10),
`rounded-modal` (14). Animaciones: `animate-up`, `animate-pop`,
`animate-shake`, clases `anim-modal`, `anim-sheet`, `anim-pop`, `anim-toast`,
`anim-snack`, `anim-fade`. Utilidades: `tabular`, `skeleton`.

## Primitivas (`@/components/ds`)

| Componente | Props clave |
|---|---|
| `Button` | `variant` primary/approve/secondary/destructive/ghost · `size` sm/md/lg · `icon`, `iconRight` (Lucide) · `loading` · `href` · `full` |
| `IconButton` | `icon`, `label` (obligatorio, a11y), `badge` (número rojo o `true` = punto cian), `active` |
| `Input` | `icon`, `prefix` ("$", "+52"), `suffix`, `error` (bool o texto), `label`, `hint`; ref al `<input>` |
| `Field` | envoltura label + control + hint/error |
| `Textarea`, `Checkbox` (`indeterminate`) | |
| `Select` | `options: {value,label,hint?}[]`, `value`, `onChange`; buscador automático con >5 opciones, ↑↓↵, "Sin coincidencias" |
| `DatePicker` | `value: Date\|null`, `onChange`, `disablePast` (default true); presets Hoy/Mañana/En 2 días/Próximo lunes |
| `DateRangePicker` | `value: DateRange` (`{from,to}\|null`), `onChange`; presets + calendario de rango. Filtra con `inRange(fecha, rango)`; texto con `rangeLabel` |
| `Kicker` | mono mayúsculas; `tone` muted/primary/cyan |
| `PageHeader` | `title`, `description`, `actions`, `kicker` (H1 27/800) |
| `Card` | `padded`, `hover` (elevación KPI), `onClick` |
| `Segmented` | `options` (strings o `{value,label}`), `value`, `onChange`, `size` |
| `Toggle` | `checked`, `onChange`, `label` (knob 250 ms) |
| `Chip` | `active`, `onClick`, `onRemove` (✕), `icon`, `count` |
| `Badge` | `tone` neutral/info/success/warning/danger/navy, `dot`, `mono` (URGENTE/KYC) |
| `Tabs` | `tabs: {value,label,count?}[]`, `value`, `onChange` |
| `Skeleton`, `ScreenSkeleton kind=dashboard\|list\|detail`, `IndeterminateBar` | |
| `EmptyState` | `kind` first-use/no-results/all-clear/action, `title`, `description`, `action`, `compact` |
| `ErrorPage` | `kind` 404/500/offline/403/maintenance/session, `primary`/`secondary` `{label, href?, onClick?}`, `reference` |
| `ErrorIllustration` | la ilustración sola (catálogo de Estados) |
| `Modal` | `open`, `onClose`, `title`, `description`, `icon`, `tone`, `footer`, `width`, `dismissible` (false mientras corre una acción) |
| `Sheet` | panel derecho: `open`, `onClose`, `title`, `kicker`, `footer`, `width` 400/480, `footerClassName` (p. ej. `animate-shake` al fallar la validación) |
| `Popover` | anclado (`anchor` ref), fixed en portal, `align` start/end, `width` número o `'anchor'`; cierra con clic fuera/Escape |
| `Menu` | `items: ({label, icon?, onSelect, destructive?, disabled?} \| 'divider')[]` dentro de un Popover |
| `Portal`, `useEscape` | utilidades |
| `DataTable` | ver abajo |

### DataTable

```tsx
<DataTable
  rows={rows}
  rowKey={r => r.id}
  columns={[
    { key: 'id', header: 'Servicio', render: r => orderCode(r.id), sortValue: r => r.created_at },
    { key: 'total', header: 'Total', align: 'right', render: r => money(r.total), sortValue: r => r.total },
  ]}
  onRowClick={r => router.push(`/servicios/${r.id}`)}
  selectable
  bulkActions={(selected, clear) => <Button size="sm" …>Exportar</Button>}
  rowMenu={r => [{ label: 'Ver', icon: Eye, onSelect: … }, 'divider', { label: 'Cancelar', destructive: true, onSelect: … }]}
  pageSize={8}
  loading={!ready}
  empty={<EmptyState kind="no-results" … />}
/>
```

Orden con flecha que rota (asc → desc → sin orden), selección por página con
estado indeterminado, barra masiva, menú ⋯ en popover fixed (no lo recorta el
scroll), paginación con ventana de 5 páginas. Lógica pura en `src/lib/table.ts`.

## Avisos

```ts
import { toast, snackbar } from '@/components/ds'; // o '@/components/toast'
toast.success('Técnico aprobado', 'Ya puede recibir solicitudes');
toast.error('No se pudo guardar', 'Revisa tu conexión', { label: 'Reintentar', onClick: retry });
toast.info(…); toast.warning(…); toast.offline();
toast.local('Nota agregada'); // dominio sin tabla en backend
toast.show({ kind, title, sub, action, duration });
snackbar.show('Servicio cancelado', { undo: () => restore() }); // 5 s, abajo al centro
```

Pila arriba a la derecha (top 76px), máx. 4, barra 4.2 s (error 6 s) que se
pausa con el cursor, "Cerrar todas" con 2+. `<Toasts/>` ya está montado en
`(console)/layout.tsx`; en páginas públicas móntalo tú si lo necesitas.

## Shell (`admin-shell.tsx`)

- Sidebar 256 ↔ riel 76 (persistido), toggle a mitad del borde, botón del
  header y **⌘B**. Bajo 1100px: riel en flujo + versión completa encima con scrim.
- Grupos General (Dashboard, Notificaciones) · Usuarios · Operación · Analítica
  · Sistema (Catálogo, Configuración, Estados y errores). Badges: no leídas,
  KYC pendientes, soporte abierto (en el riel → punto cian).
- Header: migas (`CRUMB` en el shell; si agregas una ruta nueva, pide al
  integrador que la añada), buscador → **paleta ⌘K** (pantallas, servicios,
  clientes, técnicos; ↑↓↵, Escape), tema, campana → panel de 440px.
- Al navegar muestra `ScreenSkeleton` 480 ms según la ruta y un banner
  "Sin conexión / No pudimos actualizar" con Reintentar.
- `useShell()` expone `{ compact, palette, notifs, setPalette, setNotifs, … }`.

## Notificaciones (`@/lib/data/notifications`)

`derive()` arma avisos desde el snapshot (KYC pendiente, disputas abiertas,
tickets, pagos fallidos, solicitudes >15 min sin técnico). `useNotifications()`
→ `{ items, unread }` (sin eliminadas ni tipos silenciados). Estado en
`useNotifState()`: `markRead/markUnread/remove/restore/setMuted` (localStorage).
`NOTIF_TYPES`, `timeAgo()`, y `NOTIF_ICON` (exportado del shell) para íconos.
ponytail: no hay notificaciones de admin en el backend; `public.notifications`
existe por usuario pero nada genera filas para admins.

## Utilidades

- `@/lib/orderCode`: `orderCode(uuid)` → `SVC-2851` (etiqueta estable derivada
  del uuid; la navegación sigue usando el uuid).
- `@/lib/calendar`: `monthGrid`, `rangePreset`, `inRange`, `nextMonday`, formatos.
- `@/lib/table`: `sortRows`, `pageWindow`.

## Rutas stub creadas

`(console)/notificaciones` y `(console)/estados` existen con contenido mínimo
para que la navegación no dé 404; las completa el agente de pantallas.
