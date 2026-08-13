# Contexto de proyecto — Tumantenimiento (tumtto)

> Proyecto `tumtto` · generado del análisis del repositorio.
> Fuente de verdad para agentes.

## Contexto

<!--thummim {"t":"doc","kind":"negocio","titulo":"Lógica de negocio","orden":1}-->
### Lógica de negocio

**Qué es.** Marketplace de tres lados para servicios de mantenimiento a domicilio
(plomería, electricidad, gas, aire acondicionado, electrodomésticos, cerrajería) en
la Zona Metropolitana de Guadalajara. Tres audiencias: **Cliente** y **Técnico
(PRO)** en la app móvil, **Admin** en la consola web (y una vista admin ligera en
móvil). Moneda **MXN**, copy **es-MX**, mercado **México**.

Fuentes contractuales dentro del repo:
`tumtto/PRD_Plataforma_Servicios_Mantenimiento.docx` (PRD v1.0 — MVP) y
`tumtto/DECISIONS.md` (decisiones de producto confirmadas por el cliente el
2026-07-21, que **sobrescriben** al PRD y a los prototipos donde se contradigan).

**Qué se contrató (PRD §2.1).** App móvil multi-rol iOS+Android con tres vistas,
panel admin web, backend/DB/auth/storage sobre Supabase, e integración de pagos con
Mercado Pago (tarjeta, OXXO Pay, SPEI) más manejo de efectivo.

**Qué se prometió medir (PRD §1.3, metas a 6 meses).** 5,000 clientes registrados ·
150 técnicos activos · 1,500 servicios completados · calificación ≥ 4.3/5 · tasa de
cancelación ≤ 12% · GMV mensual $500,000 MXN · 25% de clientes recurrentes a 90 días.

**Criterios de aceptación del MVP (PRD §12).** Cliente completa registro→solicitud→pago
en < 5 min; técnico aprueba KYC en < 24 h hábiles; los cuatro métodos de pago con
éxito > 95%; chat con latencia < 2 s; el panel permite aprobar KYC, resolver disputas
y consultar finanzas; piloto con ≥ 50 servicios reales sin incidentes críticos;
auditoría básica de seguridad (RLS, secretos, OWASP top 10); políticas legales
publicadas.

**Cómo entra el dinero.**

| Concepto | Valor codificado | Dónde vive |
| --- | --- | --- |
| Comisión de plataforma | 15% (`commission_bps = 1500`) | `platform_settings` (semilla en `20260729063420_catalog_geo.sql`) |
| Recargo por urgente | 20% (`urgent_surcharge_bps = 2000`) | `platform_settings`, aplicado en `submit_quote` |
| Ventana de aceptación | 30 min (`request_ttl_minutes = 30`) | `platform_settings`, aplicado en `create_service_request` |
| Radio de matcheo | 15,000 m (`default_match_radius_m`) | `platform_settings`, usado por `find_nearby_technicians` |
| Dinero | **enteros en centavos MXN** (`bigint`) | todas las columnas `*_cents` |

La comisión se **congela por orden**: `create_service_request` copia
`commission_bps` a la fila, y `accept_quote` calcula
`commission_cents = round(total_cents * commission_bps / 10000)`. Cambiar la
comisión global no es retroactivo (así lo exige `DECISIONS.md §2`).

**Flujo principal de punta a punta (el que sí está en código).**

1. El **cliente** elige categoría, describe el problema y confirma dirección. La app
   llama `create_service_request` (RPC) — la orden nace en `requested`, con
   `expires_at = now() + 30 min`, `commission_bps` congelado y, si marcó urgente,
   `urgent_surcharge_bps = 2000`. Se registra un evento en
   `service_order_status_events`.
2. Asignación **directa al técnico** (`DECISIONS.md §4`: no hay pool de broadcast en
   el MVP). El técnico tiene 30 min para aceptar; si rechaza o expira, el cliente
   elige otro.
3. El **técnico** acepta con `accept_service_order`. La RPC exige: rol `technician`,
   `kyc_status = 'approved'`, `is_available = true`, orden aún en `requested`, no
   expirada, y que el técnico cubra esa `category_id`.
4. `accepted → enroute → onsite` (transiciones del técnico vía
   `transition_service_order`).
5. En sitio el técnico manda la cotización con `submit_quote` (mano de obra +
   materiales + partidas); la orden pasa a `quote` y se calcula el recargo por
   urgencia.
6. El **cliente** aprueba con `accept_quote` → la orden pasa a `working` y se calcula
   `commission_cents`.
7. `working → closing` (técnico) y cierre con `close_service_order`, que **exige al
   menos una evidencia final** (`service_evidence` con `is_final` o
   `kind = 'final'`) antes de pasar a `completed`.
8. `completed → paid` (cliente o admin) → `closed`. `pagado/cerrado` es estado
   terminal real (`DECISIONS.md §3`).

**Disputas.** No son un estado: `open_dispute` prende la bandera `is_disputed` sobre
la orden viva y crea una fila en `disputes`; el ciclo de vida sigue su curso
(`DECISIONS.md §3`). Además, en la app móvil una calificación de **≤ 3 estrellas
abre disputa automáticamente** (`src/screens/cliente/CalificacionScreen.tsx`), con la
razón derivada de las etiquetas que marcó el cliente.

**Huecos de negocio que hoy rompen el cobro.** Tres cosas que el backend exige y las
apps no entregan:

1. **El recargo por urgencia nunca se cobra.** `create_service_request` acepta
   `p_is_urgent`, pero `src/screens/cliente/WizardScreen.tsx` no envía el campo. El
   "Urgente" que se ve en Discovery y en la vista admin es decorativo. El 20% pactado
   en `DECISIONS.md §4` es, hoy, código muerto.
2. **No se puede cerrar un servicio contra el backend real.** La app móvil nunca llama
   `close_service_order`; su botón de finalizar hace
   `transition_service_order(…, 'completed')`, transición que la RPC prohíbe desde
   `working` y desde `closing`. Y como no hay cámara (las fotos son cadenas
   `demo://…`), tampoco existe la evidencia final que la RPC exige.
3. **El cobro real no ocurre.** `mp-create-preference` es un stub y, aunque
   devolviera un `init_point`, la app lo guarda en el store y **nunca lo abre**
   (no hay `Linking.openURL` ni WebView).

**Identidad.** Una misma persona puede ser cliente y técnico; los admins comparten el
mismo pool de `auth.users` y se separan por RBAC (`DECISIONS.md §5`).

PENDIENTE: la consola web tiene una pantalla completa de Configuración (comisión
global, overrides por categoría, comisión por método de pago, programa de comisión
reducida 10%/90 días, SLA, ventanas de cancelación) pero **nada de eso persiste**:
`src/app/(console)/config/page.tsx` guarda todo en `useState`. ¿Qué parte del panel
de configuración es entregable del MVP y cuál es sólo maqueta?

PENDIENTE: el PRD §6.3 promete comisión configurable **por categoría y/o por
técnico**; el esquema sólo tiene una comisión global en `platform_settings`.
¿Entra el override por categoría en el alcance?

PENDIENTE: el PRD §6.3 dice "los precios mostrados al cliente incluyen IVA" pero
ninguna tabla ni cálculo modela IVA. ¿Los `*_cents` ya son con IVA incluido, o falta
implementarlo?

<!--thummim {"t":"doc","kind":"reglas","titulo":"Reglas y validaciones","orden":2}-->
### Reglas y validaciones

#### Máquina de estados del servicio (`public.service_order_status`)

Enum completo: `requested · accepted · enroute · onsite · quote · working · closing ·
completed · paid · closed · expired · cancelled`.

Transiciones permitidas por `public.transition_service_order`
(`20260729063428_rpcs_lifecycle.sql`), y **quién** puede dispararlas:

| De | A | Actor permitido |
| --- | --- | --- |
| `accepted` | `enroute` | técnico asignado |
| `enroute` | `onsite` | técnico asignado |
| `onsite` | `quote` | técnico asignado |
| `quote` | `working` | cliente, técnico o admin |
| `working` | `closing` | técnico asignado |
| `closing` | `completed` | **PROHIBIDO** — hay que usar `close_service_order` |
| `completed` | `paid` | cliente o admin |
| `paid` | `closed` | cliente, técnico o admin |
| cualquiera de `requested/accepted/enroute/onsite/quote` | `cancelled` | cualquier parte |
| cualquier otra | cualquier otra | sólo `app.is_admin()` |

Invariantes duras:

- **`closing → completed` sólo por `close_service_order`**, y esa RPC exige
  `count(service_evidence WHERE is_final OR kind='final') >= 1`. Sin foto final no
  hay cierre.
