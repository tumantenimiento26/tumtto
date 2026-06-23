/* global React */
/* Shared data + styles for the Clientes module.
 * Exposes: CLIENT_TABS, CLIENTS, MARIA, ctab, cl, cd
 */

const CLIENT_TABS = [
  { id: "all",        label: "Todos",                     count: 4832 },
  { id: "active30",   label: "Activos últimos 30 d",       count: 1247, tone: "ok" },
  { id: "recurrent",  label: "Recurrentes (90 d)",         count: 412,  tone: "info" },
  { id: "suspended",  label: "Suspendidos",                count: 8,    tone: "err" },
];

const CLIENT_STATUS = {
  active:    { label: "Activo",     bg: "#E5F7EE", fg: "#18A66A", dot: "#18A66A" },
  inactive:  { label: "Inactivo",   bg: "#EEF3F8", fg: "#6B7280", dot: "#9CA3AF" },
  suspended: { label: "Suspendido", bg: "#FCE9E9", fg: "#DC2626", dot: "#DC2626" },
};

const CLIENTS = [
  { name: "María Rodríguez Gómez",       email: "maria.rg@gmail.com",          phone: "33 1234 5678", region: "Zapopan",     services: 14, gmv: "$18,450", rating: 4.9, last: "hace 3 d",  status: "active",    avTone: 0, disputes: 0 },
  { name: "José Carlos Juárez Mendoza",  email: "jc.juarez@outlook.com",       phone: "33 2014 3987", region: "Guadalajara", services: 8,  gmv: "$9,820",  rating: 4.8, last: "hace 5 d",  status: "active",    avTone: 1, disputes: 0 },
  { name: "Lupita Pérez Solís",          email: "lupita.psolis@gmail.com",     phone: "33 1567 4421", region: "Tlaquepaque", services: 22, gmv: "$32,180", rating: 5.0, last: "hace 1 d",  status: "active",    avTone: 2, disputes: 0 },
  { name: "Fernando Aguilar Ríos",       email: "f.aguilar@empresa.mx",        phone: "33 3120 9846", region: "Zapopan",     services: 19, gmv: "$45,920", rating: 4.7, last: "hace 8 h",  status: "active",    avTone: 3, disputes: 1 },
  { name: "Carlos Iván Velázquez Robles", email: "civanvr@hotmail.com",        phone: "33 1788 0245", region: "Guadalajara", services: 5,  gmv: "$4,360",  rating: 4.2, last: "hace 12 d", status: "active",    avTone: 0, disputes: 0 },
  { name: "Adriana Sandoval Reyes",      email: "adriana.sandoval@gmail.com",  phone: "33 4502 1167", region: "Tlajomulco",  services: 11, gmv: "$14,720", rating: 4.6, last: "hace 4 d",  status: "active",    avTone: 1, disputes: 0 },
  { name: "Roberto Villanueva Aceves",   email: "r.villanueva@outlook.com",    phone: "33 1992 0354", region: "Zapopan",     services: 3,  gmv: "$2,180",  rating: 3.8, last: "hace 22 d", status: "inactive",  avTone: 2, disputes: 0 },
  { name: "Ana Karen Morales Cárdenas",  email: "ak.morales@gmail.com",        phone: "33 3678 8210", region: "Guadalajara", services: 28, gmv: "$58,340", rating: 4.9, last: "hace 6 h",  status: "active",    avTone: 3, disputes: 0 },
  { name: "Daniela Ortega Camacho",      email: "dani.ortega@gmail.com",       phone: "33 1745 6788", region: "Tonalá",      services: 7,  gmv: "$8,940",  rating: 4.5, last: "hace 9 d",  status: "active",    avTone: 0, disputes: 0 },
  { name: "Sergio Camarena Villarreal",  email: "s.camarena@yahoo.com.mx",     phone: "33 2356 4490", region: "El Salto",    services: 2,  gmv: "$1,620",  rating: 3.4, last: "hace 45 d", status: "suspended", avTone: 1, disputes: 2 },
  { name: "Miguel Salazar Quintero",     email: "miguel.salazar@gmail.com",    phone: "33 2811 7733", region: "Zapopan",     services: 16, gmv: "$22,150", rating: 4.8, last: "hace 2 d",  status: "active",    avTone: 2, disputes: 0 },
  { name: "Ana Sofía Treviño López",     email: "ast.lopez@gmail.com",         phone: "33 1029 5544", region: "Guadalajara", services: 6,  gmv: "$6,750",  rating: 4.4, last: "hace 16 d", status: "inactive",  avTone: 3, disputes: 0 },
];

