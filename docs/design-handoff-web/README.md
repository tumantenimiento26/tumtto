# Handoff: Tumantenimiento Web (landing + registro de técnicos + consola admin)

## Overview
Rediseño completo de la parte **web** de Tumantenimiento (repo `tumtto-web`, Next.js 15 / React 19 / Tailwind v4):
1. **Landing pública** (`/`): tema azul profundo con aura, rejilla técnica, efectos de scroll/cursor, estimador de precio, calculadora de ingresos para técnicos, galería de trabajos realizados.
2. **Registro de técnicos** (`/registro-tecnico`): tarjeta centrada sobre fondo con aura, validación en línea, estado de éxito.
3. **Consola admin** (`/login` + grupo `(console)`): todas las rutas existentes rediseñadas + nuevas (notificaciones, estados/errores), modo claro/oscuro, formularios laterales, tablas con orden/selección/paginación, date pickers, filtros, toasts, snackbar, skeletons.

Una sola guía de estilos comparte tokens con la app móvil (`Style Guide.dc.html`, sección **13 · Web**).

## About the Design Files
Los archivos de `design_files/` son **referencias de diseño hechas en HTML** (prototipos con el aspecto y comportamiento esperado), **no código de producción**. La tarea es **recrearlos en `tumtto-web`** con sus patrones: App Router, `src/components/ui.tsx`, `admin-shell.tsx`, `admin.tsx`, `charts.tsx`, `motion.tsx`, `toast.tsx`, Tailwind v4 (`globals.css` `@theme`), `lucide-react` y `src/lib/data/store.ts` (Zustand) para los datos.

Para verlos: abrir `design_files/Web Prototipo.dc.html` en un navegador (`support.js` debe estar junto). Tiene modo **Prototipo** (landing / registro / consola, claro/oscuro) y **Todos los flujos** (cada paso abre la pantalla exacta). Cada `.dc.html` también se abre solo. La consola acepta `#s=<pantalla>` (p. ej. `Web Consola Admin.dc.html#s=finanzas`).

## Fidelity
**Alta fidelidad.** Colores, tipografía, radios, espaciado, copy, estados y animaciones son finales. Los datos (nombres, montos, SVC-IDs, CLABEs) son de ejemplo y deben venir del store/Supabase. Donde el diseño muestra algo que el backend aún no soporta (tabla `ratings`, `payouts`, persistencia de Configuración), implementar la UI y dejar TODO según `docs/contexto-tumtto.md`.

---

## Design Tokens

### Color — claro (consola, registro, tarjetas)
| Token | Hex | Uso |
|---|---|---|
| navy | `#0E2C56` | Texto principal, botón primario (consola), avatar |
| navy-hover / pressed | `#1A3F73` / `#0A2245` | Estados primario |
| navy-deep | `#061B3A` | Sidebar, banda del dashboard, tooltips, snackbar |
| blue | `#0A6BCF` | Acento, links, item activo del sidebar, líneas de gráfica, primario sobre fondo oscuro |
| blue-hover / pressed | `#095FB8` / `#0853A3` | |
| cyan | `#18C1FF` | Kickers, badges del sidebar, barra de scroll, indicador activo |
| success | `#1E6B4B` (hover `#237A56`, pressed `#185A3F`) | Aprobar |
| success-text / bg / ring | `#0F7A4D` / `#E5F7EE` / `#9BD8BA` | |
| danger | `#B42318` · bg `#FEF3F2` · border `#F4C7C3` | Destructivo |
| warning | text `#B45309` · bg `#FEF3DC` · icon `#F59E0B` · ring `#F5D08A` | |
| info-bg / tint | `#E0F0FF` / `#F0F7FF` · ring `#9DC8F2` | |
| bg-app | `#F5F8FC` | Fondo consola, headers de tabla, hover filas |
| surface | `#FFFFFF` | Tarjetas |
| border / divider / btn-border | `#E1E8F0` / `#EEF2F8` / `#D6DEE8` | |
| segmentado / chip gris | `#EBEFF5` / `#F1F5FA` | |
| texto body / muted / subtle | `#374151` / `#6B7280` / `#9CA3AF` | |
| barras inactivas | `#C9DDF3` | Gráficas (barras no seleccionadas) |

