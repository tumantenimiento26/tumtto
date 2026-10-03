// ponytail: historial sintético SOLO para el modo maqueta (lib/mock.ts) — ~90 días
// de servicios, pagos, eventos y calificaciones para que la analítica tenga forma.
// Determinista (semilla fija) para que cada recarga muestre lo mismo.
import type { Database } from '@/types/supabase';
import { TECH_USER_ID, type World, type OrderStatus } from './world';

type Row<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** EWKB hex de un Point SRID 4326 (lo que PostgREST devuelve para geography). */
function ewkb(lng: number, lat: number): string {
  const v = new DataView(new ArrayBuffer(16));
  v.setFloat64(0, lng, true);
  v.setFloat64(8, lat, true);
  const hex = [...new Uint8Array(v.buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  return '0101000020e6100000' + hex;
}

// Zonas de cobertura (hexágonos aproximados por municipio) — [nombre, lng, lat, radio°, activa].
const ZONES: [string, number, number, number, boolean][] = [
  ['Guadalajara', -103.345, 20.672, 0.045, true],
  ['Zapopan', -103.42, 20.715, 0.05, true],
  ['Tlaquepaque', -103.305, 20.615, 0.035, true],
  ['Tonalá', -103.235, 20.625, 0.035, true],
  ['Tlajomulco', -103.44, 20.54, 0.05, true],
  ['El Salto', -103.19, 20.52, 0.03, false],
];
const hexagon = (lng: number, lat: number, r: number) => {
  const ring = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return [lng + r * Math.cos(a) * 1.07, lat + r * Math.sin(a)];
  });
  return { type: 'Polygon' as const, coordinates: [[...ring, ring[0]]] };
};

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLIENTS = [
  'Ana Sofía Ruiz', 'Jorge Martínez', 'Paola Hernández', 'Ricardo Vega', 'Laura Méndez',
  'Fernando Castillo', 'Gabriela Torres', 'Héctor Navarro', 'Valeria Ochoa', 'Arturo Medina',
  'Mónica Aguilar', 'Daniel Flores', 'Karla Jiménez', 'Eduardo Ramos', 'Patricia Luna',
  'Alejandro Cruz', 'Diana Morales', 'Raúl Estrada', 'Claudia Ibarra', 'Óscar Delgado',
  'Mariana Sandoval', 'Javier Cervantes', 'Lucía Becerra', 'Enrique Padilla', 'Sandra Orozco',
  'Iván Gutiérrez', 'Rocío Salazar', 'Manuel Arellano', 'Teresa Contreras', 'Pablo Zúñiga',
];

const PLACES: [string, string, string, number, number][] = [
  ['Providencia', 'Zapopan', '44630', -103.3773, 20.7062],
  ['Chapalita', 'Zapopan', '45040', -103.3995, 20.6684],
  ['Americana', 'Guadalajara', '44160', -103.3681, 20.6736],
  ['Country Club', 'Guadalajara', '44610', -103.3695, 20.7096],
  ['Centro', 'Tlaquepaque', '45500', -103.3122, 20.6409],
  ['Santa Anita', 'Tlajomulco', '45645', -103.4433, 20.5544],
  ['Jardines del Bosque', 'Guadalajara', '44520', -103.3889, 20.6631],
  ['Valle Real', 'Zapopan', '45136', -103.4319, 20.7421],
  ['Oblatos', 'Guadalajara', '44700', -103.3125, 20.6929],
  ['Las Águilas', 'Zapopan', '45080', -103.4141, 20.6464],
];

// [categoría, peso, técnicos, [mín, máx] en centavos, títulos]
const CATS: [string, number, string[], [number, number], string[]][] = [
  ['cat-plumbing', 30, [TECH_USER_ID, 'u-do'], [35000, 250000], ['Fuga en el baño', 'Calentador no enciende', 'Drenaje tapado', 'Cambio de WC']],
  ['cat-electrical', 22, ['u-ag', 'u-jose'], [25000, 350000], ['Contacto sin corriente', 'Instalar lámparas', 'Tablero se bota', 'Corto circuito']],
  ['cat-gas', 12, [TECH_USER_ID, 'u-sc'], [30000, 200000], ['Cambio de regulador', 'Olor a gas', 'Revisión de instalación']],
  ['cat-ac', 14, ['u-ag', 'u-lupita'], [60000, 450000], ['Minisplit no enfría', 'Instalación de minisplit', 'Mantenimiento AA']],
  ['cat-appliances', 14, ['u-lupita'], [45000, 280000], ['Lavadora no centrifuga', 'Refrigerador no enfría', 'Estufa no prende']],
  ['cat-locks', 8, ['u-jose', 'u-sc'], [25000, 150000], ['Apertura de puerta', 'Cambio de chapa', 'Duplicado y chapa nueva']],
];
const ACTIVE: OrderStatus[] = ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'closing'];
const FLOW: OrderStatus[] = ['requested', 'accepted', 'enroute', 'onsite', 'quote', 'working', 'closing', 'completed', 'paid', 'closed'];

