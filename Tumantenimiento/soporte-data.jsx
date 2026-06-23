/* global React */
/* Soporte — mock data */

const SUP_TABS = [
  { id: "all",       label: "Todos",                count: 87 },
  { id: "mine",      label: "Asignados a mí",       count: 12, tone: "blue" },
  { id: "disputes",  label: "Disputas",             count: 8,  tone: "err" },
  { id: "general",   label: "Soporte general",      count: 47, tone: "info" },
  { id: "refunds",   label: "Reembolsos",           count: 15, tone: "warn" },
  { id: "reviews",   label: "Reportes de reseñas",  count: 5 },
];

const TYPE_BADGE = {
  disputa:   { label: "Disputa",   bg: "#FCE9E9", fg: "#DC2626", dot: "#DC2626" },
  soporte:   { label: "Soporte",   bg: "rgba(10,107,207,0.10)", fg: "#0A6BCF", dot: "#0A6BCF" },
  reembolso: { label: "Reembolso", bg: "#FEF3DC", fg: "#B45309", dot: "#F59E0B" },
  reseña:    { label: "Reseña",    bg: "#E0F6FF", fg: "#0884B0", dot: "#0884B0" },
};

const TICKETS = [
  { id: "TKT-3471", user: "María Rodríguez Gómez",  initials: "MR", type: "disputa",   preview: "El técnico no terminó el trabajo y se llevó las refacciones, exijo reembolso completo.", time: "hace 12 min", unread: true,  sla: "1h 48m", slaTone: "warn",  selected: true, priority: "high" },
  { id: "TKT-3470", user: "Ramón Hernández García", initials: "RH", type: "soporte",   preview: "No me llegó mi retiro de la semana pasada, ya verifiqué con BBVA y dicen que no hay depósito.", time: "hace 1 h", unread: true,  sla: "5h 12m", slaTone: "ok" },
  { id: "TKT-3469", user: "Lupita Pérez Solís",     initials: "LP", type: "reembolso", preview: "Quiero cancelar el servicio que pagué con OXXO, no puedo estar el día programado.", time: "hace 3 h", unread: false, sla: "7h", slaTone: "ok" },
  { id: "TKT-3468", user: "Fernando Aguilar Ríos",  initials: "FA", type: "disputa",   preview: "Pagué $1,890 pero el drenaje sigue tapado. Tengo fotos y video.", time: "hace 4 h", unread: false, sla: "vencido", slaTone: "err" },
  { id: "TKT-3467", user: "José Carlos Juárez",     initials: "JC", type: "soporte",   preview: "Mi tarjeta no acepta el pago aunque tiene saldo. Lo intenté con 3 tarjetas distintas.", time: "hace 6 h", unread: false, sla: null },
  { id: "TKT-3466", user: "Adriana Sandoval R.",    initials: "AS", type: "reseña",    preview: "El técnico dejó una reseña con palabras altisonantes después de que cancelé, quisiera reportarla.", time: "ayer", unread: false, sla: null },
  { id: "TKT-3465", user: "Daniela Ortega Camacho", initials: "DO", type: "soporte",   preview: "No me deja agregar otra dirección a mi perfil, sale error 500.", time: "ayer", unread: false, sla: null },
  { id: "TKT-3464", user: "Sergio Camarena R.",     initials: "SC", type: "reembolso", preview: "El cliente pidió cancelación a los 5 min de empezar el trabajo, ¿qué pasa con mi pago?", time: "ayer", unread: false, sla: null },
  { id: "TKT-3463", user: "Miguel Salazar Q.",      initials: "MS", type: "soporte",   preview: "Quiero cambiar mi categoría principal de Plomería a Drenaje, ¿puedo hacerlo solo?", time: "hace 2 d", unread: false, sla: null },
  { id: "TKT-3462", user: "Ana Karen Morales C.",   initials: "AK", type: "disputa",   preview: "El técnico fue grosero conmigo, no lo voy a recibir si me lo reasignan otra vez.", time: "hace 2 d", unread: false, sla: null },
];

// Active dispute conversation (TKT-3471 — María Rodríguez)
const ACTIVE = {
  id: "TKT-3471",
  type: "disputa",
  status: "Abierto",
  createdAt: "Hoy · 14:32",
  service: { id: "SVC-2812", status: "en-ejecucion", tech: "Ramón Hernández", date: "18/05/2026", amount: "$1,890 MXN" },
  client: {
    initials: "MR",
    name: "María Rodríguez Gómez",
    role: "Cliente",
    region: "Zapopan · Providencia",
    services: 14,
    rating: 4.9,
    since: "Sep 2025",
  },
  tech: {
    initials: "RH",
    name: "Ramón Hernández García",
    role: "Técnico",
    region: "Zapopan",
    rating: 4.9,
    jobs: 214,
    since: "Mar 2024",
  },
  messages: [
    { from: "user", actor: "María Rodríguez", initials: "MR", time: "14:32", text: "Hola, vengo a abrir una disputa. El técnico Ramón dejó el trabajo a la mitad y se llevó las refacciones que pagué. La fuga sigue ahí, hice un destrozo en mi cocina." },
    { from: "user", actor: "María Rodríguez", initials: "MR", time: "14:33", text: "Estas son las fotos de cómo dejó todo. Tengo más videos si los necesitan.", attachments: 3 },
    { from: "admin", actor: "Sofía Martínez", time: "14:45", text: "Hola María, qué pena leer esto. Soy Sofía del equipo de Tumantenimiento y voy a llevar tu caso personalmente. Ya estoy contactando a Ramón para escuchar su versión y revisar las fotos. Te pido 30 minutos para responderte con un plan claro." },
    { from: "internal", actor: "Sofía Martínez", time: "14:46", text: "Llamé a Ramón. Dice que la cliente lo corrió cuando le pidió un extra de $400 por sellado de tubería que no estaba cotizado, pero las fotos de la cliente muestran trabajo claramente incompleto. Solicité a Ramón sus fotos del before/during. Caso de disputa real, prep para reembolso parcial 60% + reasignación." },
    { from: "user", actor: "María Rodríguez", initials: "MR", time: "15:02", text: "Sofía, gracias por responder rápido. ¿Va a venir otro técnico? Tengo invitados mañana y la fuga sigue." },
    { from: "admin", actor: "Sofía Martínez", time: "15:14", text: "María, ya tengo a Adriana García (★4.8, también de Zapopan) lista para visitarte hoy entre 16:30 y 17:30 sin costo adicional. ¿Te funciona? Y sobre el cobro, estoy autorizada para emitir un reembolso del 60% del servicio original ($1,134 MXN) que regresa a tu tarjeta hoy mismo." },
  ],
  templates: [
    "Disputa — Reembolso parcial 60%",
    "Disputa — Reembolso total",
    "Disputa — Reasignar técnico",
    "Soporte — Pago fallido",
    "Reembolso — Confirmación OXXO",
  ],
  history: [
    { id: "TKT-3201", type: "soporte",   subject: "Cambio de dirección principal",       status: "closed", time: "12/04/2026" },
    { id: "TKT-3022", type: "reembolso", subject: "Cancelación de servicio plomería",     status: "closed", time: "27/03/2026" },
    { id: "TKT-2914", type: "soporte",   subject: "No recibí confirmación por email",     status: "closed", time: "08/03/2026" },
  ],
  evidence: 6, // photos
};

Object.assign(window, { SUP_TABS, TYPE_BADGE, TICKETS, ACTIVE });