### Color — consola oscura (`Web Consola Admin Dark.dc.html`)
page `#0A1628` · surface `#13223A` · panel/tabla header `#0F1D33` · sidebar `#060E1C` · border `#22344F` · divider/hover `#1B2B45` · btn-border `#2A3C58` · segmentado `#0B1729` · texto `#E8EEF7` / body `#B8C4D6` / muted `#8FA0B8` / subtle `#6F819B` · primario fondo `#0A6BCF` · link `#5AB0FF` · success `#5FD39B` sobre `#0F3A2B` · warning `#F5B94A` sobre `#3A2C0E` · danger `#F87171` sobre `#2A1418` · info `#12325A` · tooltips/snackbar `#22344F`. Implementar como tema (`data-theme="dark"` o `dark:` de Tailwind), **no** como archivo aparte.

### Color — landing (tema azul)
page `#050F22` · tarjetas `rgba(13,33,63,0.72)` + border `rgba(90,176,255,0.14)` + `backdrop-filter: blur(10px)` · bandas de sección `rgba(8,24,50,0.45–0.55)` con bordes `rgba(90,176,255,0.10)` · footer `#040C1C` · texto `#E8EEF7` / `#9FB0C8` / `#8FA0B8` · kicker `#18C1FF` · tarjeta destacada `linear-gradient(160deg,#0A3A78,#0B2A55 60%,#081C38)` · CTA final `linear-gradient(135deg,#0A6BCF,#0B4FA0 60%,#0A2E63)`. Los mockups de teléfono conservan el tema claro de la app.

### Tipografía
- **Manrope** 700/800: títulos, montos, botones. H1 consola 27px/800 (−0.6px); H1 landing `clamp(42px,6vw,72px)`/800 (−2.2px, line-height 1.0); H2 landing `clamp(32px,4vw,46px)`/800 (−1.2px); título de tarjeta 16px/700; botón 14–15.5px/700.
- **Inter** 400–700: cuerpo 13.5–15px; lead landing 17px/1.65.
- **JetBrains Mono** 500–600: kickers y encabezados de tabla 10.5–11px, uppercase, letter-spacing .12–.16em; IDs (`SVC-2851`), montos en tablas, CLABE, códigos.
- Números: `font-variant-numeric: tabular-nums` en KPIs.

### Radios · sombras · espaciado
- Radios: tarjetas 12px (landing 14–16px) · botones/inputs 10px · segmentado 10 (interior 8) · chips/pills 999px · icon tiles 8–10px · modales 14px · sheets laterales 0 (full-height).
- Sombras: flotante `0 18px 40px -16px rgba(6,27,58,.45)` · modal `0 30px 60px -20px rgba(6,27,58,.6)` · sheet `-30px 0 60px -30px rgba(6,27,58,.6)` · hover KPI `0 18px 40px -22px rgba(6,27,58,.45)`. Botones planos (sin sombra, sin degradado).
- Espaciado base 4px. Padding de página consola 28px; gap entre tarjetas 12–14px; landing secciones 112px vertical, contenedor `max-width: 1200px` + 24px lateral.
- Focus ring: `border-color #0A6BCF; box-shadow 0 0 0 4px rgba(10,107,207,.15)`.

### Iconos
Set lineal 24×24, trazo 2–2.2, relleno tint 18% opcional (sprite `<symbol id="i-*">` dentro de cada HTML). Mapear a `lucide-react`: search, bell, pin(MapPin), chev-*, star, check, drop(Droplet), zap, flame, snow(Snowflake), washer(WashingMachine), key, wrench, msg(MessageSquare), phone, shield(ShieldCheck), clock, home, list, user, card(CreditCard), store, bill(Banknote), wallet, cal(Calendar), alert(AlertTriangle), x, send, plus, nav(Navigation), id(IdCard), bank(Landmark), scale(Scale), chart(BarChart3), lock, info, help, logout, doc(FileText), refresh, users, map, trend(TrendingUp), grid(LayoutGrid), sliders(SlidersHorizontal), download, edit(Pencil), panel(PanelLeft).

---

## Screens / Views