- **No se puede aceptar sin KYC.** `accept_service_order` exige
  `technicians.kyc_status = 'approved' AND is_available = true`, y que exista fila en
  `technician_categories` para la categoría de la orden.
- **Expiración.** Si `expires_at < now()` al intentar aceptar, la RPC marca la orden
  `expired`, registra el evento y **falla**. `expire_stale_requests()` hace el barrido
  masivo con `FOR UPDATE SKIP LOCKED` y sólo está concedida a `service_role`.
- **Sólo el cliente dueño (o admin) acepta la cotización** (`accept_quote`), y sólo
  si la orden está en `quote`.
- **Sólo el técnico asignado (o admin) manda cotización** (`submit_quote`), y sólo
  si la orden está en `onsite` o `quote`.
- **`open_dispute` exige razón no vacía** y que quien la abre sea parte de la orden.
- Toda transición deja rastro en `service_order_status_events`
  (`app.record_status_event` con `auth.uid()` como actor).

#### Dinero

- Todo en **centavos enteros** (`bigint`), con `CHECK (… >= 0)` en
  `technician_rates.visita_cents/hora_cents/minimo_cents`,
  `service_quotes.labor_cents/materials_cents/surcharge_cents/total_cents`,
  `service_quote_items.unit_cents/total_cents`,
  `service_orders.quoted_subtotal_cents/quoted_total_cents/commission_cents`,
  `payments.amount_cents/commission_cents`.
- `service_quote_items.quantity` tiene `CHECK (quantity > 0)`.
- `ledger_entries.amount_cents` es **con signo** y sin CHECK: positivo = crédito al
  técnico, negativo = cargo (p. ej. comisión adeudada por cobro en efectivo).
- `payments.idempotency_key` es `UNIQUE` — la protección contra doble cobro.
- Redondeo: medio arriba al centavo (`round(...)::bigint` en `submit_quote` y
  `accept_quote`).

#### Roles y RLS (`20260729063427_rls_policies.sql`)

El rol se lee **sólo de `app_metadata`** (`app.current_role()`), con fallback a
`profiles.role` para rutas de `service_role`. Nunca de `user_metadata`.
`app.is_admin() / is_technician() / is_client()` son `SECURITY DEFINER` con
`search_path = ''`.

RLS habilitado en las 17 tablas de `public`. Lo importante:

- **`technicians` es PII**: `SELECT` sólo `id = auth.uid() OR app.is_admin()`. Los
  clientes **nunca** ven `curp`, `rfc`, `home_address`, `bank_name`, `clabe`.
  Para mostrar al técnico existe la vista `technician_public_profiles`
  (`security_invoker = true`, filtra `kyc_status='approved' AND profiles.status='active'`),
  con GRANT a `authenticated` y `anon`.
- **`service_orders`**: ven la fila admin, el cliente dueño, el técnico asignado, o
  cualquier técnico KYC-aprobado y disponible **mientras la orden esté en
  `requested`** (así funciona el inbox de solicitudes).
- **`platform_settings`**: lectura para cualquier `authenticated`; escritura sólo
  admin. Cambiar la comisión es una acción de admin.
- **`ledger_entries`**: el técnico lee lo suyo; **escribir es exclusivo de admin**
  (`ledger_admin_write`).
- **`payments`**: insert del cliente dueño; **update sólo admin** (el webhook usa
  `service_role`).
- **`disputes`**: insert de las partes; **update sólo admin**.
- Storage (`20260729063425_storage.sql`): bucket `avatars` **público**;
  `kyc-documents` y `job-evidence` privados. `job-evidence` se autoriza por convención
  de ruta `job-evidence/{service_order_id}/…` cruzando contra `service_orders`;
  `kyc-documents` por `{auth.uid()}/…`. Límites: 5 MB avatars, 15 MB los otros dos,
  MIME restringido.

#### Validaciones de formulario (móvil, `src/lib/validation/schemas.ts`, zod)

| Campo | Regla |
| --- | --- |
| Celular MX | exactamente 10 dígitos |
| OTP | 6 dígitos |
| Contraseña | ≥ 8 caracteres, al menos una letra y un dígito |
| C.P. | 5 dígitos |
| CURP | 18 caracteres, patrón `[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d` |
| RFC (opcional) | `[A-ZÑ&]{3,4}\d{6}[0-9A-Z]{3}` |
| CLABE | 18 dígitos |
| Descripción del problema | 20–500 caracteres |
| Calificación | entero 1–5, comentario ≤ 500 |
| Tarifa | global $150–$5,000; bandas por subcategoría en `RATE_RANGES` (p. ej. Fugas $300–$1,500, Calentadores $400–$2,500) |
| Radio de cobertura | 1–100 km |

#### Reglas del PRD que **no** están implementadas

Estas son reglas de negocio del cliente escritas en el PRD/DECISIONS que hoy no
existen en el esquema ni en código, y que romperían expectativas si el cliente las da
por hechas:

- Cancelación sin costo con > 4 h de anticipación; penalización tardía 15% de la
  tarifa base; 3 cancelaciones del técnico en 30 días detonan revisión (PRD §4.5).
- Rating mínimo de operación 3.8/5 sobre las últimas 20 reseñas; tasa de aceptación
  mínima 50% (PRD §7.2).
- Ventana de 7 días para calificar (PRD §7.1) — no hay tabla `ratings`.
- Moderación anti-desintermediación en el chat (PRD §4.4) — no hay tabla `messages`.
- Monto mínimo de retiro $100 MXN y lote diario a las 18:00 (PRD §6.2) — no hay tabla
  `payouts`.
- Comisión adeudada por cobro en efectivo cargada a la cartera del técnico
  (PRD §6.2, `tumtto-supabase-skill.md`) — el enum `ledger_entry_type` tiene
  `commission_owed`, pero **ningún código lo genera**.

PENDIENTE: ¿cuáles de esas reglas entran en el alcance facturable y cuáles se
posponen? El repo no lo dice.

PENDIENTE: `DECISIONS.md §5` define cuatro roles admin (Super Admin, Admin Soporte,
Onboarding, Legal) con una matriz de capacidades, pero el enum `user_role` sólo tiene
`admin` y `app.is_admin()` no distingue. ¿Cómo se implementa ese RBAC fino?

PENDIENTE: `supabase/config.toml` tiene `auth.mfa.totp.enroll_enabled = false` y
`verify_enabled = false`, pero el README del backend y el PRD §8.3 exigen MFA
obligatorio para admins. ¿Se habilita en el dashboard remoto?

<!--thummim {"t":"doc","kind":"dominio","titulo":"Dominio y glosario","orden":3}-->
### Dominio y glosario

Nombres tal como aparecen en el esquema desplegado (`tumtto-backend/supabase/migrations`).

