/* global React */
/* Servicios — mock data + status meta */

const SVC_TABS = [
  { id: "all",       label: "Todos",          count: 12847 },
  { id: "requested", label: "Solicitados",    count: 28 },
  { id: "accepted",  label: "Aceptados",      count: 47, tone: "info" },
  { id: "enroute",   label: "En camino",      count: 12, tone: "warn" },
  { id: "running",   label: "En ejecución",   count: 35, tone: "blue" },
  { id: "done",      label: "Completados hoy",count: 128, tone: "ok" },
  { id: "disputed",  label: "Con disputa",    count: 5, tone: "err" },
  { id: "canceled",  label: "Cancelados",     count: 218, tone: "muted" },
];

const SVC_STATUS = {
  "solicitado":   { label: "Solicitado",   bg: "#EEF3F8", fg: "#0E2C56", dot: "#6B7280" },
  "aceptado":     { label: "Aceptado",     bg: "#E0F6FF", fg: "#0884B0", dot: "#0884B0" },
  "en-camino":    { label: "En camino",    bg: "#FEF3DC", fg: "#B45309", dot: "#F59E0B" },
  "en-ejecucion": { label: "En ejecución", bg: "rgba(10,107,207,0.12)", fg: "#0A6BCF", dot: "#0A6BCF" },
  "completado":   { label: "Completado",   bg: "#E5F7EE", fg: "#18A66A", dot: "#18A66A" },
  "disputa":      { label: "Disputa",      bg: "#FCE9E9", fg: "#DC2626", dot: "#DC2626" },
  "cancelado":    { label: "Cancelado",    bg: "#EEF3F8", fg: "#6B7280", dot: "#9CA3AF" },
};

const SVC_PAYMENT = {
  card:  { icon: "credit-card", label: "Visa", color: "#0A6BCF" },
  oxxo:  { icon: "store",       label: "OXXO", color: "#B45309" },
  mp:    { icon: "wallet",      label: "MP",   color: "#0884B0" },
  cash:  { icon: "banknote",    label: "Efec", color: "#18A66A" },
};

const SERVICES_LIST = [
  { id: "SVC-2847", client: "María Rodríguez Gómez",    tech: "Ramón Hernández",      techRating: 4.9, cat: "Plomería · Fugas",                status: "en-ejecucion", scheduled: "19/05 · 14:00", elapsed: "23 min", total: "$1,250", base: 850, extras: 400, pay: "card",  region: "Zapopan · Providencia" },
  { id: "SVC-2846", client: "José Carlos Juárez",       tech: "Adriana García Soto",  techRating: 4.8, cat: "Electricidad · Tableros",         status: "en-camino",    scheduled: "19/05 · 14:30", elapsed: "8 min",  total: "$820",   base: 650, extras: 170, pay: "card",  region: "Guadalajara · Chapalita" },
  { id: "SVC-2845", client: "Lupita Pérez Solís",       tech: "Miguel Salazar Q.",    techRating: 4.7, cat: "Gas · Revisión",                  status: "completado",   scheduled: "19/05 · 13:00", elapsed: "—",      total: "$640",   base: 640, extras: 0,   pay: "oxxo",  region: "Tlaquepaque · Centro" },
  { id: "SVC-2844", client: "Fernando Aguilar Ríos",    tech: "Daniela Ortega C.",    techRating: 4.5, cat: "Drenaje · Desazolve",             status: "en-ejecucion", scheduled: "19/05 · 13:30", elapsed: "45 min", total: "$1,890", base: 1500,extras: 390, pay: "card",  region: "Zapopan · Andares" },
  { id: "SVC-2843", client: "Carlos Iván Velázquez",    tech: "—",                    techRating: null,cat: "Cristales · Sustitución",         status: "solicitado",   scheduled: "19/05 · 15:30", elapsed: "3 min",  total: "$720",   base: 720, extras: 0,   pay: "mp",    region: "Guadalajara · Lomas del Valle" },
  { id: "SVC-2842", client: "Adriana Sandoval Reyes",   tech: "Ricardo Mendoza A.",   techRating: 4.9, cat: "Pintura · Interior",              status: "aceptado",     scheduled: "19/05 · 16:00", elapsed: "12 min", total: "$2,400", base: 2100,extras: 300, pay: "card",  region: "Tlajomulco · La Estancia" },
  { id: "SVC-2841", client: "Roberto Villanueva",       tech: "Sergio Camarena R.",   techRating: 4.7, cat: "Impermeabilización · Azotea",     status: "completado",   scheduled: "19/05 · 12:00", elapsed: "—",      total: "$3,150", base: 2800,extras: 350, pay: "card",  region: "Zapopan · Las Águilas" },
  { id: "SVC-2840", client: "Ana Karen Morales C.",     tech: "Luis Esteban Gómez",   techRating: 3.9, cat: "Plomería · Calentador",           status: "cancelado",    scheduled: "19/05 · 11:00", elapsed: "—",      total: "$0",     base: 0,   extras: 0,   pay: "card",  region: "Guadalajara · Country Club" },
  { id: "SVC-2839", client: "Miguel Salazar Quintero",  tech: "Adriana García Soto",  techRating: 4.8, cat: "Electricidad · Contactos",        status: "disputa",      scheduled: "18/05 · 17:00", elapsed: "hace 2 h",total: "$1,080", base: 900, extras: 180, pay: "card",  region: "Guadalajara · Centro" },
  { id: "SVC-2838", client: "Ana Sofía Treviño L.",     tech: "Ramón Hernández",      techRating: 4.9, cat: "Plomería · Drenaje",              status: "en-camino",    scheduled: "19/05 · 15:00", elapsed: "12 min", total: "$1,420", base: 1100,extras: 320, pay: "mp",    region: "Zapopan · Providencia" },
  { id: "SVC-2837", client: "Daniela Ortega Camacho",   tech: "Sergio Camarena R.",   techRating: 4.7, cat: "Impermeabilización",              status: "aceptado",     scheduled: "19/05 · 17:00", elapsed: "6 min",  total: "$2,650", base: 2400,extras: 250, pay: "card",  region: "Tonalá · Centro" },
  { id: "SVC-2836", client: "Carlos Iván Velázquez",    tech: "Fernanda Olivares R.", techRating: 4.6, cat: "Plomería · Fugas",                status: "completado",   scheduled: "18/05 · 16:00", elapsed: "—",      total: "$890",   base: 850, extras: 40,  pay: "cash",  region: "El Salto · Centro" },
  { id: "SVC-2835", client: "María Rodríguez Gómez",    tech: "Ramón Hernández",      techRating: 4.9, cat: "Plomería · Calentador",           status: "completado",   scheduled: "17/05 · 14:30", elapsed: "—",      total: "$1,640", base: 1400,extras: 240, pay: "card",  region: "Zapopan · Providencia" },
  { id: "SVC-2834", client: "Roberto Villanueva",       tech: "Daniela Ortega C.",    techRating: 4.5, cat: "Drenaje · Limpieza",              status: "disputa",      scheduled: "17/05 · 11:00", elapsed: "hace 1 d",total: "$2,100", base: 1900,extras: 200, pay: "card",  region: "Zapopan · Las Águilas" },
  { id: "SVC-2833", client: "José Carlos Juárez",       tech: "Adriana García Soto",  techRating: 4.8, cat: "Electricidad · Iluminación",      status: "completado",   scheduled: "17/05 · 10:00", elapsed: "—",      total: "$520",   base: 480, extras: 40,  pay: "card",  region: "Guadalajara · Chapalita" },
];