### A. Landing (`Web Landing.dc.html` → `src/app/page.tsx`)
Fondo fijo: 3 auras radiales (azul `rgba(10,107,207,.42)`, cian `.22`, azul violáceo `.30`, blur 40–60px, deriva 26/32/38 s) + rejilla doble (120px y 24px, `rgba(90,176,255,.05/.025)`) + viñeta.
1. **Nav fija**: transparente sobre el hero → al hacer scroll > 40px: `rgba(6,20,44,.78)` + blur 16 + borde, altura 76→62px. Links con subrayado cian animado según sección visible. Barra de progreso de scroll 3px cian arriba. CTA "Descargar app" con destello (shine) cada 3.5 s. "Soy técnico" → `/registro-tecnico`.
2. **Hero**: spotlight radial que sigue al cursor (CSS vars `--mx/--my`), parallax de tarjetas flotantes (`--px/--py`, ±8–28px). Pill "89 técnicos en línea · ZMG" (número vivo). H1 palabra por palabra (`wordin` .8s, blur 6px→0, stagger 70ms). Botones de tienda blancos. Prueba social (avatares + 4.9★ + 3,346 servicios). Teléfono con home de la app + 3 tarjetas flotantes (reseña, "Identidad verificada", "Llega en 15 min"). Pie: coordenadas mono, haz de luz cian recorriendo una línea, marquee de servicios (40 s).
3. **Stats**: 4 KPIs con count-up al entrar en vista (1.6 s ease-out cubic).
4. **Categorías**: bento (Plomería destacada 2×2 en ≥980px). Tilt 3D al mover el cursor (rotateX ±7°, rotateY ±9°, glare radial siguiendo el cursor).
5. **Cómo funciona**: teléfono **sticky** (top 96px, ≥980px) que cambia de pantalla (crossfade + scale .96→1) según el paso visible (IntersectionObserver `rootMargin -45% 0 -45% 0`). 4 pasos, el activo a opacidad 1, resto .32. Indicador de puntos.
6. **Técnicos verificados**: checklist que se va aprobando en secuencia (850 ms por paso: pendiente → spinner → check con pop) al entrar en vista; tarjeta KYC con línea de escaneo animada y badge "Aprobada en 9 h".
7. **Trabajos realizados**: galería (1 tile grande 2×2 + 4) de fotos reales de evidencia final (`<image-slot>` en el prototipo → imágenes de `service_evidence` con `kind='final'`). Esquinas tipo visor, etiqueta "EVIDENCIA FINAL · SVC-XXXX", pie con servicio/colonia/técnico. Tilt al hover.
8. **Reseñas**: 2 filas de marquee en sentidos opuestos (60 s / 70 s), pausa al hover.
9. **Cobertura**: mapa ZMG oscuro (Mapbox/Leaflet estilo propio) + 4 municipios con barras.
10. **Precios**: **estimador** — chips de servicio (6 rangos: Fugas $300–1,500; Contactos $200–1,200; Calentadores $400–2,500; Regulador $300–1,500; Pintura $500–4,000; Portones $600–5,000). Precio típico = min + 32% del rango, redondeado a $10. Toggle **urgente** ×1.2. Barra con marcador animado (transition .5s).
11. **Para técnicos**: bloque navy con beneficios + **calculadora**: segmentado de categoría (ticket medio Plomería $1,180 · Electricidad $860 · Aire $1,620), slider 3–30 servicios/semana → `jobs × 4.33 × ticket × 0.85`.
12. **FAQ**: acordeón con animación de altura vía `grid-template-rows 0fr↔1fr` (.35 s); ícono + rota 45°.
13. **CTA final** y **footer**.
- `?movimiento=reducido` / `prefers-reduced-motion` → sin animaciones continuas ni reveals.
- Reveal on scroll: opacity 0 + translateY(22px) → 0 en .7s `cubic-bezier(.2,.8,.2,1)`, stagger por `data-reveal`.

### A2. Login unificado (`Web Login.dc.html` → `src/app/login/page.tsx`)
Mismo fondo que el registro (aura + rejilla), tarjeta blanca 440px. Pasos: **login** (correo, contraseña con mostrar/ocultar, mantener sesión, error de credenciales con intentos restantes, bloqueo 30 s tras 3 fallos, link a registro) → si el correo es del dominio `@tumantenimiento.mx` y `profiles.role = admin`: **verificación en 2 pasos** (TOTP 6 dígitos, código de respaldo) → "Entrando a la consola…" → `/dashboard`. Cliente o técnico: **continuar en la app** (tiendas + QR, "Usar otra cuenta"). **Olvidé mi contraseña** → enlace enviado (reenviar) → **nueva contraseña** (medidor 4 segmentos, confirmación) → actualizada. `?out=1` muestra "Cerraste sesión" (logout de la consola redirige aquí). Hashes de demo: `#mfa`, `#app`, `#forgot`, `#reset`.