| Término | Qué es en el código |
| --- | --- |
| `profiles` | Extiende `auth.users` (PK = id del usuario). `role` (`client`/`technician`/`admin`), `full_name`, `phone`, `avatar_path`, `status` (`active`/`suspended`/`deleted`). La creación es automática por el trigger `on_auth_user_created` → `app.handle_new_user()`. |
| `technicians` | Perfil PRO, **1:1 con `profiles`** (`technicians.id = profiles.id`). Guarda la PII sensible: `curp`, `rfc`, `home_address`, `bank_name`, `clabe`, más `kyc_status`, `is_available`, `rating_avg`, `rating_count`. |
| `technician_public_profiles` | Vista segura para mostrar al técnico al cliente: nombre, bio, kyc_status, disponibilidad, rating, avatar. Sin PII. |
| `technician_locations` | Última ubicación del técnico (`geography(Point,4326)`, índice GiST), 1 fila por técnico (`UNIQUE`). Alimenta el matcheo por proximidad. |
| `client_addresses` | Direcciones guardadas del cliente, con snapshot de Mapbox (`place_name`, `mapbox_feature_id`, `neighborhood`, `municipality`, `postal_code`, `state`, `raw_mapbox_feature`) y `location` PostGIS. |
| `service_categories` | Catálogo de **un solo nivel** (`slug` único). Semilla: `plumbing`, `electrical`, `gas`, `ac`, `appliances`, `locks`. |
| `technician_categories` | Qué categorías atiende cada técnico (PK compuesta). Requisito duro para aceptar una orden. |
| `technician_rates` | Tarifas del técnico por categoría: `visita_cents`, `hora_cents`, `minimo_cents` (único por técnico+categoría). |
| `platform_settings` | Configuración global clave/valor jsonb: `commission_bps`, `urgent_surcharge_bps`, `request_ttl_minutes`, `default_match_radius_m`. |
| `service_orders` | **La entidad central**. `REQ-` y `SVC-` son la MISMA fila: la solicitud se promueve en su lugar a servicio al aceptarse (`DECISIONS.md §4`). Guarda estado, snapshot de dirección/Mapbox, `location` PostGIS, montos cotizados, comisión congelada, `expires_at`, marcas de tiempo del ciclo y la bandera `is_disputed`. |
| `service_order_status_events` | Bitácora inmutable de cada transición: `from_status`, `to_status`, `actor_id`, `note`. |
| `service_quotes` / `service_quote_items` | Cotización del técnico (mano de obra + materiales + recargo = total) y sus partidas. Reemplaza el concepto de "extras" del PRD. |
| `service_evidence` | Fotos del trabajo. `kind` ∈ `arrival/work/final/other`, `is_final`, `storage_path` en el bucket `job-evidence`. |
| `disputes` | Overlay sobre la orden: `reason`, `status` (`open/in_review/resolved/rejected`), `resolution_notes`, `resolved_by`. |
| `payments` | Cobro al cliente. `method` ∈ `card/oxxo/wallet/cash`, `status` ∈ `pending/authorized/paid/failed/refunded/cancelled`, `amount_cents`, `commission_cents`, campos de Mercado Pago (`mp_preference_id`, `mp_payment_id`, `mp_status`) e `idempotency_key` único. |
| `ledger_entries` | Cartera del técnico, derivada (no hay tabla de saldo). `entry_type` ∈ `commission_owed/commission_collected/payout/adjustment/refund`, `amount_cents` con signo. El saldo = suma de las entradas. |
| `kyc_sessions` | Sesión de verificación con Didit: `didit_session_id` (único), `workflow_id`, `vendor_data` (= id del técnico), `status`, `verification_url`, `raw_decision`, `last_webhook_at`. |
| KYC | Verificación de identidad del técnico. Documentos: INE anverso/reverso, comprobante de domicilio y selfie biométrica; además CLABE y datos bancarios se capturan en el paso 4 "Verificación y cobro" del onboarding de 6 pasos (`DECISIONS.md §7`). |
| Cotización | Tarifa base + materiales + recargo por urgencia; el cliente debe aprobarla antes de que el trabajo empiece. |
| Urgente | Bandera del cliente que aplica `urgent_surcharge_bps` (20%) sobre mano de obra + materiales al cotizar. |
| GMV | Suma de `payments.amount_cents` con `status = 'paid'` (así lo calcula `getMetrics()` en la consola). |
| Cartera / saldo | `sum(ledger_entries.amount_cents)` del técnico. |
| ZMG | Zona Metropolitana de Guadalajara: Guadalajara, Zapopan, Tlaquepaque, Tonalá, Tlajomulco, El Salto. |

**Enums desplegados**: `user_role`, `profile_status`, `kyc_status`,
`service_order_status`, `dispute_status`, `evidence_kind`, `payment_method`,
`payment_status`, `ledger_entry_type`, `didit_session_status`.

**Ojo con el esquema legado.** `_tumtto-shared/supabase/migrations/0001_init.sql`
(copia idéntica en `tumtto-mobile/supabase/migrations/0001_init.sql`) es un esquema
**anterior y distinto**, derivado literalmente del PRD §8.2: enums en español
(`solicitado`, `aceptado`, `en_camino`…), jerarquía geográfica
`countries/regions/cities/neighborhoods`, `subcategories`, `service_extras`,
`messages`, `refunds`, `ratings`, `technician_wallet`, `wallet_transactions`,
`payouts`, `audit_logs`, `app_config`, montos en `numeric(10,2)`. **No es el esquema
vivo.** El vivo es el de `tumtto-backend`. Los dos archivos legados sólo sirven de
referencia histórica de lo que el PRD pedía.

PENDIENTE: ¿se borra el esquema legado de `_tumtto-shared` y `tumtto-mobile/supabase`
o se conserva? Hoy confunde: dos `0001_init.sql` que contradicen las migraciones
reales.

<!--thummim {"t":"doc","kind":"arquitectura","titulo":"Arquitectura","orden":4}-->
### Arquitectura

El proyecto vive en un workspace con cuatro repos y dos carpetas de apoyo.

#### `tumtto` — prototipos + documentos del contrato (rama `prototipos`)

Mismo repositorio de GitHub que `tumtto-web`, pero con la copia local parada en la
rama `prototipos` (último commit 2026-07-21, `52fc69c`). Contiene los **40 prototipos
navegables / 136 pantallas / 35 componentes** en React+Babel standalone
(`Tumantenimiento/*.html` + `*.jsx`, índice en `Index.html`, estructura serializada en
`manifest.json`), los assets de marca, el **PRD** (`PRD_Plataforma_Servicios_Mantenimiento.docx`)
y `DECISIONS.md`. Es la fuente de verdad de diseño y de las decisiones de producto,
no de código productivo. Paleta: Primary Blue `#0A6BCF`, Deep Navy `#0E2C56`, Accent
Cyan `#18C1FF`; tipografías Manrope + Inter + JetBrains Mono.

#### `tumtto-backend` — Supabase (la única fuente de verdad del dominio)

Sin código de aplicación: sólo `supabase/migrations`, `supabase/functions`,
`config.toml`, `seed.sql` y el pipeline. Node 24 + pnpm forzados (`.nvmrc`,
`engines`, `only-allow`). Nueve migraciones, todas fechadas `20260729`:

| Migración | Qué crea |
| --- | --- |
| `…063417_extensions_helpers` | `postgis`, `pgcrypto`, `moddatetime`; esquema privado `app`; `app.current_role/is_admin/is_technician/is_client/touch_updated_at` |
| `…063419_identity_profiles` | `profiles`, `technicians`, `client_addresses`, `technician_locations`, trigger `on_auth_user_created` |
| `…063420_catalog_geo` | `service_categories`, `platform_settings` (+ semilla de los 4 parámetros), `technician_categories`, `technician_rates` |
| `…063422_service_orders` | enums del ciclo de vida, `service_orders`, `service_order_status_events`, `service_quotes`, `service_quote_items`, `service_evidence`, `disputes` |
| `…063423_finance_ledger` | `payments`, `ledger_entries` |
| `…063424_kyc_didit` | `kyc_sessions` |
| `…063425_storage` | buckets `avatars` (público), `kyc-documents`, `job-evidence` + políticas por ruta |
| `…063427_rls_policies` | RLS en las 17 tablas + vista `technician_public_profiles` |
| `…063428_rpcs_lifecycle` | las 8 RPCs transaccionales + `find_nearby_technicians` |

**Decisión deliberada: la lógica transaccional vive en RPCs de Postgres, no en el
cliente.** Las apps no hacen `UPDATE service_orders SET status = …`; llaman
`transition_service_order`, `accept_service_order`, `submit_quote`, `accept_quote`,
`close_service_order`, `open_dispute`. Todas son `SECURITY DEFINER` con
`search_path = ''` y validan actor + estado antes de mover nada. Las Edge Functions se
reservan para I/O externo (Didit, Mercado Pago) y cron.

**Decisión deliberada: deploy sólo por CI.** `CLAUDE.md`, `AGENTS.md` y `.cursorrules`
prohíben explícitamente `db push`, `functions deploy` o `apply_migration` por MCP
contra el proyecto remoto. El único camino a producción es push a `main` →
`.github/workflows/ci-cd.yml` (link + `db push --yes` + `functions deploy`), con
concurrencia `supabase-deploy-production` sin cancelación.

Proyecto Supabase remoto: **`begevdpvtyfkrvkslrgo`** (nombre `TUMTTO`). Está
referenciado en `supabase/.temp/linked-project.json` del workspace y en los
`.mcp.json` de cada repo (MCP en modo `read_only=true`).

#### `tumtto-web` — landing pública + consola admin (Next.js 15 / React 19)

Rama `develop`, versión **0.2.0** (tags `v0.1.0`, `v0.2.0`), con 19 archivos
modificados sin commitear. App Router:

- `/` — landing pública de marketing (hero, categorías, stats, cómo funciona,
  técnicos, mapa de cobertura Mapbox, precios, alta de técnicos, FAQ).
- `/login` — acceso admin.
- Grupo `(console)`: `/dashboard`, `/clientes` (+ detalle), `/tecnicos` (+ detalle),
  `/servicios` (+ detalle), `/catalogo`, `/regiones`, `/finanzas`, `/soporte`,
  `/reportes`, `/config`.

Capas: `app/ → components/ → lib/demo/{world,store} (Zustand)`. `src/lib/demo/world.ts`
es un mundo en memoria **tipado contra el esquema real**
(`Database['public']['Tables'][…]['Row']` desde `src/types/supabase.ts`, generado con
`pnpm gen:types` del proyecto `begevdpvtyfkrvkslrgo`), para que la consola pinte
exactamente lo que se verá con datos productivos. `src/lib/demo/store.ts` expone
selectores y mutadores puros; `useTick()` es el mecanismo de re-render.

