/* global React */
/* Reportes — mock data */

const REPORT_TABS = [
  { id: "overview",  label: "Overview" },
  { id: "acquire",   label: "Adquisición y retención" },
  { id: "techs",     label: "Desempeño de técnicos" },
  { id: "cats",      label: "Desempeño de categorías" },
  { id: "geo",       label: "Análisis geográfico" },
];

const NORTH_STAR = [
  { label: "Clientes registrados",          value: "4,832",     goal: "5,000",     pct: 96.6, suffix: null,  tone: "ok",  icon: "users" },
  { label: "Técnicos activos",              value: "142",       goal: "150",       pct: 94.7, suffix: null,  tone: "ok",  icon: "hard-hat" },
  { label: "Servicios completados · 6 m",   value: "1,387",     goal: "1,500",     pct: 92.5, suffix: null,  tone: "warn",icon: "check-check" },
  { label: "Rating promedio",               value: "4.42",      goal: "≥ 4.30",    pct: 100,  suffix: "★",   tone: "ok",  icon: "star",  binary: true },
  { label: "Tasa de cancelación",           value: "9.8%",      goal: "≤ 12%",     pct: 100,  suffix: null,  tone: "ok",  icon: "x-circle", binary: true, lowerIsBetter: true },
  { label: "GMV mensual",                   value: "$498,420",  goal: "$500,000",  pct: 99.7, suffix: "MXN", tone: "ok",  icon: "wallet" },
];

// GMV last 6 months (in K MXN)
const GMV_MONTHLY = [
  { m: "Dic 25", v: 312 },
  { m: "Ene 26", v: 358 },
  { m: "Feb 26", v: 392 },
  { m: "Mar 26", v: 421 },
  { m: "Abr 26", v: 462 },
  { m: "May 26", v: 498 },
];

// Servicios completados / cancelados last 6 months
const SVC_MONTHLY = [
  { m: "Dic 25", done: 188, cancel: 24 },
  { m: "Ene 26", done: 214, cancel: 28 },
  { m: "Feb 26", done: 232, cancel: 25 },
  { m: "Mar 26", done: 248, cancel: 31 },
  { m: "Abr 26", done: 268, cancel: 28 },
  { m: "May 26", done: 237, cancel: 24 },
];

const FUNNEL = [
  { label: "Visitantes únicos",         value: 28420, drop: null },
  { label: "Registros completos",       value: 4832,  drop: 17.0 },
  { label: "Primera solicitud",         value: 3128,  drop: 64.7 },
  { label: "Servicio completado",       value: 2847,  drop: 91.0 },
  { label: "Cliente recurrente · 90 d", value: 1412,  drop: 49.6 },
];

// Top 20 técnicos (showing 12 for layout)
const TOP_TECHS_FULL = [
  { name: "Ricardo Mendoza Aguilar",   region: "Zapopan",     cat: "Plomería",      jobs: 214, rating: 4.94, gmv: "$58,420", commission: "$8,763", accept: 98, cancel: 1.8, initials: "RM" },
  { name: "Adriana García Soto",       region: "Tlaquepaque", cat: "Electricidad",  jobs: 187, rating: 4.91, gmv: "$48,290", commission: "$7,243", accept: 96, cancel: 2.4, initials: "AG" },
  { name: "Ramón Hernández García",    region: "Zapopan",     cat: "Plomería",      jobs: 184, rating: 4.89, gmv: "$45,180", commission: "$6,777", accept: 95, cancel: 3.1, initials: "RH" },
  { name: "Sergio Camarena Ruvalcaba", region: "Zapopan",     cat: "Impermeab.",    jobs: 92,  rating: 4.87, gmv: "$38,940", commission: "$5,841", accept: 93, cancel: 2.6, initials: "SC" },
  { name: "Miguel Salazar Quintero",   region: "Tlaquepaque", cat: "Gas",           jobs: 138, rating: 4.85, gmv: "$36,840", commission: "$5,526", accept: 97, cancel: 1.9, initials: "MS" },
  { name: "Daniela Ortega Camacho",    region: "Tlajomulco",  cat: "Drenaje",       jobs: 124, rating: 4.82, gmv: "$32,180", commission: "$4,827", accept: 94, cancel: 3.4, initials: "DO" },
  { name: "Fernanda Olivares Ramírez", region: "Tonalá",      cat: "Plomería",      jobs: 98,  rating: 4.81, gmv: "$28,420", commission: "$4,263", accept: 91, cancel: 4.2, initials: "FO" },
  { name: "Carlos Iván Velázquez R.",  region: "El Salto",    cat: "Cristales",     jobs: 78,  rating: 4.78, gmv: "$22,360", commission: "$3,354", accept: 92, cancel: 3.8, initials: "CV" },
  { name: "José Carlos Juárez M.",     region: "Guadalajara", cat: "Electricidad",  jobs: 86,  rating: 4.76, gmv: "$24,150", commission: "$3,623", accept: 89, cancel: 4.1, initials: "JC" },
  { name: "Lupita Pérez Vázquez",      region: "Zapopan",     cat: "Pintura",       jobs: 72,  rating: 4.72, gmv: "$26,840", commission: "$4,026", accept: 88, cancel: 4.7, initials: "LP" },
];