### B. Registro de técnico (`Web Registro Tecnico.dc.html` → `src/app/registro-tecnico/page.tsx`)
Fondo `#050F22` con 2 auras + rejilla enmascarada. Header: logo + "Volver al sitio". Pill "Red de técnicos verificados · ZMG". Tarjeta blanca 460px, radio 16, padding 24–36. Campos: nombre, correo, celular (prefijo MX +52 fijo, formato `33 0000 0000`), contraseña (mostrar/ocultar, medidor 4 segmentos), términos (checkbox custom). Validación al enviar y luego en vivo (mismas reglas que el código actual + "al menos una letra y un número"). Error de auth en caja roja. Botón con spinner "Creando tu cuenta…". Estado éxito: check con pop, correo destino, lista de documentos a tener a mano, "Descargar la app"/"Volver al inicio", reenviar correo. Debajo de la tarjeta: stepper de 3 pasos (barras 3px cian cuando están completos). `?invite=` muestra banda verde "Registro con invitación".

### C. Consola admin (`Web Consola Admin.dc.html` → `(console)/*`, `admin-shell.tsx`)
**Shell**
- Sidebar `#061B3A` 256px ↔ **riel compacto 76px** (solo íconos, badges → punto cian 10px con borde). Toggle: botón circular 28px **a mitad del borde** del sidebar + botón en header + `⌘B`. <1100px: riel 76px en flujo; al abrir, la versión completa se superpone (fixed) con scrim.
- Grupos: General (Dashboard, Notificaciones) · Usuarios (Clientes, Técnicos) · Operación (Servicios, Regiones, Finanzas, Soporte) · Analítica (Reportes) · Sistema (Catálogo, Configuración, Estados y errores). Activo: fondo `#0A6BCF`.
- Header 64px: migas (mono) + título, buscador que abre **paleta ⌘K** (pantallas, servicios, clientes, técnicos; ↑↓ ↵), toggle claro/oscuro (conserva pantalla), campana con contador de no leídas.
- Navegación: skeleton específico por tipo de pantalla (dashboard / lista / detalle) 480 ms con shimmer 1.2 s.
- Banner "Sin conexión" con Reintentar.

**Login**: fondo aura, logo 56px con halo, tarjeta blanca 420px; paso 1 correo+contraseña, paso 2 código TOTP de 6 dígitos (mono 24px, letter-spacing .3em).

**Dashboard**: banda navy con saludo según hora, reloj, segmentado Hoy/7/30 días, 4 KPIs con sparkline y count-up (900 ms). Gráfica de línea GMV con selector GMV/Servicios/Ticket medio, área con degradado, línea del periodo anterior (toggle), **línea de promedio** punteada cian con etiqueta, marcador de **máximo**, banda de columna al hover, tooltip navy con filas (anterior, variación, vs promedio, extra). Donut de pipeline (segmento hover crece 18→24px, resto opacidad .3, centro muestra detalle). Requiere atención · Actividad en vivo (nuevo evento cada 8 s) · Servicios por categoría (barras hover). Servicios recientes.

**Servicios**: tabs con conteo, búsqueda, chips de categoría, **Filtros** (sheet derecha 400px: zona multi, método, monto, urgentes, disputa; chips activos removibles; "Limpiar" con snackbar Deshacer), **rango de fechas** (popover con presets + calendario de rango). **Tabla**: checkbox por fila + seleccionar página, barra de acciones masivas (Exportar, Cancelar con Deshacer), encabezados ordenables (Servicio, Cliente, Total, Actualizado; flecha rota), menú ⋯ por fila (Ver, Editar, Copiar ID, Cancelar) renderizado **fixed** fuera del scroll, paginación 8/página. "Crear servicio" abre el formulario lateral.