**Estado real de la autenticación (importante).** Hay dos capas contradictorias:

- `src/lib/auth.tsx` (nuevo, sin commitear) implementa auth **real**: cliente de
  navegador `@supabase/ssr`, `signInWithPassword`, y una regla de doble capa —
  sesión de Supabase **y** fila en `profiles`; `isAdmin = session && profiles.role === 'admin'`.
  Está montado en el layout raíz (`AuthProvider`).
- `src/components/admin-gate.tsx` sigue protegiendo la consola con
  `localStorage.getItem('tumtto-admin') === '1'`, y `src/app/login/page.tsx` valida
  contra credenciales **hardcodeadas** (`admin@tumantenimiento.mx` / `tumtto2026`).

Es decir: el proveedor de auth real existe pero **la consola todavía no lo usa**.

#### `tumtto-mobile` — app React Native bare 0.86 / React 19

Rama `main`, versión 0.0.1, **59 archivos sin commitear** (el árbol de trabajo es la
realidad; el último commit es de 2026-07-26). Arquitectura de la casa:

`screens → components → hooks → services → store (Zustand) → Supabase`

- `src/services/*Service.ts` — **la única capa que toca `supabase`**: `authService`,
  `profileService`, `addressService`, `catalogService`, `technicianService`,
  `availabilityService`, `serviceRequestService`, `paymentService`, `kycService`,
  `messageService`, `ratingService`, `disputeService`, `walletService`.
- `src/store/use*Store.ts` — 13 stores Zustand con guard de `lastFetched`.
- `src/navigation/RootNavigator.tsx` — gate de doble capa (sesión **y** fila
  `profiles`) y ruteo por rol a `ClienteNavigator` / `TecnicoNavigator` /
  `AdminNavigator` / `OnboardingNavigator`.
- 36 pantallas: 15 de cliente (Home, Discovery, Wizard, Tracking, Chat, Pago,
  Calificación, Mis servicios, Direcciones, Métodos de pago, Perfil, Inbox, Baja de
  cuenta, Perfil de técnico, SinPagos), 8 de técnico (Home, Onboarding, Detalle de
  solicitud, Ejecución, Agenda, Perfil, Tarifas, Wallet), 2 de admin y 6 de
  onboarding.
- `src/lib/supabase.ts` — cliente con AsyncStorage, `flowType: 'pkce'`,
  `detectSessionInUrl: false`; truena al arrancar si faltan las env vars.
- **Modo demo** (`src/store/useDemoStore.ts` + `src/lib/demo/`): un flag de cliente
  que hace que cada service bifurque a un mundo en memoria (`isDemo()` → `demoWorld()`
  con `delay()` de 280 ms para simular red). Permite recorrer los tres roles sin
  backend; nunca toca Supabase.

Tests con Jest + `@testing-library/react-native` (~47 casos en 8 archivos):
`services.test.ts`, `useAuth.test.tsx`, `world.test.ts`, `schemas.test.ts`,
`serviceDisplay.test.ts`, `homeCategories.test.ts`, `useTechnicianStore.test.ts`,
`__tests__/smoke.test.ts`. Todos corren contra el mundo demo; no hay pruebas de
render, de navegación ni contra Supabase, y no hay CI en el repo.

Deudas conocidas del móvil, verificadas en el árbol de trabajo:

- `src/screens/tecnico/TecnicoEjecucionScreen.tsx` dispara
  `setStatus('enroute')` **en el `useEffect` de montaje**: abrir la pantalla ya muta
  la orden sin acción del usuario, y la segunda vez la RPC la rechaza en silencio.
- Todos los stores tragan el error real (`catch { set({ error: '<mensaje genérico>' }) }`).
  Sin logging ni Sentry, un fallo de RLS o de RPC en producción es invisible.
- `src/screens/admin/AdminMobileScreen.tsx` importa `demoWorld()` **directamente**,
  saltándose la capa de services: esa pantalla no funcionará con datos reales. Sus
  sparklines, zonas y alertas están hardcodeadas.
- `tumtto-mobile/supabase/config.toml` tiene `project_id = "{{name}}"` (plantilla sin
  sustituir) y `supabase/migrations/0001_init.sql` es el esquema legado que contradice
  al desplegado. Correr ese directorio destruiría la coherencia.
- Chat, calificaciones por orden y agenda semanal son **demo-only**: no hay tablas
  `messages`, `ratings` ni de disponibilidad en el esquema desplegado, y los services
  lo dicen explícitamente (`messageService`, `ratingService`, `availabilityService`).
- El OTP por SMS y la pantalla de datos personales **no persisten nada**
  (`RegistroScreen.tsx`, `DatosPersonalesScreen.tsx` tienen el TODO "al conectar").
- No hay cámara, no hay GPS y no hay push: fotos `demo://…`, coordenadas simuladas
  alrededor de ZMG y cero dependencias de notificaciones.
- README y CLAUDE.md del móvil están desfasados: dicen que `profiles.role` es
  `cliente | tecnico | admin | super_admin`; el enum real es `client | technician | admin`.

#### `_tumtto-shared` y `supabase/` (no son repos)

`_tumtto-shared` guarda el esquema legado derivado del PRD (`0001_init.sql` +
`seed.sql` con la jerarquía geográfica de ZMG, las 10 categorías del PRD y
`app_config`: comisión 15%, ventana de cancelación 4 h, penalización 15%, ventana de
aceptación 30 min, retiro mínimo $100) y una copia de `types/supabase.ts`.
`supabase/.temp/linked-project.json` sólo fija el proyecto remoto del workspace.

#### Cómo fluye un dato

Cliente móvil → `ServiceRequestService.create()` → `supabase.rpc('create_service_request')`
→ la RPC valida rol y dirección, lee `platform_settings`, inserta en `service_orders`
con `expires_at` y `commission_bps`, y escribe el evento → RLS deja que el técnico
KYC-aprobado y disponible la vea mientras esté en `requested` → `accept_service_order`
la asigna → cada transición vuelve a pasar por RPC → la consola web lee las mismas
tablas con los mismos tipos generados.

PENDIENTE: la consola web y la app móvil **no leen la base todavía** (consola en
mundo demo, móvil con `isDemo()` disponible). ¿Cuál es el hito de "conectar a datos
reales" y qué pantallas entran primero?

PENDIENTE: `tumtto` y `tumtto-web` apuntan a URLs de remote distintas
(`Thummimlabs/tumtto.git` vs `tumantenimiento26/tumtto.git`) aunque comparten historia
y commits. ¿El repo se transfirió de organización? La copia `tumtto` tiene el remote
viejo.

<!--thummim {"t":"doc","kind":"integraciones","titulo":"Integraciones","orden":5}-->
### Integraciones

#### Didit — KYC de técnicos (la única integración externa realmente implementada)

- `supabase/functions/didit-create-session/index.ts` — requiere sesión
  (`verify_jwt = true`), comprueba que exista fila en `technicians`, llama
  `POST https://verification.didit.me/v3/session/` con `workflow_id` y
  `vendor_data = user.id`, guarda la sesión en `kyc_sessions` y sube el técnico a
  `kyc_status = 'pending'` sólo si venía de `not_started/declined/abandoned`.
- `supabase/functions/didit-webhook/index.ts` — **`verify_jwt = false`**, valida
  HMAC-SHA256 hex del cuerpo crudo contra la cabecera `X-Signature` con comparación
  en tiempo constante (`verifyDiditSignature` + `timingSafeEqual` en `_shared/cors.ts`).
  Mapea el estado de Didit (`mapDiditStatus`) al enum de la app (`mapKycStatus`:
  `in_progress → pending`) y escribe `kyc_sessions` + `technicians.kyc_status` con
  `service_role`. Sesiones desconocidas devuelven `200 {ok:true, ignored:true}` para
  no provocar tormentas de reintentos.
- Secretos: `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET`.
- Webhook a configurar en la consola de Didit apuntando a
  `https://begevdpvtyfkrvkslrgo.supabase.co/functions/v1/didit-webhook`, evento
  `status.updated`. El workflow debe pedir INE anverso/reverso, comprobante de
  domicilio y selfie biométrica.
- **Si falla:** ningún técnico llega a `kyc_status='approved'` y, por la regla de
  `accept_service_order`, **nadie puede aceptar servicios**. Es el punto único de
  falla más caro del sistema. Mitigación existente: un admin puede forzar el estado
  vía `KycService.setKycStatus` (update directo a `technicians`, permitido por RLS a
  admin).

#### Mercado Pago — pagos (STUB, no implementado)

