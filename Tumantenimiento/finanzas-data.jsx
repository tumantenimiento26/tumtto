/* global React */
/* Finanzas — mock data */

const FIN_TABS = [
  { id: "summary",  label: "Resumen" },
  { id: "concil",   label: "Conciliación Mercado Pago", count: 3, tone: "err" },
  { id: "payouts",  label: "Retiros a técnicos",        count: 47, tone: "warn" },
  { id: "commiss",  label: "Comisiones cobradas" },
  { id: "reports",  label: "Reportes contables" },
];

const KPIS = [
  { label: "GMV del mes",           value: "$2,847,320", suffix: "MXN", delta: "+18%", note: "vs mes anterior", tone: "ok" },
  { label: "Comisión acumulada",    value: "$427,098",   suffix: "MXN", delta: "+15%", note: "vs mes anterior", tone: "ok" },
  { label: "Por pagar a técnicos",  value: "$1,847,520", suffix: "MXN", delta: "$1.5M+", note: "supera límite operativo", tone: "warn" },
  { label: "Pagos fallidos hoy",    value: "3",          suffix: "$4,500 MXN", delta: "ver detalle", note: "última falla 12:14", tone: "err" },
];

const MONTH_GMV = [
  // 30 days, values in K MXN
  72, 84, 91, 78, 88, 96, 102, 95, 88, 105, 112, 124, 118, 109, 116,
  128, 134, 142, 138, 130, 126, 145, 152, 158, 162, 148, 142, 168, 178, 184,
];
const METHOD_SPLIT = [
  { method: "Tarjeta",    pct: 49.9, amount: "1,420,000", color: "#0A6BCF", icon: "credit-card" },
  { method: "OXXO Pay",   pct: 16.9, amount: "480,000",   color: "#B45309", icon: "store" },
  { method: "MP wallet",  pct: 21.8, amount: "620,000",   color: "#18C1FF", icon: "wallet" },
  { method: "Efectivo",   pct: 11.5, amount: "327,320",   color: "#18A66A", icon: "banknote" },
];

const TOP_TECHS = [
  { name: "Ramón Hernández García",   region: "Zapopan",     jobs: 47, gross: "$58,420", commission: "$8,763", initials: "RH" },
  { name: "Adriana García Soto",      region: "Tlaquepaque", jobs: 38, gross: "$42,180", commission: "$6,327", initials: "AG" },
  { name: "Sergio Camarena Ruvalcaba",region: "Zapopan",     jobs: 18, gross: "$38,940", commission: "$5,841", initials: "SC" },
  { name: "Daniela Ortega Camacho",   region: "Tlajomulco",  jobs: 32, gross: "$31,210", commission: "$4,682", initials: "DO" },
  { name: "Ricardo Mendoza Aguilar",  region: "Zapopan",     jobs: 28, gross: "$29,450", commission: "$4,418", initials: "RM" },
];

const MP_KPIS = [
  { label: "Conciliados",   value: "1,247 / 1,250", tone: "ok"  },
  { label: "Discrepancias", value: "3",             tone: "err" },
  { label: "Monto total MP",value: "$2,847,320 MXN" },
];

const MP_ROWS = [
  { internal: "SVC-2847", mp: "MP-78410293",  client: "María Rodríguez",    method: "card",  amount: "1,250.00", fee: "37.50",  status: "ok",   date: "19/05 14:22" },
  { internal: "SVC-2846", mp: "MP-78409887",  client: "José Carlos Juárez", method: "card",  amount: "820.00",   fee: "24.60",  status: "ok",   date: "19/05 14:08" },
  { internal: "SVC-2845", mp: "MP-78409512",  client: "Lupita Pérez S.",    method: "oxxo",  amount: "640.00",   fee: "19.20",  status: "ok",   date: "19/05 13:55" },
  { internal: "SVC-2839", mp: "MP-78408201",  client: "Miguel Salazar Q.",  method: "card",  amount: "1,080.00", fee: "32.40",  status: "warn", date: "18/05 17:14", note: "Monto MP: $1,082.00 · diferencia +$2" },
  { internal: "SVC-2838", mp: "MP-78407932",  client: "Ana Sofía Treviño",  method: "mp",    amount: "1,420.00", fee: "21.30",  status: "ok",   date: "18/05 15:42" },
  { internal: "SVC-2799", mp: "—",            client: "Roberto V.",         method: "oxxo",  amount: "890.00",   fee: "—",      status: "err",  date: "17/05 11:08", note: "Pago OXXO no procesado · referencia caducada" },
  { internal: "SVC-2799b",mp: "MP-78404801",  client: "Roberto V.",         method: "card",  amount: "890.00",   fee: "26.70",  status: "ok",   date: "17/05 12:30", note: "Reintento con tarjeta" },
  { internal: "SVC-2834", mp: "MP-78403210",  client: "Roberto V.",         method: "card",  amount: "2,100.00", fee: "63.00",  status: "warn", date: "17/05 11:18", note: "Comisión MP esperada: $63.00 · cobrada: $66.50" },
  { internal: "SVC-2833", mp: "MP-78402144",  client: "José Carlos J.",     method: "card",  amount: "520.00",   fee: "15.60",  status: "ok",   date: "17/05 10:42" },
  { internal: "SVC-2841", mp: "MP-78406708",  client: "Roberto V.",         method: "card",  amount: "3,150.00", fee: "94.50",  status: "ok",   date: "19/05 12:38" },
];