// Single client detail (María Rodríguez)
const MARIA = {
  name: "María Rodríguez Gómez",
  initials: "MR",
  email: "maria.rg@gmail.com",
  phone: "33 1234 5678",
  registered: "16/09/2025 · hace 8 meses",
  lastSeen: "hace 3 días",
  region: "Zapopan, Jal.",
  preferredPay: "Tarjeta •••• 1234 (BBVA)",
  stats: [
    { label: "Servicios totales",  value: "14",      sub: "12 completados · 2 cancelados" },
    { label: "Gasto total",        value: "$18,450", sub: "MXN · últimos 8 meses" },
    { label: "Ticket promedio",    value: "$1,318",  sub: "MXN por servicio" },
    { label: "Tasa de cancelación", value: "14%",    sub: "2 de 14 · debajo del promedio" },
    { label: "Categoría favorita", value: "Plomería", sub: "6 servicios · 43% del gasto" },
    { label: "Técnico recurrente", value: "Ramón H.", sub: "4 servicios · siempre 5★" },
  ],
  addresses: [
    { id: 1, label: "Casa", street: "Av. Patria 1500, Col. Providencia", city: "Zapopan, Jal. C.P. 45160", primary: true },
    { id: 2, label: "Oficina", street: "Av. Vallarta 5500, Col. Vallarta Universidad", city: "Zapopan, Jal. C.P. 45110" },
    { id: 3, label: "Casa de mamá", street: "Calle Reforma 245, Col. Chapalita", city: "Guadalajara, Jal. C.P. 44500" },
  ],
  recent: [
    { id: "SVC-2847", cat: "Plomería",          tech: "Ramón Hernández",   date: "17/05/2026", status: "completado",   total: "$1,250" },
    { id: "SVC-2731", cat: "Electricidad",       tech: "Adriana García",    date: "08/05/2026", status: "completado",   total: "$820"   },
    { id: "SVC-2618", cat: "Drenaje",            tech: "Daniela Ortega",    date: "24/04/2026", status: "completado",   total: "$1,890" },
    { id: "SVC-2580", cat: "Plomería",          tech: "Ramón Hernández",   date: "11/04/2026", status: "completado",   total: "$640"   },
    { id: "SVC-2502", cat: "Impermeabilización", tech: "Sergio Camarena",   date: "27/03/2026", status: "cancelado",    total: "$0"     },
  ],
  payment: [
    { kind: "card",  brand: "BBVA Visa",    detail: "•••• 1234",  exp: "Exp. 09/29", primary: true },
    { kind: "oxxo",  brand: "OXXO Pay",     detail: "Pago en efectivo", verified: true },
    { kind: "mp",    brand: "Mercado Pago", detail: "Vinculado con maria.rg@gmail.com", verified: true },
  ],
  reputation: {
    rating: 4.9,
    reviews: 12,
    breakdown: [
      { stars: 5, n: 10 }, { stars: 4, n: 2 }, { stars: 3, n: 0 }, { stars: 2, n: 0 }, { stars: 1, n: 0 },
    ],
    tags: [
      { label: "Comunicación clara", n: 9 },
      { label: "Acceso fácil",       n: 8 },
      { label: "Pago puntual",       n: 11 },
      { label: "Cliente recurrente", n: 6 },
      { label: "Buena ubicación",    n: 5 },
    ],
  },
};

// Tones for circle avatars
const AV_TONES = [
  { bg: "rgba(10,107,207,0.14)",  fg: "#0A6BCF" },
  { bg: "rgba(24,193,255,0.18)",  fg: "#0884B0" },
  { bg: "rgba(14,44,86,0.10)",    fg: "#0E2C56" },
  { bg: "rgba(24,166,106,0.16)",  fg: "#18A66A" },
];

Object.assign(window, { CLIENT_TABS, CLIENT_STATUS, CLIENTS, MARIA, AV_TONES });