- `mp-create-preference` (`verify_jwt = true`): valida sesión y propiedad de la orden,
  pero si no hay `MP_ACCESS_TOKEN` responde **501** con `{stub:true}`; con token,
  igual devuelve `{stub:true, message:"…not implemented yet"}`. El TODO dice
  "llamar a la Preferences API y persistir `payments.mp_preference_id`".
- `mp-webhook` (`verify_jwt = false`): **no verifica firma**; loguea y responde
  `{stub:true, received:true}`. El TODO dice verificar `x-signature` + query params.
- Secretos previstos: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`.
- **Si falla / mientras siga en stub:** no hay cobro real. El PRD §2.1 y §6.1 venden
  tarjeta, OXXO Pay, wallet MP y efectivo, y el criterio de aceptación §12 exige
  > 95% de éxito en los cuatro métodos. Hoy `paymentService.createPreference` sólo
  funciona en modo demo (liquida al instante); en modo real devuelve el stub.

#### Cron de expiración

- `supabase/functions/expire-requests/index.ts` invoca la RPC
  `expire_stale_requests()` con `service_role` y devuelve `{expired_count}`.
  `verify_jwt = false` y acepta `GET` y `POST`.
- El README pide agendarlo "cada 5 minutos" desde el dashboard o un scheduler
  externo. **No hay `pg_cron` ni scheduler versionado en el repo.**
- **Si falla:** las solicitudes no aceptadas nunca pasan a `expired`. El daño está
  acotado porque `accept_service_order` también revisa `expires_at` y expira la orden
  al vuelo, pero la ventana de 30 min deja de ser visible para el cliente y los
  reportes.

#### Mapbox — mapas y geocoding (sólo cliente)

- Decisión explícita del backend: **Mapbox corre sólo en las apps**, con token
  restringido por URL/bundle. Está prohibido poner `MAPBOX_*` en secretos de Edge
  Functions. La búsqueda de técnicos cercanos NO llama a Mapbox: usa PostGIS
  (`find_nearby_technicians` con `ST_DWithin`).
- Al crear direcciones/órdenes/ubicaciones se persiste el snapshot completo:
  `location` (Point PostGIS), `place_name`, `mapbox_feature_id`, `neighborhood`,
  `municipality`, `postal_code`, `state`, `address_line`, `raw_mapbox_feature`.
- Env: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` en web y móvil (`pk.*`). iOS necesita además
  un token secreto `sk.*` en `~/.netrc` como `MAPBOX_DOWNLOADS_TOKEN` sólo para
  `pod install` — nunca viaja en la app.
- **Si falta el token:** los mapas renderizan un placeholder "mapa no disponible"; el
  resto de la app sigue.

#### Autenticación

- Clientes y técnicos: **Phone OTP** (`+52`, 10 dígitos) — `AuthService.sendPhoneOtp`
  / `verifyPhoneOtp`. También hay `signInWithPassword` / `signUpWithPassword`.
- Admins: correo corporativo + contraseña + MFA TOTP (según README del backend).
- El rol se toma **exclusivamente de `auth.users.raw_app_meta_data.role`**. Promover
  un admin exige el UPDATE documentado en el README del backend sobre `auth.users` y
  `public.profiles`.
- **Si el trigger `on_auth_user_created` falla:** el usuario tiene sesión pero no fila
  en `profiles`, y tanto `RootNavigator` (móvil) como `AuthProvider` (web) lo tratan
  como **no autenticado** ("No encontramos tu cuenta"). Es el comportamiento
  deseado, pero significa que un fallo del trigger bloquea el alta por completo.

#### Variables de entorno

| Variable | Dónde | Qué pasa si falta |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web (`.env.local`) y móvil (`.env`, vía `@env`) | ambos clientes lanzan excepción al arrancar (fail-fast deliberado) |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | web y móvil | mapas en placeholder |
| `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID` | secretos Edge | `didit-create-session` responde 500 "Didit is not configured" |
| `DIDIT_WEBHOOK_SECRET` | secretos Edge | `didit-webhook` responde 500 y **ningún KYC se resuelve** |
| `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` | secretos Edge | los stubs de pago responden 501 / acknowledge vacío |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD` | secrets de GitHub Actions | el job `deploy-supabase` falla en el paso "Validate secrets" |

#### El último tramo que falta en las apps

Aunque el backend expone la integración, la app móvil no la consume hasta el final:

- El `init_point` que devuelve `mp-create-preference` se guarda en
  `usePaymentStore.initPoint` y **nunca se abre** (sin `Linking.openURL`, sin WebView).
- La `verification_url` que devuelve `didit-create-session` **tampoco se abre**: la UI
  sólo muestra "enviado". El técnico no puede completar la verificación desde la app.
- No hay cámara: toda foto (wizard, evidencia de trabajo, INE, partidas) genera
  cadenas `demo://photo-N`. Sin evidencia real, `close_service_order` no puede pasar.
- No hay geolocalización: `DireccionesScreen` genera coordenadas simuladas
  deterministas alrededor de ZMG.
- `mp-create-preference` nunca se llama para el método `cash`; el cobro en efectivo se
  confirma sólo en el cliente, sin crear el `ledger_entry` de comisión adeudada.

#### Integraciones prometidas que no existen en el código

Firebase Cloud Messaging (push — el PRD §4.3 hace depender de él la ventana de
aceptación de 30 min), Twilio/MessageBird para SMS OTP más allá de lo que Supabase
Auth provee, Google Maps (el PRD §8.1 lo listaba; se sustituyó por Mapbox + PostGIS),
Sentry (declarado en `env.d.ts` del móvil, sin instalar), y las Edge Functions
`compute-fees`, `trigger-payout`, `moderate-message`, `notify`,
`availability-search` del PRD §8.4.

PENDIENTE: ¿Mercado Pago se integra en este contrato o queda fuera? Es el único
requisito del criterio de aceptación §12 que hoy está al 0%.

PENDIENTE: ¿quién agenda el cron de `expire-requests` y con qué frecuencia? No está
versionado.

PENDIENTE: los buckets de Storage `kyc-documents` y `job-evidence` son privados, pero
`avatars` es público. El PRD §8.3 exige URLs firmadas con expiración corta para
documentos KYC — hoy se accede por política RLS de `storage.objects`, sin firma.
¿Es suficiente?

<!--thummim {"t":"end"}-->

## Plan de pruebas

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-001","titulo":"Un técnico sin KYC aprobado no puede aceptar una orden","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":1}-->
### TC-001 · Un técnico sin KYC aprobado no puede aceptar una orden

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Stack local (`pnpm db:reset` en `tumtto-backend`). Existe una orden en `requested` no
expirada. Existe un técnico con `app_metadata.role = technician`, `is_available = true`,
fila en `technician_categories` para esa categoría, y `kyc_status = 'in_review'`.

**Datos de prueba**

`technicians.kyc_status = 'in_review'` · una `service_orders.id` en `requested`.

**Pasos**

1. Autenticarse como ese técnico.
2. Llamar `select accept_service_order('<order_id>')`.

**Resultado esperado**

La RPC lanza `technician must be KYC approved and available`. La orden sigue en
`requested`, `technician_id` sigue null y no se agrega evento en
`service_order_status_events`. Repetir con `kyc_status='approved'` pero
`is_available=false` da el mismo error.

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-002","titulo":"Una solicitud vencida no se puede aceptar y queda expirada","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":2}-->
### TC-002 · Una solicitud vencida no se puede aceptar y queda expirada

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Orden en `requested` con `expires_at` en el pasado. Técnico KYC-aprobado, disponible y
con la categoría.

**Datos de prueba**

`update service_orders set expires_at = now() - interval '1 minute' where id = '<order_id>'`.

**Pasos**

1. Autenticarse como el técnico.
2. Llamar `select accept_service_order('<order_id>')`.
3. Consultar la orden y sus eventos.

**Resultado esperado**

La RPC lanza `order has expired`. La orden queda en `status = 'expired'` y existe un
evento `requested → expired` con nota `expired on accept`. La transacción NO deja la
orden aceptada.

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-003","titulo":"Un técnico no puede aceptar una categoría que no atiende","prioridad":"media","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":3}-->
### TC-003 · Un técnico no puede aceptar una categoría que no atiende

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** media · **Estado:** pendiente

**Precondiciones**

Técnico KYC-aprobado y disponible, con fila en `technician_categories` sólo para
`plumbing`. Orden en `requested` de categoría `electrical`.

**Datos de prueba**

Categorías semilla `plumbing` y `electrical` de `supabase/seed.sql`.

**Pasos**

1. Autenticarse como el técnico.
2. Llamar `accept_service_order` sobre la orden de electricidad.

**Resultado esperado**

Error `technician does not support this category`. La orden sigue sin asignar.

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-004","titulo":"create_service_request fija TTL de 30 minutos, comisión congelada y recargo urgente","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":4}-->
### TC-004 · create_service_request fija TTL de 30 minutos, comisión congelada y recargo urgente

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