const AT_RISK = [
  { name: "Luis Esteban Gómez Salinas", region: "Guadalajara", rating: 3.42, accept: 64, cancel: 18.4, reasons: ["Rating bajo", "Cancela 18% de sus aceptaciones"], initials: "LG" },
  { name: "Roberto Villanueva Aceves",  region: "Zapopan",     rating: 3.68, accept: 71, cancel: 12.8, reasons: ["Rating bajo", "Quejas reiteradas en cristales"], initials: "RV" },
  { name: "Pablo Esquivel Tapia",       region: "Tonalá",      rating: 3.78, accept: 58, cancel: 16.2, reasons: ["Aceptación baja", "3 disputas en 30 d"], initials: "PE" },
];

const RATING_DIST = [
  { stars: 5, n: 1247, pct: 62 },
  { stars: 4, n: 538,  pct: 27 },
  { stars: 3, n: 142,  pct: 7 },
  { stars: 2, n: 56,   pct: 3 },
  { stars: 1, n: 22,   pct: 1 },
];

// Geo data — ZMG colonias with demand heat
const TOP_COLONIAS = [
  { name: "Providencia",        city: "Guadalajara", demand: 168, gmv: "$268,420", techs: 31, coverage: 100 },
  { name: "Andares",            city: "Zapopan",     demand: 142, gmv: "$214,180", techs: 28, coverage: 100 },
  { name: "Country Club",       city: "Guadalajara", demand: 124, gmv: "$198,640", techs: 22, coverage: 100 },
  { name: "Valle Real",         city: "Zapopan",     demand: 118, gmv: "$182,920", techs: 22, coverage: 100 },
  { name: "Chapalita",          city: "Guadalajara", demand: 109, gmv: "$162,480", techs: 18, coverage: 100 },
  { name: "Vallarta Universidad",city:"Zapopan",     demand: 102, gmv: "$148,720", techs: 19, coverage: 100 },
  { name: "Las Águilas",        city: "Zapopan",     demand: 96,  gmv: "$132,540", techs: 14, coverage: 96 },
  { name: "Lomas del Valle",    city: "Guadalajara", demand: 84,  gmv: "$121,820", techs: 12, coverage: 92 },
  { name: "Lafayette",          city: "Guadalajara", demand: 78,  gmv: "$108,260", techs: 11, coverage: 100 },
  { name: "Plaza del Sol",      city: "Zapopan",     demand: 72,  gmv: "$98,420",  techs: 16, coverage: 100 },
];

const COLD_ZONES = [
  { name: "Cabecera Tlajomulco",  city: "Tlajomulco",  demand: 64, techs: 3, ratio: "21:1", note: "Alta demanda, sólo 3 técnicos activos" },
  { name: "El Salto Centro",      city: "El Salto",    demand: 38, techs: 2, ratio: "19:1", note: "Tiempos de respuesta > 4 h" },
  { name: "Tonalá · Cerro del 4", city: "Tonalá",      demand: 42, techs: 4, ratio: "11:1", note: "Sin cobertura los fines de semana" },
];

Object.assign(window, { REPORT_TABS, NORTH_STAR, GMV_MONTHLY, SVC_MONTHLY, FUNNEL, TOP_TECHS_FULL, AT_RISK, RATING_DIST, TOP_COLONIAS, COLD_ZONES });