// Detail for SVC-2847
const DETAIL = {
  id: "SVC-2847",
  status: "en-ejecucion",
  category: "Plomería · Fugas",
  scheduled: "19/05/2026 · 14:00",
  region: "Zapopan · Providencia",
  source: "App iOS v1.2.4",
  auditEvents: 12,

  client: {
    name: "María Rodríguez Gómez",
    initials: "MR",
    phone: "33 1234 5678",
    email: "maria.rg@gmail.com",
    address: "Av. Patria 1234, Col. Providencia",
    city: "Zapopan, Jal. C.P. 45160",
  },
  tech: {
    name: "Ramón Hernández García",
    initials: "RH",
    phone: "33 2014 8765",
    rating: 4.9,
    reviews: 124,
    category: "Plomería · 12 años de oficio",
  },
  pricing: {
    base: 850,
    extras: [
      { label: "Cambio de llave de paso 1/2\"",  amount: 250 },
      { label: "Sellado epóxico en codo",        amount: 150 },
    ],
    subtotal: 1250,
    commission: -187.5,
    techNet: 1062.5,
    payMethod: "Tarjeta Visa BBVA •••• 1234",
    payStatus: "paid",
  },
  timeline: [
    { time: "14:02", actor: "client", icon: "send",           title: "Servicio solicitado",      note: "María R. · Plomería › Fugas. Descripción: \"Fuga en codo bajo el lavabo, gotea constante.\"", status: "done" },
    { time: "14:05", actor: "tech",   icon: "user-check",     title: "Aceptado por técnico",     note: "Ramón H. aceptó la orden a 4 km del sitio. ETA inicial: 28 min.", status: "done" },
    { time: "14:32", actor: "tech",   icon: "navigation",     title: "Técnico en camino",        note: "Geolocalización en vivo desde Av. Patria 1500 → Av. Patria 1234.", status: "done", geo: true },
    { time: "14:58", actor: "tech",   icon: "flag",           title: "Técnico llegó al sitio",   note: "Check-in confirmado con foto del exterior del domicilio.", status: "done", evidence: 1 },
    { time: "15:10", actor: "tech",   icon: "clipboard-list", title: "Diagnóstico completado",   note: "Extras propuestos: cambio de llave de paso $250 · sellado epóxico $150.", status: "done" },
    { time: "15:12", actor: "client", icon: "check-circle-2", title: "Cliente aprobó cotización", note: "Total actualizado: $1,250 MXN. Firma digital registrada.", status: "done" },
    { time: "15:45", actor: "tech",   icon: "play",           title: "Servicio en ejecución",    note: "Inicio del trabajo. Foto de evidencia inicial adjunta.", status: "done", evidence: 1, current: true },
    { time: "16:20", actor: "tech",   icon: "check-check",    title: "Servicio completado",      note: "3 fotos de evidencia final adjuntas.", status: "future", evidence: 3 },
    { time: "16:22", actor: "system", icon: "credit-card",    title: "Pago procesado",           note: "Tarjeta Visa •••• 1234 · $1,250 MXN cobrados.", status: "future" },
    { time: "16:25", actor: "client", icon: "star",           title: "Calificación del cliente", note: "★ 5 — \"Excelente, muy puntual y limpio.\"", status: "future" },
    { time: "16:30", actor: "tech",   icon: "star",           title: "Calificación al cliente",  note: "★ 5 — \"Pago rápido, acceso fácil.\"", status: "future" },
  ],
  notes: [
    { author: "Sofía Martínez", role: "Admin", time: "Hoy · 15:14", text: "Confirmé con cliente por chat que sí aprobó los extras antes del inicio. Todo en orden." },
  ],
};

Object.assign(window, { SVC_TABS, SVC_STATUS, SVC_PAYMENT, SERVICES_LIST, DETAIL });