`platform_settings` con la semilla original (`commission_bps=1500`,
`urgent_surcharge_bps=2000`, `request_ttl_minutes=30`). Usuario con rol `client`.

**Datos de prueba**

`p_lng = -103.3496`, `p_lat = 20.6597`, categoría `plumbing`, `p_is_urgent` en `false`
y luego en `true`.

**Pasos**

1. Llamar `create_service_request` con `p_is_urgent = false`.
2. Llamar `create_service_request` con `p_is_urgent = true`.
3. Cambiar `platform_settings.commission_bps` a `1200` y crear una tercera orden.

**Resultado esperado**

Orden 1: `status='requested'`, `expires_at ≈ now()+30min`, `commission_bps=1500`,
`urgent_surcharge_bps=0`, evento `NULL → requested` con nota `created`.
Orden 2: `urgent_surcharge_bps=2000`.
Orden 3: `commission_bps=1200` mientras que las órdenes 1 y 2 conservan 1500 (la
comisión no es retroactiva).

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-005","titulo":"expire_stale_requests vence solicitudes y sólo es ejecutable por service_role","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":5}-->
### TC-005 · expire_stale_requests vence solicitudes y sólo es ejecutable por service_role

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Tres órdenes: dos en `requested` con `expires_at` pasado y una en `accepted` con
`expires_at` pasado.

**Datos de prueba**

`expires_at = now() - interval '5 minutes'`.

**Pasos**

1. Como usuario `authenticated`, llamar `select expire_stale_requests()`.
2. Como `service_role`, llamar `select expire_stale_requests()`.
3. Revisar estados y eventos.

**Resultado esperado**

Paso 1: error de permisos (el GRANT es sólo a `service_role`).
Paso 2: devuelve `2`; las dos órdenes `requested` pasan a `expired` con evento
`requested → expired` nota `ttl expired`; la orden `accepted` **no se toca**.

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-006","titulo":"No se puede saltar de closing a completed sin pasar por close_service_order","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":6}-->
### TC-006 · No se puede saltar de closing a completed sin pasar por close_service_order

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Orden en `closing` con técnico asignado. Sesión del técnico asignado.

**Datos de prueba**

`p_to_status = 'completed'`.

**Pasos**

1. Llamar `transition_service_order('<order_id>', 'completed')` como el técnico.
2. Intentar además `transition_service_order('<order_id>','paid')` desde `closing`.

**Resultado esperado**

Ambas llamadas fallan con `invalid transition from closing to …`. La orden sigue en
`closing`. Un admin sí puede forzarla (rama `app.is_admin()`), lo que debe quedar
registrado en `service_order_status_events` con su `actor_id`.

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-007","titulo":"close_service_order exige al menos una evidencia final","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":7}-->
### TC-007 · close_service_order exige al menos una evidencia final

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Orden en `working` con técnico asignado y **sin** filas en `service_evidence`.

**Datos de prueba**

Evidencia con `kind='work'` (no final) y luego con `kind='final'`.

**Pasos**

1. Llamar `close_service_order('<order_id>')` sin evidencia.
2. Insertar una evidencia `kind='work', is_final=false` y repetir.
3. Insertar una evidencia `kind='final'` y repetir.

**Resultado esperado**

Pasos 1 y 2: error `at least one final evidence photo is required`; la orden sigue en
`working`. Paso 3: la orden pasa a `completed` con `completed_at` sellado y evento
`working → completed`.

<!--thummim {"t":"test","suite":"Dinero y comisiones","codigo":"TC-008","titulo":"submit_quote aplica el recargo urgente sobre mano de obra más materiales","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":8}-->
### TC-008 · submit_quote aplica el recargo urgente sobre mano de obra más materiales

- **Suite:** Dinero y comisiones · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Orden en `onsite`, `urgent_surcharge_bps = 2000`, técnico asignado autenticado.

**Datos de prueba**

`p_labor_cents = 45000`, `p_materials_cents = 42000`, dos partidas en `p_items`.

**Pasos**

1. Llamar `submit_quote` con esos montos.
2. Leer `service_quotes` y `service_orders`.

**Resultado esperado**

`surcharge_cents = round((45000+42000)*2000/10000) = 17400`;
`total_cents = 104400`; la orden pasa a `quote` con
`quoted_subtotal_cents = 87000` y `quoted_total_cents = 104400`, y se registra el
evento `onsite → quote` nota `quote submitted`. Con `urgent_surcharge_bps = 0` el
recargo debe ser exactamente `0` y el total `87000`.

<!--thummim {"t":"test","suite":"Dinero y comisiones","codigo":"TC-009","titulo":"accept_quote calcula la comisión con el commission_bps congelado en la orden","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":9}-->
### TC-009 · accept_quote calcula la comisión con el commission_bps congelado en la orden

- **Suite:** Dinero y comisiones · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Orden en `quote` con `commission_bps = 1500` y una cotización de `total_cents = 104400`.
Sesión del cliente dueño.

**Datos de prueba**

Después, otra orden con `commission_bps = 1200` y el mismo total.

**Pasos**

1. Llamar `accept_quote('<quote_id>')`.
2. Leer `service_orders.commission_cents` y `status`.
3. Repetir con la orden de 1200 bps.

**Resultado esperado**

Caso 1: `commission_cents = round(104400*1500/10000) = 15660`, `status='working'`,
`quoted_total_cents = 104400`, `service_quotes.accepted_at` sellado y evento
`quote → working` nota `quote accepted`.
Caso 2: `commission_cents = 12528`. El redondeo es medio-arriba al centavo y el
resultado es siempre entero.

<!--thummim {"t":"test","suite":"Dinero y comisiones","codigo":"TC-010","titulo":"Sólo el cliente dueño de la orden puede aceptar la cotización","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":10}-->
### TC-010 · Sólo el cliente dueño de la orden puede aceptar la cotización

- **Suite:** Dinero y comisiones · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Orden en `quote` del cliente A, con cotización. Existe un cliente B y el técnico
asignado.

**Datos de prueba**

Sesiones de cliente B y del técnico asignado.

**Pasos**

1. Como cliente B, llamar `accept_quote('<quote_id>')`.
2. Como técnico asignado, llamar `accept_quote('<quote_id>')`.
3. Como cliente A, llamar `accept_quote('<quote_id>')`.

**Resultado esperado**

Pasos 1 y 2: error `only client can accept quote`; la orden sigue en `quote` y
`commission_cents` sigue null. Paso 3: la orden pasa a `working`.

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-011","titulo":"open_dispute es un overlay: prende is_disputed sin mover el estado","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":11}-->
### TC-011 · open_dispute es un overlay: prende is_disputed sin mover el estado

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Orden en `working` con cliente y técnico asignados. Existe un tercero no relacionado.

**Datos de prueba**

`p_reason = ''` (vacío), `p_reason = 'Cobro no reconocido'`.

**Pasos**

1. Como el cliente, llamar `open_dispute` con razón vacía.
2. Como el tercero, llamar `open_dispute` con razón válida.
3. Como el cliente, llamar `open_dispute` con razón válida.
4. Leer la orden.

**Resultado esperado**

Paso 1: `reason is required`. Paso 2: `not a party to this order`. Paso 3: se crea la
fila en `disputes` con `status='open'` y `opened_by` = cliente; la orden queda con
`is_disputed = true` y **`status` sigue siendo `working`**. `disputes` sólo puede
pasar a resuelto por un admin (`disputes_admin_update`).

<!--thummim {"t":"test","suite":"Seguridad y RLS","codigo":"TC-012","titulo":"Un cliente no puede leer la PII del técnico (CURP, RFC, CLABE)","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":12}-->
### TC-012 · Un cliente no puede leer la PII del técnico (CURP, RFC, CLABE)

- **Suite:** Seguridad y RLS · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Técnico KYC-aprobado con `curp`, `rfc`, `home_address`, `bank_name` y `clabe`
poblados, asignado a una orden del cliente de prueba.

**Datos de prueba**

Sesión del cliente (`app_metadata.role = client`).

**Pasos**

1. `select * from technicians` con la sesión del cliente.
2. `select * from technicians where id = '<tecnico_asignado>'`.
3. `select * from technician_public_profiles`.

**Resultado esperado**

Pasos 1 y 2 devuelven **0 filas** (la política `technicians_select_self_admin` sólo
deja al propio técnico o al admin). El paso 3 devuelve al técnico con nombre, bio,
rating y avatar, y **sin** `curp`, `rfc`, `home_address`, `bank_name`, `clabe` ni
`phone`. Además `select phone from profiles` sobre el técnico asignado sí funciona
por `profiles_select_counterparty_on_order` — verificar si eso es aceptable para
privacidad.