export function withHistory(w: World): {
  world: World;
  ratings: Row<'order_ratings'>[];
  payouts: Row<'payout_requests'>[];
  zones: (Omit<Database['public']['Functions']['admin_list_coverage_zones']['Returns'][number], 'geojson'> & {
    geojson: { type: 'Polygon'; coordinates: number[][][] };
  })[];
  locations: Row<'technician_locations'>[];
  clientDocuments: Row<'client_documents'>[];
  companies: Row<'technician_companies'>[];
  vehicles: Row<'technician_vehicles'>[];
  toolCatalog: Row<'tool_catalog'>[];
  techTools: Row<'technician_tools'>[];
  dispatchLog: Row<'emergency_dispatch_log'>[];
} {
  const r = rng(2026);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const between = (a: number, b: number) => a + Math.floor(r() * (b - a));
  const iso = (ms: number) => new Date(ms).toISOString();
  const MIN = 60_000;
  const DAY = 24 * 60 * MIN;
  const now = Date.now();

  const profiles = [...w.profiles];
  // Actor de las asignaciones/rechazos hechos desde la maqueta (store.assignOrder).
  profiles.push({ ...w.profiles[0], id: 'mock-admin', full_name: 'Admin Tumtto', role: 'admin' });
  const clientIds = CLIENTS.map((name, i) => {
    const id = `mock-cli-${i + 1}`;
    profiles.push({
      ...w.profiles[0],
      id,
      full_name: name,
      phone: `+52 33 ${String(1000 + i * 37).padStart(4, '0')} ${String(2000 + i * 53).slice(-4)}`,
      created_at: iso(now - between(30, 200) * DAY),
    });
    return id;
  });

  // Más especialidades para que todas las categorías tengan técnicos.
  const technicianCategories = [...w.technicianCategories];
  for (const [cat, , techs] of CATS)
    for (const t of techs)
      if (!technicianCategories.some(x => x.technician_id === t && x.category_id === cat))
        technicianCategories.push({ ...w.technicianCategories[0], technician_id: t, category_id: cat });
  // Base de cada técnico aprobado: zona + ubicación (technician_locations).
  const BASES: Record<string, string> = {
    [TECH_USER_ID]: 'Zapopan',
    'u-ag': 'Guadalajara',
    'u-sc': 'Tlaquepaque',
    'u-do': 'Zapopan',
    'u-jose': 'Guadalajara',
    'u-lupita': 'Tonalá',
  };
  // Tipo de técnico: 2 Tumtto, 2 Tercero (2 empresas), el resto Independiente.
  const TYPES: Record<string, [string, string | null]> = {
    [TECH_USER_ID]: ['tumtto', null],
    'u-sc': ['tumtto', null],
    'u-jose': ['third_party', 'mock-co-1'],
    'u-lupita': ['third_party', 'mock-co-2'],
  };
  const zoneId = (name: string) => `zone-${name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}`;
  const technicians = w.technicians.map(t => ({
    ...t,
    is_available: ['u-ag', 'u-sc', 'u-jose', 'u-lupita', TECH_USER_ID].includes(t.id) ? true : t.is_available,
    zone_id: BASES[t.id] ? zoneId(BASES[t.id]) : t.zone_id,
    service_radius_m: BASES[t.id] ? 8000 : t.service_radius_m,
    technician_type: (TYPES[t.id]?.[0] ?? 'independent') as Row<'technicians'>['technician_type'],
    company_id: TYPES[t.id]?.[1] ?? null,
  }));
  const companies: Row<'technician_companies'>[] = [
    ['mock-co-1', 'Servicios Integrales GDL', 'SIG1801011A1', 'Marcela Ruiz', true],
    ['mock-co-2', 'Mantenimiento Occidente', 'MOC1505123B7', 'Jorge Lara', true],
    ['mock-co-3', 'Hogar Express (inactiva)', null, null, false],
  ].map(([id, name, rfc, contact, active], i) => ({
    id: id as string,
    name: name as string,
    rfc: rfc as string | null,
    contact_name: contact as string | null,
    contact_phone: contact ? `+52 33 4000 ${1000 + i * 111}` : null,
    contact_email: contact ? `contacto${i + 1}@ejemplo.mx` : null,
    is_active: active as boolean,
    created_at: iso(now - 120 * DAY),
    updated_at: iso(now - 120 * DAY),
  }));
  // Vehículos mock: u-ag con dos (el principal primero), el resto uno; los pendientes de KYC sin vehículo.
  const VEHICLES: [string, string, string, number, string, string, boolean][] = [
    [TECH_USER_ID, 'Nissan', 'NP300', 2019, 'Blanco', 'JKL123A', true],
    ['u-ag', 'Ford', 'Transit', 2021, 'Gris', 'MNP4521', true],
    ['u-ag', 'Chevrolet', 'Aveo', 2016, 'Rojo', 'TRX902', false],
    ['u-sc', 'Toyota', 'Hilux', 2020, 'Plata', 'HGB7740', true],
    ['u-do', 'Volkswagen', 'Saveiro', 2017, 'Azul', 'LCD3318', true],
    ['u-jose', 'Nissan', 'Tsuru', 2014, 'Blanco', 'JHR556A', true],
    ['u-lupita', 'Kia', 'Rio', 2022, 'Negro', 'PTY8821', true],
    ['u-luis', 'Chevrolet', 'Tornado', 2018, 'Blanco', 'KMD1190', true],
  ];
  const vehicles: Row<'technician_vehicles'>[] = VEHICLES.map(([tid, make, model, year, color, plate, primary], i) => ({
    id: `mock-veh-${i + 1}`,
    technician_id: tid,
    make,
    model,
    year,
    color,
    plate,
    is_primary: primary,
    created_at: iso(now - (100 - i * 3) * DAY),
    updated_at: iso(now - (100 - i * 3) * DAY),
  }));
  // Catálogo de herramienta (semilla del backend) y lo que tiene cada técnico mock.
  const TOOL_SEED: [string | null, string[]][] = [
    ['cat-plumbing', ['Llave Stillson', 'Destapador / guía de drenaje', 'Soplete', 'Cortatubos', 'Cinta teflón']],
    ['cat-electrical', ['Multímetro', 'Pinza amperimétrica', 'Probador de voltaje', 'Pela cables', 'Escalera de tijera']],
    ['cat-gas', ['Detector de fugas de gas', 'Manómetro de gas', 'Juego de llaves para gas']],
    ['cat-ac', ['Bomba de vacío', 'Manómetros de refrigerante', 'Recuperadora de gas']],
    ['cat-appliances', ['Juego de destornilladores de precisión', 'Multímetro para electrodomésticos']],
    ['cat-locks', ['Juego de ganzúas', 'Extractor de llaves rotas']],
    [null, ['Taladro', 'Escalera', 'Caja de herramientas', 'Nivel', 'Flexómetro']],
  ];
  const toolCatalog: Row<'tool_catalog'>[] = [];
  for (const [cat, names] of TOOL_SEED)
    for (const name of names)
      toolCatalog.push({
        id: `mock-tool-${toolCatalog.length + 1}`,
        name,
        category_id: cat,
        is_active: true,
        sort_order: (toolCatalog.length + 1) * 10,
        created_at: iso(now - 150 * DAY),
        updated_at: iso(now - 150 * DAY),
      });
  // Un ítem desactivado para mostrar el estado «Inactiva».
  toolCatalog.push({
    id: `mock-tool-${toolCatalog.length + 1}`,
    name: 'Soplete de butano (retirado)',
    category_id: 'cat-plumbing',
    is_active: false,
    sort_order: 900,
    created_at: iso(now - 150 * DAY),
    updated_at: iso(now - 20 * DAY),
  });
  const toolId = (name: string) => toolCatalog.find(t => t.name === name)!.id;
  // [técnico, ítems del catálogo, texto libre [nombre, categoría sugerida|null][]]
  const TECH_TOOLS: [string, string[], [string, string | null][]][] = [
    [TECH_USER_ID, ['Llave Stillson', 'Destapador / guía de drenaje', 'Soplete', 'Cortatubos', 'Detector de fugas de gas', 'Manómetro de gas', 'Taladro', 'Flexómetro'], [['Lámpara frontal', null]]],
    ['u-ag', ['Multímetro', 'Pinza amperimétrica', 'Probador de voltaje', 'Bomba de vacío', 'Manómetros de refrigerante', 'Escalera'], [['Pistola de calor', 'cat-ac'], ['Lámpara frontal', null]]],
    ['u-sc', ['Detector de fugas de gas', 'Juego de llaves para gas', 'Juego de ganzúas', 'Taladro', 'Nivel'], [['Hidrolavadora portátil', 'cat-plumbing']]],
    ['u-do', ['Llave Stillson', 'Cortatubos', 'Cinta teflón', 'Taladro'], [['Hidrolavadora portátil', null], ['Escáner de tuberías', 'cat-plumbing'], ['Lámpara frontal', null]]],
    ['u-jose', ['Multímetro', 'Pela cables', 'Probador de voltaje', 'Juego de ganzúas', 'Extractor de llaves rotas', 'Caja de herramientas'], [['lámpara  frontal', null]]],
    ['u-lupita', ['Bomba de vacío', 'Recuperadora de gas', 'Juego de destornilladores de precisión', 'Multímetro para electrodomésticos'], [['Pistola de calor', null]]],
  ];
  const techTools: Row<'technician_tools'>[] = [];
  TECH_TOOLS.forEach(([tid, items, customs], ti) => {
    const at = iso(now - (90 - ti * 7) * DAY);
    const base = { technician_id: tid, created_at: at, updated_at: at };
    for (const n of items)
      techTools.push({ id: `mock-tt-${techTools.length + 1}`, ...base, catalog_id: toolId(n), custom_name: null, custom_category_id: null });
    for (const [n, c] of customs)
      techTools.push({ id: `mock-tt-${techTools.length + 1}`, ...base, catalog_id: null, custom_name: n, custom_category_id: c });
  });
  const zones = ZONES.map(([name, lng, lat, r, active]) => ({
    id: zoneId(name),
    name,
    slug: zoneId(name).slice(5),
    is_active: active,
    technician_count: Object.values(BASES).filter(b => b === name).length,
    geojson: hexagon(lng, lat, r),
  }));
  const locations: Row<'technician_locations'>[] = Object.entries(BASES).map(([tid, muni], i) => {
    const [, lng, lat] = ZONES.find(z => z[0] === muni)!;
    const x = lng + (i % 3 - 1) * 0.012;
    const y = lat + ((i >> 1) % 3 - 1) * 0.01;
    const at = iso(now - between(5, 90) * MIN);
    return {
      id: `mloc-${tid}`,
      technician_id: tid,
      location: ewkb(x, y),
      address_line: null,
      neighborhood: null,
      municipality: muni,
      place_name: `${muni}, Jalisco`,
      postal_code: null,
      state: 'Jalisco',
      mapbox_feature_id: null,
      raw_mapbox_feature: null,
      recorded_at: at,
      created_at: at,
      updated_at: at,
    };
  });

  // Las órdenes base del demo traen GeoJSON; el mapa lee EWKB como el backend.
  const orders = w.orders.map(o => {
    const c = (o.location as { coordinates?: number[] } | null)?.coordinates;
    return c ? { ...o, location: ewkb(c[0], c[1]) } : o;
  });
  const events = [...w.events];
  const payments = [...w.payments];
  const ledger = [...w.ledger];
  const ratings: Row<'order_ratings'>[] = [];
  const totalW = CATS.reduce((s, c) => s + c[1], 0);
  let folio = 3000;

  for (let d = 89; d >= 0; d--) {
    const day = new Date(now - d * DAY);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    // Crecimiento suave: ~3/día hace 3 meses → ~9/día hoy; fines de semana +30 %.
    const n = Math.round((3 + (89 - d) / 15 + r() * 3) * (weekend ? 1.3 : 1));
    for (let k = 0; k < n; k++) {
      let x = r() * totalW;
      const cat = CATS.find(c => (x -= c[1]) < 0) ?? CATS[0];
      const [catId, , techs, [lo, hi], titles] = cat;
      const tech = pick(techs);
      const [neighborhood, municipality, postal_code, lng, lat] = pick(PLACES);
      const start = new Date(day);
      start.setHours(between(8, 20), between(0, 60), 0, 0);
      let t0 = start.getTime();
      if (t0 > now) t0 = now - between(5, 240) * MIN;

      const roll = r();
      let status: OrderStatus;
      if (d === 0 && roll < 0.45) status = pick(ACTIVE);
      else if (roll < 0.11) status = 'cancelled';
      else if (roll < 0.15) status = 'expired';
      else if (d <= 2 && roll < 0.2) status = pick(['completed', 'paid'] as OrderStatus[]);
      else status = 'closed';

      const id = `SVC-${++folio}`;
      const total = Math.round(between(lo, hi) / 1000) * 1000;
      const commission = Math.round(total * 0.15);
      // Cancelaciones en distintas etapas (para que el embudo se angoste de verdad):
      // antes de aceptar, ya aceptada, en camino o al rechazar la cotización.
      const cr = r();
      const reached =
        status === 'expired'
          ? 1
          : status === 'cancelled'
            ? cr < 0.35 ? 1 : cr < 0.6 ? 2 : cr < 0.75 ? 3 : 5
            : FLOW.indexOf(status) + 1;
      const ts: number[] = [t0];
      for (let i = 1; i < reached; i++)
        ts.push(Math.min(now - (reached - i) * MIN, ts[i - 1] + (i === 1 ? between(3, 25) : i === 2 ? between(12, 40) : between(10, 70)) * MIN));
      const at = (s: OrderStatus) => (FLOW.indexOf(s) < reached && FLOW.indexOf(s) >= 0 ? iso(ts[FLOW.indexOf(s)]) : null);
      const hasTech = reached > 1;
      const priced = FLOW.indexOf(status) >= FLOW.indexOf('quote');

      orders.push({
        ...w.orders[0],
        id,
        folio,
        client_id: pick(clientIds),
        technician_id: hasTech ? tech : null,
        category_id: catId,
        client_address_id: null,
        status,
        title: pick(titles),
        description: null,
        is_urgent: false,
        location: ewkb(lng + (r() - 0.5) * 0.03, lat + (r() - 0.5) * 0.03),
        address_line: `Calle ${between(1, 99)} #${between(100, 3000)}`,
        neighborhood,
        municipality,
        postal_code,
        quoted_subtotal_cents: priced ? total : null,
        quoted_total_cents: priced ? total : null,
        commission_cents: priced ? commission : null,
        is_disputed: false,
        accepted_at: at('accepted'),
        completed_at: at('completed'),
        paid_at: at('paid'),
        cancelled_at: status === 'cancelled' ? iso(ts[ts.length - 1] + between(5, 40) * MIN) : null,
        cancellation_reason:
          status === 'cancelled'
            ? reached >= 5
              ? 'Cotización rechazada'
              : pick(['Ya lo resolví', 'El técnico tardó', 'Cambié de fecha'])
            : null,
        expires_at: status === 'expired' ? iso(t0 + 30 * MIN) : null,
        created_at: iso(t0),
        updated_at: iso(ts[ts.length - 1]),
      });

      for (let i = 0; i < reached; i++)
        events.push({
          ...w.events[0],
          id: `mev-${id}-${i}`,
          service_order_id: id,
          from_status: i ? FLOW[i - 1] : null,
          to_status: FLOW[i],
          actor_id: i === 0 ? clientIds[0] : tech,
          created_at: iso(ts[i]),
          updated_at: iso(ts[i]),
        });
      // «Regresar estado»: el técnico se adelantó a «En sitio» y volvió a «En camino».
      if (reached >= 5 && (folio % 9 === 0 || id === 'SVC-3010')) {
        const revAt = Math.min(ts[3] + 2 * MIN, ts[4] - 2 * MIN);
        events.push(
          {
            ...w.events[0],
            id: `mev-${id}-rev`,
            service_order_id: id,
            from_status: 'onsite',
            to_status: 'enroute',
            actor_id: tech,
            note: 'Marqué «En sitio» por error',
            is_revert: true,
            created_at: iso(revAt),
            updated_at: iso(revAt),
          },
          {
            ...w.events[0],
            id: `mev-${id}-rev2`,
            service_order_id: id,
            from_status: 'enroute',
            to_status: 'onsite',
            actor_id: tech,
            created_at: iso(revAt + MIN),
            updated_at: iso(revAt + MIN),
          },
        );
      }
      if (status === 'cancelled' || status === 'expired')
        events.push({
          ...w.events[0],
          id: `mev-${id}-x`,
          service_order_id: id,
          from_status: FLOW[reached - 1],
          to_status: status,
          actor_id: clientIds[0],
          created_at: iso(Math.min(now, ts[ts.length - 1] + 30 * MIN)),
          updated_at: iso(Math.min(now, ts[ts.length - 1] + 30 * MIN)),
        });

      if (status === 'paid' || status === 'closed') {
        const paidAt = at('paid')!;
        const method = r() < 0.65 ? 'card' : r() < 0.75 ? 'cash' : 'oxxo';
        payments.push({
          ...w.payments[0],
          id: `mpay-${id}`,
          service_order_id: id,
          client_id: orders[orders.length - 1].client_id,
          technician_id: tech,
          method,
          amount_cents: total,
          commission_cents: commission,
          platform_fee_cents: commission,
          stripe_payment_intent_id: method === 'cash' ? null : `pi_mock_${folio}`,
          paid_at: paidAt,
          created_at: paidAt,
          updated_at: paidAt,
        });
        ledger.push(
          { ...w.ledger[0], id: `mled-${id}-n`, technician_id: tech, service_order_id: id, entry_type: 'service_revenue', amount_cents: total - commission, description: `Neto ${id}`, created_at: paidAt, updated_at: paidAt },
          { ...w.ledger[0], id: `mled-${id}-c`, technician_id: tech, service_order_id: id, entry_type: 'platform_commission', amount_cents: -commission, description: `Comisión ${id}`, created_at: paidAt, updated_at: paidAt },
        );
        if (status === 'closed' && r() < 0.7) {
          const s = r();
          ratings.push({
            id: `mrat-${id}`,
            service_order_id: id,
            reviewer_id: orders[orders.length - 1].client_id,
            reviewee_id: tech,
            score: s < 0.62 ? 5 : s < 0.9 ? 4 : s < 0.97 ? 3 : s < 0.99 ? 2 : 1,
            comment: null,
            created_at: paidAt,
            updated_at: paidAt,
            is_hidden: false,
            hidden_reason: null,
            hidden_note: null,
            hidden_by: null,
            hidden_at: null,
          });
        }
      }
    }
  }

  // Moderación: comentarios de muestra y algunas calificaciones ocultas con motivo
  // (el admin demo las ocultó hace unos días). Determinista: primeras N del técnico.
  const COMMENTS = ['Llegó puntual y dejó todo limpio.', 'Buen trabajo, lo recomiendo.', 'Resolvió el problema a la primera.', 'Atento y profesional.'];
  const mine = (t: string) => ratings.filter(x => x.reviewee_id === t);
  mine('u-ag').slice(0, 8).forEach((x, i) => {
    x.comment = COMMENTS[i % COMMENTS.length];
  });
  const hide = (
    x: Row<'order_ratings'> | undefined,
    score: number,
    comment: string,
    reason: Row<'order_ratings'>['hidden_reason'],
    note: string | null,
    daysAgo: number,
  ) => {
    if (!x) return;
    const at = new Date(now - daysAgo * DAY).toISOString();
    Object.assign(x, {
      score,
      comment,
      is_hidden: true,
      hidden_reason: reason,
      hidden_note: note,
      hidden_by: 'demo-admin',
      hidden_at: at,
    });
  };
  hide(mine('u-ag')[9], 1, 'Pésimo, es un ladrón y un idiota.', 'offensive', null, 3);
  hide(mine('u-ag')[12], 2, 'No fue el técnico que pedí.', 'other', 'El cliente confirmó por teléfono que se equivocó de servicio.', 6);
  hide(mine('u-sc')[2], 1, 'Reseña repetida.', 'duplicate', null, 9);
  hide(mine(TECH_USER_ID)[3], 1, 'El servicio nunca se realizó.', 'cancelled_service', 'El servicio fue cancelado antes de la visita.', 4);

  // Emergencias (reemplazan al «urgente»): varias ya asignadas con su historial de
  // despacho (rondas con radio creciente, técnicos notificados y tiempo de respuesta),
  // una buscando técnico y una en `timed_out` esperando asignación manual.
  const dispatchLog: Row<'emergency_dispatch_log'>[] = [];
  const pool = Object.keys(BASES);
  const R0 = 3000;
  const STEP = 2000;
  const techOf = (ord: (typeof orders)[number]) => ord.technician_id;
  /** Rondas con técnicos distintos; `winner` (si hay) entra en la última. */
  function dispatchRounds(
    ord: (typeof orders)[number],
    rounds: number,
    winner: string | null,
    perRound: number[],
  ) {
    const others = pool.filter(t => t !== winner);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const t0 = new Date(ord.created_at).getTime();
    let n = 0;
    for (let round = 1; round <= rounds; round++) {
      const radius = R0 + STEP * (round - 1);
      const batch = others.splice(0, perRound[round - 1] ?? 1);
      if (round === rounds && winner) batch.push(winner);
      for (const tid of batch)
        dispatchLog.push({
          id: `mdl-${ord.id}-${++n}`,
          order_id: ord.id,
          round,
          radius_m: radius,
          technician_id: tid,
          distance_m: between(round === 1 ? 400 : radius - STEP + 200, radius - 100),
          notified_at: iso(t0 + (round - 1) * 60_000 + between(1, 6) * 1000),
        });
    }
  }
  const converted = orders.filter(
    o => o.status === 'closed' && o.technician_id && pool.includes(o.technician_id) && o.accepted_at,
  );
  for (let k = 0; k < 9; k++) {
    const o = converted[converted.length - 1 - k * 6];
    if (!o) continue;
    const rounds = 1 + (k % 3);
    const resp = (rounds - 1) * 60 + between(9, 52);
    const created = new Date(o.created_at).getTime();
    const acceptedAt = iso(created + resp * 1000);
    const fixed = k % 2 === 1;
    o.priority = 'emergency';
    o.assignment_mode = 'emergency';
    o.is_urgent = true;
    o.emergency_surcharge_cents = fixed
      ? 15000
      : Math.round(((o.quoted_total_cents ?? 0) - (o.quoted_total_cents ?? 0) / 1.3));
    o.dispatch_status = 'assigned';
    o.dispatch_round = rounds;
    o.dispatch_radius_m = R0 + STEP * (rounds - 1);
    o.dispatch_started_at = o.created_at;
    o.dispatch_deadline_at = iso(created + 10 * MIN);
    o.needs_manual_assignment = false;
    o.accepted_at = acceptedAt;
    const ev = events.find(e => e.id === `mev-${o.id}-1`);
    if (ev) {
      ev.created_at = acceptedAt;
      ev.updated_at = acceptedAt;
    }
    dispatchRounds(o, rounds, techOf(o), [1 + (k % 2), 2, 1]);
  }

  const emergencyBase = (n: number, catIdx: number, minsAgo: number, place: number) => {
    const [catId, , , , titles] = CATS[catIdx];
    const [neighborhood, municipality, postal_code, lng, lat] = PLACES[place];
    const at = now - minsAgo * MIN;
    orders.push({
      ...w.orders[0],
      id: `SVC-${n}`,
      folio: n,
      client_id: clientIds[n % clientIds.length],
      technician_id: null,
      category_id: catId,
      client_address_id: null,
      status: 'requested',
      title: titles[0],
      description: 'Emergencia: necesito técnico lo antes posible.',
      is_urgent: true,
      priority: 'emergency',
      assignment_mode: 'emergency',
      emergency_surcharge_cents: 15000,
      location: ewkb(lng, lat),
      address_line: `Calle ${between(1, 99)} #${between(100, 3000)}`,
      neighborhood,
      municipality,
      postal_code,
      quoted_subtotal_cents: null,
      quoted_total_cents: null,
      commission_cents: null,
      is_disputed: false,
      accepted_at: null,
      completed_at: null,
      paid_at: null,
      cancelled_at: null,
      cancellation_reason: null,
      expires_at: null,
      dispatch_started_at: iso(at),
      dispatch_deadline_at: iso(at + 10 * MIN),
      created_at: iso(at),
      updated_at: iso(at),
    });
    const ord = orders[orders.length - 1];
    events.push({
      ...w.events[0],
      id: `mev-${ord.id}-0`,
      service_order_id: ord.id,
      from_status: null,
      to_status: 'requested',
      actor_id: ord.client_id,
      created_at: iso(at),
      updated_at: iso(at),
    });
    return ord;
  };
  // En búsqueda: ronda 2 (radio 5 km), 3 técnicos notificados hasta ahora.
  const searching = emergencyBase(9001, 0, 2, 2);
  searching.dispatch_status = 'searching';
  searching.dispatch_round = 2;
  searching.dispatch_radius_m = R0 + STEP;
  dispatchRounds(searching, 2, null, [1, 2]);
  // Sin técnico tras el tiempo límite: alerta de asignación manual.
  const manual = emergencyBase(9002, 1, 38, 5);
  manual.dispatch_status = 'timed_out';
  manual.dispatch_round = 5;
  manual.dispatch_radius_m = R0 + STEP * 4;
  manual.needs_manual_assignment = true;
  manual.updated_at = iso(now - 28 * MIN);
  dispatchRounds(manual, 5, null, [1, 1, 2, 1, 1]);
  events.push({
    ...w.events[0],
    id: `mev-${manual.id}-timeout`,
    service_order_id: manual.id,
    from_status: 'requested',
    to_status: 'requested',
    actor_id: null,
    note: 'Sin técnico tras 10 min · asignación manual',
    created_at: iso(now - 28 * MIN),
    updated_at: iso(now - 28 * MIN),
  });

  // Solicitudes sin técnico (el cliente pidió «que Tumtto asigne»): distintas
  // antigüedades, zonas, categorías y fechas deseadas para la bandeja «Sin asignar».
  const DESC = [
    'Se tapó el drenaje de la cocina y huele mal, necesito que alguien venga.',
    'El minisplit de la recámara gotea y ya no enfría.',
    'Se botan los pastilleros cuando prendo el horno y la lavadora a la vez.',
    'Quiero cambiar la chapa de la puerta principal, me la quieren forzar.',
    'La lavadora no centrifuga y deja la ropa empapada.',
    'Revisión de la instalación de gas, huele a gas por las noches.',
    'Se descompuso el boiler, no hay agua caliente desde ayer.',
  ];
  const unassigned: [number, number, number, number | null][] = [
    // [categoría idx, minutos de antigüedad, lugar, horas hasta la cita deseada]
    [0, 7, 0, 20],
    [3, 19, 1, 52],
    [1, 34, 3, null],
    [5, 72, 6, 30],
    [4, 26 * 60, 4, 8],
    [2, 3 * 24 * 60 + 90, 9, null],
    [0, 12, 7, 5],
  ];
  unassigned.forEach(([catIdx, minsAgo, place, inH], k) => {
    const n = 9101 + k;
    const [catId, , , , titles] = CATS[catIdx];
    const [neighborhood, municipality, postal_code, lng, lat] = PLACES[place];
    const at = now - minsAgo * MIN;
    const when = inH == null ? null : now + inH * 60 * MIN;
    orders.push({
      ...w.orders[0],
      id: `SVC-${n}`,
      folio: n,
      client_id: clientIds[(n + 3) % clientIds.length],
      technician_id: null,
      category_id: catId,
      client_address_id: null,
      status: 'requested',
      title: titles[0],
      description: DESC[k % DESC.length],
      is_urgent: false,
      priority: 'normal',
      assignment_mode: 'admin',
      needs_manual_assignment: true,
      schedule_surcharge_bps: inH != null && (k === 0 || k === 4) ? 1500 : 0,
      scheduled_for: when != null ? iso(when) : null,
      scheduled_until: when != null ? iso(when + 2 * 60 * MIN) : null,
      location: ewkb(lng, lat),
      address_line: `Calle ${between(1, 99)} #${between(100, 3000)}`,
      neighborhood,
      municipality,
      postal_code,
      quoted_subtotal_cents: null,
      quoted_total_cents: null,
      commission_cents: null,
      is_disputed: false,
      accepted_at: null,
      completed_at: null,
      paid_at: null,
      cancelled_at: null,
      cancellation_reason: null,
      expires_at: null,
      dispatch_status: null,
      created_at: iso(at),
      updated_at: iso(at),
    });
    events.push({
      ...w.events[0],
      id: `mev-SVC-${n}-0`,
      service_order_id: `SVC-${n}`,
      from_status: null,
      to_status: 'requested',
      actor_id: clientIds[(n + 3) % clientIds.length],
      note: 'Pendiente de asignación',
      created_at: iso(at),
      updated_at: iso(at),
    });
  });

  // Retiros semanales por técnico activo: pagados salvo la última semana.
  const payouts: Row<'payout_requests'>[] = [];
  for (const t of ['u-ag', 'u-sc', 'u-jose', 'u-lupita', 'u-do', TECH_USER_ID])
    for (let wk = 12; wk >= 0; wk--) {
      const created = iso(now - wk * 7 * DAY - between(1, 48) * 60 * MIN);
      payouts.push({
        id: `mpo-${t}-${wk}`,
        technician_id: t,
        amount_cents: between(150, 900) * 1000,
        currency: 'MXN',
        status: wk === 0 ? 'pending' : wk === 1 ? 'approved' : 'paid',
        approved_at: wk === 0 ? null : created,
        approved_by: null,
        batch_id: null,
        failure_reason: null,
        idempotency_key: `mpo-${t}-${wk}`,
        stripe_account_id: null,
        stripe_payout_id: null,
        created_at: created,
        updated_at: created,
      });
    }

  // Algunas disputas más (abiertas y resueltas) sobre servicios cerrados.
  const closed = orders.filter(o => o.status === 'closed');
  const disputes = [...w.disputes];
  for (let i = 0; i < 5; i++) {
    const o = closed[Math.floor(closed.length * (0.5 + i * 0.1))];
    if (!o) continue;
    o.is_disputed = true;
    const resolved = i >= 2;
    disputes.push({
      ...w.disputes[0],
      id: `D-${200 + i}`,
      service_order_id: o.id,
      opened_by: o.client_id,
      reason: pick(['Trabajo incompleto', 'El precio final fue mayor al cotizado', 'La fuga regresó al día siguiente', 'Daño en el piso']),
      status: resolved ? 'resolved' : 'open',
      outcome: null,
      resolution_notes: resolved ? 'Se acordó visita de garantía sin costo.' : null,
      resolved_at: resolved ? o.updated_at : null,
      created_at: o.updated_at,
      updated_at: o.updated_at,
    });
  }

  // Comprobantes de domicilio de los primeros clientes: varios estados.
  const ymd = (ms: number) => iso(ms).slice(0, 10);
  const docStates: [Row<'client_documents'>['review_status'], number, string | null][] = [
    ['pending', 1, null],
    ['pending', 2, null],
    ['approved', 6, null],
    ['rejected', 4, 'La foto está borrosa y no se lee la dirección.'],
    ['pending', 0, null],
  ];
  const clientDocuments: Row<'client_documents'>[] = docStates.map(([status, ago, notes], i) => {
    const clientId = clientIds[i];
    const at = iso(now - ago * DAY - (i + 1) * 37 * MIN);
    const reviewed = status !== 'pending';
    return {
      id: `mock-cdoc-${i + 1}`,
      client_id: clientId,
      kind: 'proof_of_address',
      bucket_id: 'comprobante-domicilio',
      storage_path: `${clientId}/proof_of_address-${i + 1}.pdf`,
      issued_on: ymd(now - (10 + i * 15) * DAY),
      review_status: status,
      review_notes: notes,
      reviewed_by: reviewed ? 'u-admin' : null,
      reviewed_at: reviewed ? at : null,
      created_at: at,
      updated_at: at,
    };
  });

  return {
    world: { ...w, profiles, technicians, technicianCategories, orders, events, payments, ledger, disputes },
    ratings,
    payouts,
    zones,
    locations,
    clientDocuments,
    companies,
    vehicles,
    toolCatalog,
    techTools,
    dispatchLog,
  };
}