**Detalle de servicio**: stepper de 8 estados (Solicitado→Pagado; terminal rojo si cancelado/expirado), copiar ID, **Editar**. Descripción + evidencias, bitácora, notas internas (Deshacer). Cliente, técnico (Reasignar → modal con lista), cobro y comisión (mano de obra, materiales, recargo 20%, total, comisión 15%, neto), acciones admin (forzar estado, reembolso con monto, cancelar).

**Clientes / Detalle**: tabs, búsqueda, filtros (zona, gasto, orden), "Nuevo cliente", editar, suspender/reactivar, historial, direcciones.

**Técnicos / Detalle**: tabs por KYC, filtros (zona, rating mínimo, disponibilidad, orden). Revisión KYC: documentos, datos, verificaciones Didit, cobro, aprobar/rechazar (motivos). Perfil aprobado: KPIs, **tarifas con edición en línea** (inputs $, rango $150–5,000), reseñas, datos bancarios, notas, editar perfil (sheet), ajustar cartera, suspender.

**Regiones**: 4 KPIs, mapa + tarjeta de zona seleccionada, **tabla de municipios ordenable** (cobertura, técnicos, demanda, solicitudes/técnico con semáforo ≥3× rojo, ≥2× ámbar), toggle activa por fila (Deshacer), panel lateral con anillo de cobertura animado, demanda por hora (barras hover), brechas con barras, técnicos con base.

**Finanzas**: KPIs, barras apiladas por día (comisión/neto) con **línea de meta diaria**, banda hover y tooltip; desglose por método (barra segmentada + filas hover); tabs Transacciones (filtro método) / Retiros (procesar individual o lote) / Carteras (ajuste) / Resumen mensual.

**Soporte**: tabs Disputas (lista + detalle + resolución segmentada) · Tickets (hilo con respuesta, marcar resuelto con Deshacer, nuevo ticket) · Cola KYC.

**Reportes**: KPIs vs metas del PRD (barras), línea de servicios, embudo hover, mapa de calor día×franja (celda hover escala 1.12, resalta día/hora, leyenda), zonas frías, desempeño por categoría, top técnicos, exportar CSV.

**Catálogo**: tarjetas con toggle publicar (Deshacer) + editor (nombre, rango, comisión específica, servicios incluidos como chips removibles). Nueva categoría.

**Configuración**: tabs laterales; campos genéricos (texto con sufijo, toggles). **Notificaciones**: tipos (KYC, Disputas, Tickets, Retiros, Servicios, Pagos, Sistema), canales (push, correo, SMS, sonido), horario (no molestar). Equipo: admins con rol y MFA, matriz de permisos, invitar. Barra "Cambios sin guardar" (Descartar/Guardar).

**Notificaciones**: panel desde la campana (440px) y página completa: Todas/No leídas, filtro por tipo (con conteo y tipos silenciados), agrupación Hoy/Anteriores, checkbox por fila + seleccionar todo, acciones masivas (marcar leídas/no leídas, eliminar con Deshacer), marcar/eliminar individual, clic → navega a su pantalla y marca leída. Respeta los tipos activos en Configuración.

**Estados y errores**: páginas 404, 500, sin conexión, 403, mantenimiento, sesión expirada (ilustración compuesta con formas, código, "Qué puedes hacer", referencia, acciones). Estados vacíos agrupados (Primer uso / Sin resultados / Todo al día / Requiere acción). Avisos (toasts, snackbar, banners). Carga (skeletons, botón con spinner, barra indeterminada).

**Formulario lateral (sheet 480px)** — crear/editar servicio, cliente, técnico: secciones con kicker, input texto (sufijo opcional), textarea, **dropdown con búsqueda** (inline, >5 opciones muestra buscador, check en seleccionado, "Sin coincidencias"), **date picker** (presets Hoy/Mañana/En 2 días/Próximo lunes, calendario 6×7 L-D, hoy con borde azul, pasados deshabilitados), segmentado, toggle, chips múltiples. Validación: errores bajo cada campo + shake .4s del footer.

**Toasts**: arriba a la derecha (top 76px, bajo el header), pila de hasta 4, barra de progreso (4.2 s; error 6 s), **pausa al hover**, cerrar ✕, acción opcional (p. ej. "Ver perfil", "Reintentar"), "Cerrar todas" con 2+. **Snackbar**: abajo al centro, navy, 5 s, con "Deshacer".

---