<!--thummim {"t":"test","suite":"Seguridad y RLS","codigo":"TC-013","titulo":"Nadie ajeno a la orden puede leer sus fotos de evidencia en Storage","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":13}-->
### TC-013 · Nadie ajeno a la orden puede leer sus fotos de evidencia en Storage

- **Suite:** Seguridad y RLS · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Un objeto en el bucket `job-evidence` con ruta `{service_order_id}/final.jpg`. Tres
sesiones: cliente dueño, técnico asignado y un tercero autenticado.

**Datos de prueba**

También un objeto en `kyc-documents/{otro_uuid}/ine.jpg`.

**Pasos**

1. Descargar el objeto de `job-evidence` con cada una de las tres sesiones.
2. Intentar subir un objeto a `job-evidence/{order_id_ajeno}/foo.jpg` con el tercero.
3. Intentar leer `kyc-documents/{otro_uuid}/ine.jpg` con el tercero.

**Resultado esperado**

Cliente y técnico de la orden descargan; el tercero recibe error de política. La subida
del paso 2 es rechazada. El paso 3 es rechazado (sólo el dueño de la carpeta o un
admin). Confirmar además que `avatars` **sí** es público y que eso es intencional.

<!--thummim {"t":"test","suite":"Seguridad y RLS","codigo":"TC-014","titulo":"Un no-admin no puede cambiar la comisión de la plataforma","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":14}-->
### TC-014 · Un no-admin no puede cambiar la comisión de la plataforma

- **Suite:** Seguridad y RLS · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

`platform_settings` con `commission_bps = 1500`. Sesiones de cliente, técnico y admin.

**Datos de prueba**

`update platform_settings set value = '0'::jsonb where key = 'commission_bps'`.

**Pasos**

1. Ejecutar el UPDATE como cliente.
2. Ejecutar el UPDATE como técnico.
3. Ejecutar el UPDATE como admin.
4. Verificar que los tres roles sí pueden hacer SELECT.

**Resultado esperado**

Pasos 1 y 2: 0 filas afectadas / violación de política; el valor sigue en `1500`.
Paso 3: el valor cambia. Paso 4: los tres leen (política
`platform_settings_select using (true)`) — confirmar que exponer la comisión a
cualquier autenticado es aceptable.

<!--thummim {"t":"test","suite":"Seguridad y RLS","codigo":"TC-015","titulo":"Un técnico no puede acreditarse dinero en el ledger","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":15}-->
### TC-015 · Un técnico no puede acreditarse dinero en el ledger

- **Suite:** Seguridad y RLS · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Técnico autenticado con entradas existentes en `ledger_entries`.

**Datos de prueba**

`insert into ledger_entries (technician_id, entry_type, amount_cents) values ('<self>','adjustment', 999999)`.

**Pasos**

1. Ejecutar el INSERT como el propio técnico.
2. Ejecutar `WalletService.requestPayout()` de la app móvil fuera de modo demo
   (`src/services/walletService.ts`, inserta `entry_type='payout'`).
3. Ejecutar el mismo INSERT como admin.

**Resultado esperado**

Pasos 1 y 2: rechazados por `ledger_admin_write` (sólo admin escribe). El saldo del
técnico no cambia. Paso 3: se inserta. Documentar que el flujo de retiro del técnico
en la app **está roto en modo real** y necesita una RPC o Edge Function.

<!--thummim {"t":"test","suite":"KYC","codigo":"TC-016","titulo":"El webhook de Didit rechaza una firma inválida","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":16}-->
### TC-016 · El webhook de Didit rechaza una firma inválida

- **Suite:** KYC · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Stack local con `DIDIT_WEBHOOK_SECRET` configurado y una fila en `kyc_sessions` con
`didit_session_id = 'sess-test'` y técnico en `kyc_status='pending'`.

**Datos de prueba**

Cuerpo `{"session_id":"sess-test","status":"Approved"}` y cabecera `X-Signature`
inválida, ausente, y válida (HMAC-SHA256 hex del cuerpo crudo).

**Pasos**

1. POST a `/functions/v1/didit-webhook` sin `X-Signature`.
2. POST con `X-Signature` alterada en un carácter.
3. POST con la firma correcta.

**Resultado esperado**

Pasos 1 y 2: HTTP 401 `Invalid signature`; ni `kyc_sessions` ni `technicians` cambian.
Paso 3: HTTP 200 `{ok:true}`. Verificar además que un `session_id` inexistente
devuelve 200 `{ok:true, ignored:true}` (para no provocar reintentos de Didit).

<!--thummim {"t":"test","suite":"KYC","codigo":"TC-017","titulo":"Un KYC aprobado por webhook habilita al técnico para aceptar servicios","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":17}-->
### TC-017 · Un KYC aprobado por webhook habilita al técnico para aceptar servicios

- **Suite:** KYC · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Técnico con `kyc_status = 'pending'`, `is_available = true`, categoría asignada y una
orden `requested` de esa categoría. `kyc_sessions` con su `didit_session_id`.

**Datos de prueba**

Estados de Didit a probar: `"Approved"`, `"In Review"`, `"Declined"`, `"In Progress"`.

**Pasos**

1. Enviar el webhook firmado con `status: "In Progress"` y verificar el mapeo.
2. Enviar `status: "Approved"` firmado.
3. Como el técnico, llamar `accept_service_order` sobre la orden.
4. Enviar `status: "Declined"` firmado y repetir el paso 3.

**Resultado esperado**

Paso 1: `kyc_sessions.status='in_progress'` y `technicians.kyc_status='pending'`
(mapeo de `mapKycStatus`). Paso 2: `kyc_sessions.status='approved'`,
`technicians.kyc_status='approved'`, `raw_decision` y `last_webhook_at` poblados.
Paso 3: la aceptación **funciona**. Paso 4: vuelve a `declined` y la aceptación falla.

<!--thummim {"t":"test","suite":"Autenticación y roles","codigo":"TC-018","titulo":"El alta de usuario crea profiles y, si es técnico, también technicians","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":18}-->
### TC-018 · El alta de usuario crea profiles y, si es técnico, también technicians

- **Suite:** Autenticación y roles · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Stack local con las migraciones aplicadas (trigger `on_auth_user_created` activo).

**Datos de prueba**

Tres altas vía Admin API: sin `app_metadata.role`, con `role='technician'`, y con
`role='superuser'` (valor inválido).

**Pasos**

1. Crear los tres usuarios.
2. Consultar `profiles` y `technicians` para cada uno.

**Resultado esperado**

Alta 1: `profiles.role = 'client'`, sin fila en `technicians`.
Alta 2: `profiles.role='technician'` **y** fila en `technicians` con
`kyc_status='not_started'`, `is_available=false`.
Alta 3: el rol inválido cae a `'client'` (la guarda `IF v_role NOT IN (...)`).
En los tres casos `full_name` sale de `raw_user_meta_data` o `raw_app_meta_data`.