const MP_STATUS = {
  ok:   { label: "Conciliado",   icon: "check-circle-2",  bg: "#E5F7EE", fg: "#18A66A" },
  warn: { label: "Discrepancia", icon: "alert-triangle",  bg: "#FEF3DC", fg: "#B45309" },
  err:  { label: "Falla",        icon: "x-circle",        bg: "#FCE9E9", fg: "#DC2626" },
};

const BANK_LOGOS = {
  BBVA:      { color: "#062D60", short: "BBV" },
  Banamex:   { color: "#E30613", short: "BNX" },
  Santander: { color: "#EC0000", short: "SAN" },
  Banorte:   { color: "#EB1700", short: "BNT" },
  HSBC:      { color: "#DB0011", short: "HSB" },
  Azteca:    { color: "#00873E", short: "AZT" },
};

const PAYOUT_ROWS = [
  { name: "Ramón Hernández García",   initials: "RH", clabe: "012 320 •••• •••• 1234", bank: "BBVA",      amount: "12,420.00", balance: "12,420.00", req: "Hoy · 11:42", kyc: "ok", selected: true },
  { name: "Adriana García Soto",      initials: "AG", clabe: "002 580 •••• •••• 7821", bank: "Banamex",   amount: "8,560.00",  balance: "8,560.00",  req: "Hoy · 09:18", kyc: "ok", selected: true },
  { name: "Sergio Camarena Ruvalcaba",initials: "SC", clabe: "014 320 •••• •••• 4502", bank: "Santander", amount: "6,840.00",  balance: "6,840.00",  req: "Ayer · 18:24", kyc: "ok", selected: true },
  { name: "Daniela Ortega Camacho",   initials: "DO", clabe: "072 320 •••• •••• 8841", bank: "Banorte",   amount: "5,210.00",  balance: "5,210.00",  req: "Ayer · 16:08", kyc: "ok" },
  { name: "Ricardo Mendoza Aguilar",  initials: "RM", clabe: "012 320 •••• •••• 9012", bank: "BBVA",      amount: "4,890.00",  balance: "4,890.00",  req: "Ayer · 14:50", kyc: "ok" },
  { name: "Fernanda Olivares Ramírez",initials: "FO", clabe: "036 320 •••• •••• 2208", bank: "HSBC",      amount: "3,240.00",  balance: "3,240.00",  req: "Ayer · 12:32", kyc: "warn" },
  { name: "Luis Esteban Gómez S.",    initials: "LG", clabe: "127 320 •••• •••• 5567", bank: "Azteca",    amount: "2,150.00",  balance: "2,150.00",  req: "18/05 · 09:14", kyc: "ok" },
  { name: "Miguel Salazar Quintero",  initials: "MS", clabe: "012 320 •••• •••• 8201", bank: "BBVA",      amount: "1,820.00",  balance: "1,820.00",  req: "18/05 · 08:42", kyc: "ok" },
];

Object.assign(window, { FIN_TABS, KPIS, MONTH_GMV, METHOD_SPLIT, TOP_TECHS, MP_KPIS, MP_ROWS, MP_STATUS, BANK_LOGOS, PAYOUT_ROWS });