## Interactions & Behavior (resumen de tiempos)
- Entrada de pantalla `up`: opacity 0/translateY 10px → 0, .4–.75 s escalonado.
- Toggle knob: 250 ms `cubic-bezier(.3,1.4,.5,1)`. Sheets: `translateX(100%)→0` 320 ms `cubic-bezier(.3,1,.4,1)`. Modales: `translateY(10px) scale(.94)→0` 320 ms. Popovers: 150–200 ms.
- Gráficas: línea `stroke-dashoffset` 1.1–1.2 s; barras `scaleY` .6–.7 s con stagger 30–40 ms; tooltips `transition left/top .12s`.
- Escape cierra paleta, modales, sheets, menús. ⌘K paleta. ⌘B sidebar.

## State Management
- Global UI: `drawerOpen`, `narrow`, `theme`, `palette{open,q,idx}`, `toasts[] {id,kind,title,sub,action,dur,paused}`, `snack{text,undo}`, `modal{kind,...}`, `formSheet{kind,id,values,errors}`, `offline`.
- Listas: filtros por lista (`sf/tf/cf`), `range{kind,a,b}`, `sort{key,dir}`, `selection[]`, `page`.
- Notificaciones: `notifications[] {id,type,title,body,ts,read,to:[route,params]}`, `nSel[]`, `nTab`, `nType`; preferencias en `platform_settings`/perfil admin.
- Landing: `scrolled`, `activeSection`, `step`, `verifStep`, `estimator{service,urgent}`, `calc{jobs,category}`, `faqOpen`.

## Assets
- Logo: `BrandMark` existente en `src/components/ui.tsx` (mismo glifo casa + llave).
- Fotos de trabajos: evidencia final real de `service_evidence` (bucket `job-evidence`, URLs firmadas).
- Mapas: `tumtto-map.js` (Mapbox, estilo claro/oscuro) y `zmg-map.js` (Leaflet de cobertura ZMG) como referencia; en código usar `coverage-map.tsx` / `landing-map.tsx` existentes con el estilo indicado.
- Sin imágenes generadas; placeholders rayados indican documentos/fotos.

## Files (design_files/)
- `Web Prototipo.dc.html` — entrada: prototipo + mapa de todos los flujos.
- `Web Landing.dc.html` — landing.
- `Web Login.dc.html` — login unificado + recuperación + 2 pasos.
- `Web Registro Tecnico.dc.html` — registro de técnicos.
- `Web Consola Admin.dc.html` / `Web Consola Admin Dark.dc.html` — consola (claro/oscuro; `#s=<pantalla>`).
- `Style Guide.dc.html` — guía de estilos única (app + web, sección 13).
- `support.js`, `ios-frame.jsx`, `tumtto-map.js`, `zmg-map.js`, `image-slot.js` — soporte para abrir los prototipos.

## Sugerencia de orden de implementación
1. Tokens en `globals.css` (claro + `[data-theme=dark]`) y primitivas en `ui.tsx` (Button, Input, Select con búsqueda, DatePicker, Sheet, Modal, Toast stack, Snackbar, Tabs, Segmented, Toggle, Chip, Pill, Skeleton, EmptyState, ErrorPage).
2. `admin-shell.tsx` (sidebar colapsable, paleta, notificaciones) y `DataTable` con orden/selección/paginación/menú.
3. Pantallas de consola en el orden de los flujos de `Web Prototipo`.
4. Landing y registro.

## Screenshots
Capturas de referencia (~924px de ancho; la consola aparece con la navegación compacta en ese ancho). Las fotos de trabajos se ven vacías: son espacios para imágenes reales.
- `screenshots/landing/` — hero, categorías, cómo funciona, técnicos verificados, trabajos realizados, cobertura, estimador de precios, para técnicos, FAQ.
- `screenshots/login/` — iniciar sesión, verificación en 2 pasos, continuar en la app, olvidé mi contraseña, nueva contraseña.
- `screenshots/registro/` — paso 1 (datos), paso 2 (oficio), cuenta creada.
- `screenshots/consola/` — dashboard, servicios, detalle de servicio, clientes, detalle de cliente, técnicos, revisión KYC, regiones, finanzas, soporte, reportes, catálogo, configuración, notificaciones, estados y errores, 404, 500, sin conexión.
- `screenshots/consola-oscuro/` — dashboard, servicios, revisión KYC, finanzas, notificaciones.
