#!/bin/bash
#
# Iniciar-Demo.command — Lanza el demo de Tumantenimiento para stakeholders.
# Doble clic en Finder para usarlo. Cierra la ventana de Terminal para detenerlo.
#
set -e

# Ir a la carpeta de este script (raíz del proyecto), sin importar desde dónde se abra.
cd "$(dirname "$0")"

PORT=4178
DIR="Tumantenimiento"
URL="http://localhost:${PORT}/Index.html"

echo "────────────────────────────────────────────────────────"
echo "  Tumantenimiento · Demo de prototipos"
echo "────────────────────────────────────────────────────────"
echo ""

# Si el puerto ya está ocupado (un demo previo abierto), reusarlo y solo abrir el navegador.
if lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
  echo "  El servidor ya estaba corriendo en el puerto ${PORT}."
  echo "  Abriendo el índice en el navegador…"
  open "${URL}"
  echo ""
  echo "  Listo. Puedes cerrar esta ventana."
  exit 0
fi

echo "  Iniciando servidor local en el puerto ${PORT}…"
echo "  Índice:  ${URL}"
echo ""
echo "  ▸ Se abrirá tu navegador en unos segundos."
echo "  ▸ Para DETENER el demo: cierra esta ventana de Terminal"
echo "    (o presiona Control-C aquí)."
echo ""
echo "────────────────────────────────────────────────────────"

# Abrir el navegador un instante después de levantar el servidor.
( sleep 1.5; open "${URL}" ) &

# Levantar el servidor estático (queda en primer plano; cerrar la ventana lo detiene).
exec python3 -m http.server ${PORT} --directory "${DIR}"