<!--thummim {"t":"test","suite":"Autenticación y roles","codigo":"TC-019","titulo":"El registro desde la app móvil nunca produce un técnico","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":false,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":19}-->
### TC-019 · El registro desde la app móvil nunca produce un técnico

- **Suite:** Autenticación y roles · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

App móvil apuntando al stack local, modo demo **desactivado**. Pantalla de onboarding
de técnico (`src/screens/tecnico/TecnicoOnboardingScreen.tsx`).

**Datos de prueba**

Correo nuevo, celular de 10 dígitos, contraseña de 8+ con letra y dígito.

**Pasos**

1. Registrarse por la ruta de técnico (`AuthService.signUpWithPassword`, que sólo
   manda `options.data = { phone }`).
2. Consultar `profiles.role` y la existencia de fila en `technicians`.
3. Intentar `accept_service_order` con esa cuenta.

**Resultado esperado**

Documenta el defecto: `signUpWithPassword` no fija `app_metadata.role`, así que el
trigger crea `profiles.role='client'` y **ninguna fila en `technicians`**. El
`RootNavigator` manda al usuario al navegador de Cliente y `accept_service_order`
falla con `only technicians can accept orders`. La prueba pasa cuando exista un
camino (Edge Function o invitación admin) que asigne el rol técnico en el alta.

<!--thummim {"t":"test","suite":"Autenticación y roles","codigo":"TC-020","titulo":"La consola web se abre con sólo poner una bandera en localStorage","prioridad":"alta","tipo":"e2e","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":20}-->
### TC-020 · La consola web se abre con sólo poner una bandera en localStorage

- **Suite:** Autenticación y roles · **Tipo:** e2e · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

`tumtto-web` corriendo (`pnpm dev`), sin sesión de Supabase iniciada.

**Datos de prueba**

`localStorage.setItem('tumtto-admin','1')` · credenciales hardcodeadas
`admin@tumantenimiento.mx` / `tumtto2026` de `src/app/login/page.tsx`.

**Pasos**

1. Sin pasar por `/login`, ejecutar `localStorage.setItem('tumtto-admin','1')` en la
   consola del navegador y visitar `/dashboard`.
2. Repetir con un usuario real de Supabase cuyo `profiles.role = 'client'`.
3. Cerrar sesión de Supabase y recargar `/finanzas`.

**Resultado esperado**

Hoy los tres pasos **dan acceso completo** a la consola (incluidas Finanzas y
Configuración), porque `src/components/admin-gate.tsx` sólo mira la bandera local y
`src/lib/auth.tsx` (que sí valida sesión + `profiles.role === 'admin'`) no se usa en
el gate. La prueba pasa cuando `AdminGate` consuma `useAuth().isAdmin` y las
credenciales hardcodeadas desaparezcan.

<!--thummim {"t":"test","suite":"Ciclo de vida del servicio","codigo":"TC-021","titulo":"El avance de estados de las apps no coincide con lo que permite la base","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":21}-->
### TC-021 · El avance de estados de las apps no coincide con lo que permite la base

- **Suite:** Ciclo de vida del servicio · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Stack local. `STATUS_FLOW` en `tumtto-mobile/src/services/serviceRequestService.ts` y
`FLOW` en `tumtto-web/src/lib/demo/store.ts` (ambos omiten `'quote'`). Sesión del
técnico asignado.

**Datos de prueba**

Una orden en `onsite` y otra en `working`.

**Pasos**

1. Verificar en unitario que `nextStatus('onsite') === 'working'` y
   `nextStatus('working') === 'closing'`.
2. Contra el stack local, llamar `ServiceRequestService.advanceStatus()` sobre la
   orden en `onsite`.
3. Simular el botón de finalizar de `TecnicoEjecucionScreen`
   (`setStatus(id,'completed')`) sobre la orden en `working`.
4. Buscar en `tumtto-mobile/src` cualquier llamada a `close_service_order`.

**Resultado esperado**

Documenta tres defectos encadenados. Paso 2: falla con
`invalid transition from onsite to working` (la RPC sólo permite `onsite → quote`).
Paso 3: falla con `invalid transition from working to completed`. Paso 4: **no existe
ninguna llamada a `close_service_order`** en la app, así que el único camino legal a
`completed` no está implementado y, sin cámara, tampoco hay evidencia final que
subir. La prueba pasa cuando el avance del técnico dispare `submit_quote` en `onsite`
y `close_service_order` (con evidencia real en `job-evidence`) para cerrar.

<!--thummim {"t":"test","suite":"Dinero y comisiones","codigo":"TC-022","titulo":"La comisión del 15% está hardcodeada en las apps en vez de leerse de la orden","prioridad":"media","tipo":"unit","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":22}-->
### TC-022 · La comisión del 15% está hardcodeada en las apps en vez de leerse de la orden

- **Suite:** Dinero y comisiones · **Tipo:** unit · **Prioridad:** media · **Estado:** pendiente

**Precondiciones**

`tumtto-web` con vitest (`pnpm test`).

**Datos de prueba**

Orden con `commission_bps = 1200`. Monto bruto `100000` centavos.

**Pasos**

1. Ejecutar `payRequest(orderId,'card',100000)` de `src/lib/demo/store.ts` sobre una
   orden con `commission_bps = 1200`.
2. Revisar el fallback de `src/app/(console)/servicios/[id]/page.tsx`
   (`Math.round(subtotalCents * 0.15)` y la etiqueta fija "Comisión plataforma · 15%").
3. Comparar con `paymentService.createPreference` de móvil, que sí usa
   `order.commission_bps`.

**Resultado esperado**

Documenta la inconsistencia: `payRequest` calcula `Math.round(grossCents * 0.15)`
ignorando `commission_bps`, y el detalle del servicio en la consola muestra "15%" como
texto fijo. Con `commission_bps = 1200` el resultado esperado es `12000`, no `15000`.
La prueba pasa cuando ambos lean la comisión de la orden.

<!--thummim {"t":"test","suite":"Dinero y comisiones","codigo":"TC-023","titulo":"La bandera de urgente nunca llega al backend, así que el recargo del 20% no se cobra","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":false,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":23}-->
### TC-023 · La bandera de urgente nunca llega al backend, así que el recargo del 20% no se cobra

- **Suite:** Dinero y comisiones · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

App móvil contra el stack local, modo demo **desactivado**. `platform_settings` con
`urgent_surcharge_bps = 2000`. Técnico KYC-aprobado listo para cotizar.

**Datos de prueba**

Solicitud creada desde `src/screens/cliente/WizardScreen.tsx` marcando la opción de
urgencia en la UI. Cotización de `labor 45000` + `materials 42000`.

**Pasos**

1. Crear la solicitud desde el wizard marcando urgente.
2. Leer `service_orders.is_urgent` y `urgent_surcharge_bps` de la fila creada.
3. Avanzar hasta `onsite` y llamar `submit_quote` con esos montos.
4. Leer `service_quotes.surcharge_cents` y `total_cents`.

**Resultado esperado**

Documenta el defecto: `WizardScreen.submit()` no incluye `is_urgent` en la llamada a
`ServiceRequestService.create()`, así que la orden nace con `is_urgent = false` y
`urgent_surcharge_bps = 0`; el `surcharge_cents` de la cotización sale `0` y el total
`87000` en vez de `104400`. El "Urgente" de Discovery y de la vista admin es sólo
presentacional. La prueba pasa cuando la orden refleje `urgent_surcharge_bps = 2000` y
la cotización cobre los $174.00 de recargo.

<!--thummim {"t":"test","suite":"Integraciones","codigo":"TC-024","titulo":"El cobro con Mercado Pago sigue siendo un stub y no genera preferencia","prioridad":"alta","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":24}-->
### TC-024 · El cobro con Mercado Pago sigue siendo un stub y no genera preferencia

- **Suite:** Integraciones · **Tipo:** integracion · **Prioridad:** alta · **Estado:** pendiente

**Precondiciones**

Stack local con Edge Functions servidas. Orden en `completed` con
`quoted_total_cents = 104400` del cliente autenticado. Otra orden de un cliente
distinto.

**Datos de prueba**

`MP_ACCESS_TOKEN` ausente y presente. Cuerpo `{ "service_order_id": "<id>" }`.

**Pasos**

1. POST a `mp-create-preference` sin `service_order_id`.
2. POST con la orden de OTRO cliente.
3. POST con la orden propia y `MP_ACCESS_TOKEN` ausente.
4. POST con `MP_ACCESS_TOKEN` presente.
5. POST a `mp-webhook` con cualquier cuerpo y sin firma.

**Resultado esperado**

Paso 1: 400 `service_order_id is required`. Paso 2: 404 `Order not found` (la RLS del
cliente no ve la orden ajena). Paso 3: 501 `{stub:true}` con `amount_cents = 104400`.
Paso 4: hoy también devuelve `{stub:true, message:"…not implemented yet"}` y **no**
escribe `payments`. Paso 5: hoy responde 200 `{stub:true, received:true}` **sin
validar firma**. La prueba pasa cuando el paso 4 cree la preferencia y persista
`payments.mp_preference_id` con `idempotency_key`, y el paso 5 rechace firmas
inválidas.

<!--thummim {"t":"test","suite":"Integraciones","codigo":"TC-025","titulo":"La función de expiración es invocable sin JWT desde internet","prioridad":"media","tipo":"integracion","estado":"pendiente","auto":true,"ruta":"","resp":"","feat":"","evid":"","nota":"","orden":25}-->
### TC-025 · La función de expiración es invocable sin JWT desde internet

- **Suite:** Integraciones · **Tipo:** integracion · **Prioridad:** media · **Estado:** pendiente

**Precondiciones**

Edge Functions servidas. `supabase/config.toml` tiene
`[functions.expire-requests] verify_jwt = false`.

**Datos de prueba**

Peticiones `GET` y `POST` sin cabecera `Authorization`.

**Pasos**

1. `GET /functions/v1/expire-requests` sin credenciales.
2. `POST` sin credenciales, en ráfaga (20 peticiones).
3. Revisar `service_orders` y `service_order_status_events`.

**Resultado esperado**

Ambas responden `{expired_count: N}`. El impacto está acotado (sólo vence órdenes que
ya pasaron su `expires_at`) y es idempotente, pero queda expuesta a abuso/DoS.
Decidir si se protege con un token compartido, se restringe a cron interno o se
convierte en `pg_cron`, y documentar la decisión.
