# Tumantenimiento · Prototipos

Plataforma mexicana de servicios de mantenimiento. Este repositorio contiene los
prototipos navegables de alta fidelidad para las tres audiencias del producto:
**Cliente** (mobile), **Técnico / PRO** (mobile) y **Administración** (mobile + web).

> **40 prototipos** · **136 pantallas** · **35 componentes de UI** · **3 audiencias**

## Cómo ver la demo

Cada pantalla es React + Babel (standalone) que se carga desde un archivo `.jsx` por
HTTP, así que **necesita un servidor local**: abrir los `.html` con doble clic muestra
pantalla en blanco. También requiere **conexión a internet** (React, Babel, íconos y
fuentes se cargan desde CDN).

### Opción 1 — Lanzador (macOS)

Doble clic en **`Iniciar-Demo.command`**. Levanta el servidor local y abre el índice en
el navegador. Para detenerlo, cierra la ventana de Terminal.

> La primera vez, macOS puede pedir permiso (Gatekeeper): clic derecho → **Abrir** → **Abrir**.

### Opción 2 — Manual

```bash
cd Tumantenimiento
python3 -m http.server 4178
```

Luego abre <http://localhost:4178/Index.html>.

### Sin servidor (plan B)

`Tumantenimiento/SinPagos.html` es una versión *standalone* (todo embebido) que
funciona con doble clic, sin servidor.

## Estructura

| Ruta | Descripción |
| --- | --- |
| `Tumantenimiento/Index.html` | Índice navegable — punto de entrada de la demo. |
| `Tumantenimiento/*.html` | Loaders de cada pantalla. |
| `Tumantenimiento/*.jsx` | Implementación de cada pantalla / componente. |
| `Tumantenimiento/manifest.json` | Estructura serializada de las secciones. |
| `tumantenimiento_logo_assets/` | Recursos de marca. |
| `PRD_Plataforma_Servicios_Mantenimiento.docx` | Documento de requerimientos (PRD). |

## Secciones

1. **Foundations** — Design System + librería de componentes (UI Library).
2. **Cliente · Mobile** — del onboarding a la gestión de la cuenta.
3. **Técnico · PRO** — del alta a la ejecución del servicio.
4. **Admin** — operación en mobile y web.

---

Identidad de marca: Primary Blue `#0A6BCF` · Deep Navy `#0E2C56` · Accent Cyan `#18C1FF`
· tipografías Manrope + Inter + JetBrains Mono.
