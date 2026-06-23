# Prompt para Claude Code · Organizar y presentar HTMLs de Tumantenimiento

Copia y pega esto en Claude Code (CLI o cursor) cuando estés en la raíz del proyecto:

---

```
Tengo un proyecto de diseño de Tumantenimiento (plataforma mexicana de servicios de
mantenimiento) con ~40 archivos HTML que representan distintas pantallas y flujos.
Necesito que los organices en un orden presentable y crees una página índice de
navegación para mostrarlos a stakeholders.

CONTEXTO DEL PROYECTO:
- Plataforma con 3 audiencias: CLIENTE (mobile), TÉCNICO (mobile), ADMIN (mobile + web).
- Identidad: Primary Blue #0A6BCF, Deep Navy #0E2C56, fuentes Manrope + Inter.
- Tipos de archivos:
  1. Design System y exploraciones tempranas
  2. Flujos del CLIENTE mobile
  3. Flujos del TÉCNICO mobile (PRO)
  4. Pantallas del ADMIN (mobile y web)
  5. UI Library (6 secciones de componentes con specs)

QUÉ NECESITO QUE HAGAS:

1. AGRUPACIÓN
   Clasifica cada archivo HTML en una de estas secciones (revisa el contenido si
   tienes dudas — no te bases solo en el nombre):

   A. FOUNDATIONS
      - Design System.html
      - UILibraryPrimitives.html, UILibraryContainers.html, UILibraryNavigation.html,
        UILibraryForms.html, UILibraryDataDisplay.html, UILibraryDomain.html

   B. CLIENTE · MOBILE (ordena por el ciclo de vida del usuario):
      onboarding → descubrimiento → solicitud/agenda → seguimiento →
      chat → pago → calificación → mi cuenta
      Archivos a clasificar (entre otros):
      Login.html, Onboarding.html, Discovery.html, Home.html, Wizard.html,
      Tracking.html, Chat.html, Pago.html, Calificacion.html, Inbox.html,
      MisServicios.html, PerfilCliente.html, Profile.html

   C. TÉCNICO · MOBILE PRO (ordena por el ciclo de vida del técnico):
      onboarding → home/inbox → solicitud → ejecución → agenda → perfil
      Archivos a clasificar:
      TecnicoOnboarding.html, TecnicoPerfilTarifas.html, TecnicoHome.html,
      TecnicoDetalleSolicitud.html, TecnicoEjecucion.html, TecnicoAgenda.html,
      TecnicoPerfil.html

   D. ADMIN
      Mobile:  AdminMobile.html, AdminKycDisputas.html
      Web:     Dashboard.html, Clientes.html, Tecnicos.html, Servicios.html,
               Soporte.html, Finanzas.html, Reportes.html, Regiones.html,
               Catalogo.html, Config.html
      (también revisa B2.html — clasifícalo donde tenga más sentido)

2. ORDEN RECOMENDADO DE PRESENTACIÓN
   Dentro de cada sección, ordena los archivos siguiendo el viaje natural del
   usuario. Para cliente: empieza por onboarding y termina por perfil/cuenta. Para
   técnico igual. Para admin: empieza por dashboard, luego usuarios → servicios →
   soporte → finanzas. UI Library va al final (es referencia técnica, no narrativa).

3. GENERAR ÍNDICE
   Crea un archivo `Index.html` en la raíz del proyecto con:
   - Hero con el branding del proyecto (gradient navy → blue, fuente Manrope).
   - Cuatro secciones expandibles o tabs:
       1. FOUNDATIONS (con badge "Design System" + cards de cada sección de la
          UI Library mostrando # componentes).
       2. CLIENTE MOBILE (cards en orden de flujo, con thumbnail SVG o ícono
          contextual, título, descripción de una línea y badge de # pantallas
          si lo conoces).
       3. TÉCNICO MOBILE (mismo formato, con chip ámbar "PRO").
       4. ADMIN (separado en sub-secciones Mobile y Web).
   - Cada card debe linkear al HTML correspondiente con `target="_blank"`.
   - Usa los mismos design tokens del proyecto:
       Primary Blue #0A6BCF, Deep Navy #0E2C56, Accent Cyan #18C1FF,
       Success Green #18A66A, Warning Amber #F59E0B, Error Red #DC2626.
       Fuentes Inter (UI) + Manrope (títulos/branding) + JetBrains Mono
       (metadata/labels).
   - Footer con # total de pantallas, versión, fecha.

4. METADATA OPCIONAL
   Si te ayuda, crea un archivo `manifest.json` con la estructura serializada:
   ```
   {
     "sections": [
       { "id": "foundations", "title": "Foundations", "items": [...] },
       { "id": "cliente",     "title": "Cliente · Mobile", "items": [...] },
       { "id": "tecnico",     "title": "Técnico · PRO", "items": [...] },
       { "id": "admin",       "title": "Admin", "items": [...] }
     ]
   }
   ```
   El `Index.html` puede consumirlo o tenerlo inline.

5. DETALLES VISUALES DEL ÍNDICE
   - Cards con shadow suave, hover lift sutil.
   - Cada card incluye: ícono Lucide (lucide-react o CDN), título Manrope, una
     línea de descripción, chip con # de pantallas o tipo (Mobile / Web).
   - Sticky top con tabs de las 4 secciones para navegación rápida.
   - Responsive: 1 columna mobile, 2 tablet, 3-4 desktop.

ENTREGABLES:
1. `Index.html` listo para abrir en navegador con todos los enlaces funcionando.
2. `manifest.json` con la estructura.
3. Resumen breve en la terminal de qué archivos quedaron sin clasificar o que
   necesitan revisión humana.

NOTAS:
- NO modifiques los HTMLs existentes — solo crea archivos nuevos.
- Si encuentras nombres duplicados con función similar (ej. Profile.html y
  PerfilCliente.html), señálalo y sugiere cuál conservar.
- Mantén el tono profesional pero cercano — esto es para presentar a stakeholders
  no técnicos.
```

---

## Cómo usarlo

1. Instala Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Navega a la carpeta del proyecto (descárgalo desde el botón Export del editor).
3. Corre `claude` y pega el prompt anterior.
4. Claude Code revisará cada HTML, los clasificará, y generará `Index.html` + `manifest.json`.

## Sugerencia extra

Si quieres aún más control, agrega esta línea al final del prompt:

> Antes de generar, muéstrame el orden propuesto en una tabla y espera mi
> confirmación. Si propongo cambios, ajusta y luego genera los archivos.
