import type { Database } from '../supabase';

/**
 * In-memory demo world — one coherent dataset shared across the Cliente,
 * Técnico and Admin role views. Services route here (instead of Supabase) when
 * demo mode is on, so a solicitud the cliente creates appears in the técnico
 * inbox and the admin dashboard, mutations persist in-session, and every flow
 * progresses end to end without a backend.
 *
 * Types mirror the real DB Row shapes so stores/screens stay unchanged.
 */
type T = Database['public']['Tables'];
export type Profile = T['profiles']['Row'];
export type Category = T['categories']['Row'];
export type Subcategory = T['subcategories']['Row'];
export type TechnicianProfile = T['technician_profiles']['Row'];
export type TechnicianCategory = T['technician_categories']['Row'];
export type TechnicianCoverageArea = T['technician_coverage_areas']['Row'];
export type TechnicianAvailability = T['technician_availability']['Row'];
export type ClientAddress = T['client_addresses']['Row'];
export type ServiceRequest = T['service_requests']['Row'];
export type ServiceExtra = T['service_extras']['Row'];
export type ServiceStatusEvent = T['service_status_events']['Row'];
export type Message = T['messages']['Row'];
export type Payment = T['payments']['Row'];
export type Rating = T['ratings']['Row'];
export type TechnicianDocument = T['technician_documents']['Row'];
export type Dispute = T['disputes']['Row'];
export type TechnicianWallet = T['technician_wallet']['Row'];
export type WalletTransaction = T['wallet_transactions']['Row'];
export type Payout = T['payouts']['Row'];
export type RequestStatus = Database['public']['Enums']['request_status'];

// ── Demo-only shapes (no DB table behind them) ───────────────────────────────
/** Internal admin note attached to any entity (request, técnico, cliente…). */
export interface Note {
  id: string;
  entity_id: string;
  author: string;
  text: string;
  created_at: string;
}

/** Support-ticket message — mirrors the Message shape keyed by ticket_id. */
export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string | null;
  attachments: string[];
  is_flagged: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  subject: string;
  requester_id: string;
  role: 'cliente' | 'tecnico';
  status: 'open' | 'pending' | 'resolved';
  priority: 'alta' | 'media' | 'baja';
  request_id: string | null;
  created_at: string;
  messages: TicketMessage[];
}

const now = () => new Date().toISOString();
const ts = () => ({ created_at: now(), updated_at: now() });
let seq = 1000;
export const nextId = (p: string) => `${p}-${++seq}`;

// ── Identities ──────────────────────────────────────────────────────────────
export const CLIENT_ID = 'demo-cliente';
export const TECH_USER_ID = 'demo-tecnico'; // Ramón — the técnico the cliente hires
export const ADMIN_ID = 'demo-admin';

function profile(id: string, full_name: string, role: Profile['role'], phone = '+52 33 0000 0000'): Profile {
  return { id, full_name, phone, role, avatar_url: null, status: 'active', ...ts() };
}

// ── Catalog (mirrors the seed) ───────────────────────────────────────────────
const CAT = (id: string, name: string, icon: string): Category => ({
  id,
  name,
  icon,
  description: null,
  is_active: true,
  ...ts(),
});
const SUB = (id: string, category_id: string, name: string, min: number, max: number): Subcategory => ({
  id,
  category_id,
  name,
  description: null,
  price_min: min,
  price_max: max,
  base_price_suggested: Math.round((min + max) / 2),
  is_active: true,
  ...ts(),
});

// ── Technician profile factory ───────────────────────────────────────────────
function tech(
  id: string,
  userId: string,
  rating: number,
  ratings: number,
  jobs: number,
  available = true,
): TechnicianProfile {
  return {
    id,
    user_id: userId,
    bio: 'Técnico certificado con experiencia comprobada. Garantía de 30 días.',
    kyc_status: 'approved',
    kyc_reviewed_by: ADMIN_ID,
    kyc_reviewed_at: now(),
    rating_avg: rating,
    ratings_count: ratings,
    total_jobs: jobs,
    payout_clabe: '012345678901234567',
    is_available: available,
    ...ts(),
  };
}

export interface World {
  profiles: Profile[];
  categories: Category[];
  subcategories: Subcategory[];
  technicians: TechnicianProfile[];
  technicianCategories: TechnicianCategory[];
  coverage: TechnicianCoverageArea[];
  availability: TechnicianAvailability[];
  addresses: ClientAddress[];
  requests: ServiceRequest[];
  extras: ServiceExtra[];
  events: ServiceStatusEvent[];
  messages: Message[];
  payments: Payment[];
  ratings: Rating[];
  documents: TechnicianDocument[];
  disputes: Dispute[];
  wallets: TechnicianWallet[];
  walletTxns: WalletTransaction[];
  payouts: Payout[];
  notes: Note[];
  tickets: Ticket[];
}

function build(): World {
  const profiles: Profile[] = [
    profile(CLIENT_ID, 'María Cliente (demo)', 'cliente', '+52 33 1234 5678'),
    profile(TECH_USER_ID, 'Ramón Hernández (demo)', 'tecnico', '+52 33 2345 6789'),
    profile(ADMIN_ID, 'Sofía Admin (demo)', 'admin'),
    profile('u-ag', 'Adriana García Soto', 'tecnico'),
    profile('u-sc', 'Sergio Camarena R.', 'tecnico'),
    profile('u-do', 'Daniela Ortega Camacho', 'tecnico'),
    profile('u-carla', 'Carla Domínguez R.', 'tecnico'),
    profile('u-carlos', 'Carlos Mendoza', 'cliente'),
    // Roster ZMG (antes mocks del listado de técnicos — ahora viven en el mundo
    // para que las acciones KYC muten filas reales).
    profile('u-miguel', 'Miguel Ángel López Rentería', 'tecnico', '+52 33 1842 5790'),
    profile('u-jose', 'José Carlos Juárez Mendoza', 'tecnico', '+52 33 1567 2034'),
    profile('u-lupita', 'Lupita Pérez Vázquez', 'tecnico', '+52 33 3120 9846'),
    profile('u-fer', 'Fernanda Olivares Ramírez', 'tecnico', '+52 33 1029 7733'),
    profile('u-luis', 'Luis Esteban Gómez Salinas', 'tecnico', '+52 33 2811 4467'),
    profile('u-ivan', 'Carlos Iván Velázquez Robles', 'tecnico', '+52 33 1992 0354'),
    profile('u-roberto', 'Roberto Villanueva Aceves', 'tecnico', '+52 33 3678 1102'),
  ];
  // Luis está suspendido a nivel usuario (la suspensión vive en profiles.status).
  profiles.find(p => p.id === 'u-luis')!.status = 'suspended';

  const categories = [
    CAT('cat-plo', 'Plomería', 'wrench'),
    CAT('cat-ele', 'Electricidad', 'zap'),
    CAT('cat-gas', 'Gas', 'flame'),
    CAT('cat-her', 'Herrería', 'hammer'),
    CAT('cat-pin', 'Pintura', 'paintbrush'),
    CAT('cat-cri', 'Cristales', 'square'),
    CAT('cat-dre', 'Drenaje', 'droplets'),
  ];
  const subcategories = [
    SUB('sub-fugas', 'cat-plo', 'Fugas', 300, 1500),
    SUB('sub-calent', 'cat-plo', 'Calentadores', 400, 2500),
    SUB('sub-drenaje', 'cat-plo', 'Drenaje de cocina', 350, 1800),
    SUB('sub-wc', 'cat-plo', 'Instalación de WC', 400, 2000),
    SUB('sub-contactos', 'cat-ele', 'Contactos y apagadores', 200, 1200),
    SUB('sub-lamparas', 'cat-ele', 'Instalación de lámparas', 250, 1500),
    SUB('sub-regulador', 'cat-gas', 'Cambio de regulador', 300, 1500),
    SUB('sub-ventanas', 'cat-cri', 'Ventanas residenciales', 350, 2200),
    SUB('sub-pintura-int', 'cat-pin', 'Pintura interior', 500, 4000),
    SUB('sub-portones', 'cat-her', 'Puertas y portones', 600, 5000),
  ];

  const technicians = [
    tech('t-ramon', TECH_USER_ID, 4.9, 214, 214),
    tech('t-ag', 'u-ag', 4.8, 167, 167),
    tech('t-sc', 'u-sc', 4.7, 92, 92),
    tech('t-do', 'u-do', 4.5, 38, 38, false),
    tech('t-carla', 'u-carla', 0, 0, 0, false), // pendiente KYC
    tech('t-miguel', 'u-miguel', 0, 0, 0, false), // pendiente KYC
    tech('t-jose', 'u-jose', 4.9, 87, 87),
    tech('t-lupita', 'u-lupita', 4.6, 45, 45),
    tech('t-fer', 'u-fer', 0, 0, 0, false), // pendiente KYC
    tech('t-luis', 'u-luis', 3.9, 27, 27, false), // suspendido (profiles.status)
    tech('t-ivan', 'u-ivan', 0, 0, 0), // pendiente KYC
    tech('t-roberto', 'u-roberto', 4.4, 56, 56, false), // rechazado
  ];
  const pendingKyc = ['t-carla', 't-miguel', 't-fer', 't-ivan'];
  for (const t of technicians) {
    if (pendingKyc.includes(t.id)) {
      t.kyc_status = 'pending_review';
      t.kyc_reviewed_by = null;
      t.kyc_reviewed_at = null;
    }
  }
  technicians.find(t => t.id === 't-roberto')!.kyc_status = 'rejected';

  const technicianCategories: TechnicianCategory[] = [
    { id: 'tc-1', technician_id: 't-ramon', subcategory_id: 'sub-fugas', base_price: 450, ...ts() },
    { id: 'tc-2', technician_id: 't-ramon', subcategory_id: 'sub-calent', base_price: 550, ...ts() },
    { id: 'tc-3', technician_id: 't-ramon', subcategory_id: 'sub-drenaje', base_price: 480, ...ts() },
    { id: 'tc-4', technician_id: 't-do', subcategory_id: 'sub-fugas', base_price: 380, ...ts() },
    { id: 'tc-5', technician_id: 't-ag', subcategory_id: 'sub-contactos', base_price: 400, ...ts() },
    { id: 'tc-6', technician_id: 't-ag', subcategory_id: 'sub-lamparas', base_price: 420, ...ts() },
    { id: 'tc-7', technician_id: 't-sc', subcategory_id: 'sub-regulador', base_price: 360, ...ts() },
    { id: 'tc-8', technician_id: 't-carla', subcategory_id: 'sub-ventanas', base_price: 420, ...ts() },
    { id: 'tc-9', technician_id: 't-miguel', subcategory_id: 'sub-ventanas', base_price: 450, ...ts() },
    { id: 'tc-10', technician_id: 't-jose', subcategory_id: 'sub-contactos', base_price: 380, ...ts() },
    { id: 'tc-11', technician_id: 't-lupita', subcategory_id: 'sub-pintura-int', base_price: 900, ...ts() },
    { id: 'tc-12', technician_id: 't-fer', subcategory_id: 'sub-fugas', base_price: 400, ...ts() },
    { id: 'tc-13', technician_id: 't-fer', subcategory_id: 'sub-regulador', base_price: 350, ...ts() },
    { id: 'tc-14', technician_id: 't-luis', subcategory_id: 'sub-wc', base_price: 500, ...ts() },
    { id: 'tc-15', technician_id: 't-ivan', subcategory_id: 'sub-ventanas', base_price: 380, ...ts() },
    { id: 'tc-16', technician_id: 't-ivan', subcategory_id: 'sub-portones', base_price: 850, ...ts() },
    { id: 'tc-17', technician_id: 't-roberto', subcategory_id: 'sub-pintura-int', base_price: 800, ...ts() },
  ];

  const coverage: TechnicianCoverageArea[] = [
    {
      id: 'cov-1',
      technician_id: 't-ramon',
      region_id: 'reg-zmg',
      neighborhood_id: null,
      center_geo: null,
      radius_km: 10,
      ...ts(),
    },
  ];

  const availability: TechnicianAvailability[] = [1, 2, 3, 4, 5, 6].map((weekday, i) => ({
    id: `av-${i}`,
    technician_id: 't-ramon',
    weekday,
    start_time: '09:00',
    end_time: '19:00',
    ...ts(),
  }));

  const addresses: ClientAddress[] = [
    {
      id: 'addr-1',
      user_id: CLIENT_ID,
      alias: 'Casa',
      line1: 'Av. Pablo Neruda 2825',
      line2: null,
      neighborhood: 'Providencia',
      city: 'Zapopan',
      state: 'Jalisco',
      zip: '44630',
      geo: null,
      is_primary: true,
      ...ts(),
    },
    {
      id: 'addr-2',
      user_id: CLIENT_ID,
      alias: 'Oficina',
      line1: 'Av. Américas 1500',
      line2: 'Piso 4',
      neighborhood: 'Country Club',
      city: 'Guadalajara',
      state: 'Jalisco',
      zip: '44610',
      geo: null,
      is_primary: false,
      ...ts(),
    },
  ];

  // One historical completed+rated service, one active in-progress service.
  const old = new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString();
  const requests: ServiceRequest[] = [
    {
      id: 'SVC-2835',
      client_id: CLIENT_ID,
      technician_id: TECH_USER_ID,
      subcategory_id: 'sub-calent',
      region_id: null,
      status: 'calificado',
      problem_description: 'Calentador no enciende, piloto apagado.',
      photos: [],
      address_snapshot: { alias: 'Casa', line1: 'Av. Pablo Neruda 2825' },
      scheduled_at: old,
      base_price: 550,
      total_price: 1640,
      created_at: old,
      updated_at: old,
    },
    {
      id: 'SVC-2851',
      client_id: CLIENT_ID,
      technician_id: TECH_USER_ID,
      subcategory_id: 'sub-fugas',
      region_id: null,
      status: 'en_camino',
      problem_description:
        'Fuga debajo del lavabo del baño desde ayer. El agua gotea y mojó el piso.',
      photos: [],
      address_snapshot: { alias: 'Casa', line1: 'Av. Pablo Neruda 2825' },
      scheduled_at: now(),
      base_price: 450,
      total_price: null,
      ...ts(),
    },
  ];

  const events: ServiceStatusEvent[] = [
    { id: 'ev-1', request_id: 'SVC-2851', status: 'solicitado', actor_id: CLIENT_ID, geo: null, note: null, created_at: old },
    { id: 'ev-2', request_id: 'SVC-2851', status: 'aceptado', actor_id: TECH_USER_ID, geo: null, note: null, created_at: now() },
    { id: 'ev-3', request_id: 'SVC-2851', status: 'en_camino', actor_id: TECH_USER_ID, geo: null, note: null, created_at: now() },
  ];

  const messages: Message[] = [
    { id: 'm-1', request_id: 'SVC-2851', sender_id: TECH_USER_ID, content: '¡Hola! Ya acepté tu solicitud, voy en camino.', attachments: [], is_flagged: false, created_at: now() },
    { id: 'm-2', request_id: 'SVC-2851', sender_id: CLIENT_ID, content: 'Perfecto, te espero. La fuga está en el baño principal.', attachments: [], is_flagged: false, created_at: now() },
    { id: 'm-3', request_id: 'SVC-2851', sender_id: TECH_USER_ID, content: 'Entendido, llevo refacciones. Llego en 15 min.', attachments: [], is_flagged: false, created_at: now() },
  ];

  const payments: Payment[] = [
    {
      id: 'pay-2835',
      request_id: 'SVC-2835',
      method: 'tarjeta',
      provider: 'stripe',
      provider_payment_id: 'pi_demo_2835',
      status: 'paid',
      gross_amount: 1640,
      platform_fee: 246,
      technician_net: 1394,
      paid_at: old,
      created_at: old,
      updated_at: old,
    },
  ];

  const ratings: Rating[] = [
    { id: 'rt-1', request_id: 'SVC-2835', from_user_id: CLIENT_ID, to_user_id: TECH_USER_ID, stars: 5, comment: 'Excelente trabajo, muy puntual.', tags: ['Puntual', 'Profesional'], created_at: old },
  ];

  const doc = (id: string, technician_id: string, doc_type: string): TechnicianDocument => ({
    id, technician_id, doc_type, file_url: `demo://${id}`, status: 'pending', reviewed_by: null, reviewed_at: null, ...ts(),
  });
  const documents: TechnicianDocument[] = [
    doc('doc-1', 't-carla', 'INE · Anverso'),
    doc('doc-2', 't-carla', 'Comprobante de domicilio'),
    doc('doc-3', 't-ag', 'INE · Anverso'),
    doc('doc-4', 't-miguel', 'INE · Anverso'),
    doc('doc-5', 't-miguel', 'INE · Reverso'),
    doc('doc-6', 't-miguel', 'Comprobante de domicilio (CFE, mayo 2026)'),
    doc('doc-7', 't-fer', 'INE · Anverso'),
    doc('doc-8', 't-fer', 'Certificación gas LP'),
    doc('doc-9', 't-ivan', 'INE · Anverso'),
    doc('doc-10', 't-ivan', 'Comprobante de domicilio'),
  ];

  const disputes: Dispute[] = [
    { id: 'D-118', request_id: 'SVC-2835', opened_by: CLIENT_ID, type: 'cobro', status: 'open', assigned_admin: null, resolution: null, ...ts() },
    { id: 'D-121', request_id: null, opened_by: 'u-carlos', type: 'cancelación', status: 'open', assigned_admin: null, resolution: null, ...ts() },
  ];

  const wallets: TechnicianWallet[] = [
    { id: 'w-ramon', technician_id: 't-ramon', balance: 4820, currency: 'MXN', ...ts() },
  ];
  const walletTxns: WalletTransaction[] = [
    { id: 'wt-1', wallet_id: 'w-ramon', type: 'credit', amount: 1394, reference: 'SVC-2835', created_at: old },
  ];
  const payouts: Payout[] = [
    { id: 'po-1', technician_id: 't-ramon', amount: 3000, status: 'processed', processed_at: old, batch_id: 'B-2026-05', clabe_snapshot: '012345678901234567', ...ts() },
    { id: 'po-2', technician_id: 't-carla', amount: 5420, status: 'pending', processed_at: null, batch_id: null, clabe_snapshot: '012180001234567890', ...ts() },
    { id: 'po-3', technician_id: 't-ag', amount: 3180, status: 'pending', processed_at: null, batch_id: null, clabe_snapshot: '044580009876543210', ...ts() },
    { id: 'po-4', technician_id: 't-sc', amount: 2240, status: 'processing', processed_at: null, batch_id: 'B-2026-06', clabe_snapshot: '014320005566778899', ...ts() },
  ];

  const notes: Note[] = [
    { id: 'n-1', entity_id: 'SVC-2851', author: 'Sofía Admin', text: 'Servicio monitoreado. Sin incidencias reportadas hasta el momento.', created_at: now() },
    { id: 'n-2', entity_id: CLIENT_ID, author: 'Sofía Admin', text: 'Cliente recurrente y puntual con los pagos. Prefiere visitas por la mañana.', created_at: now() },
    { id: 'n-3', entity_id: 't-miguel', author: 'Sofía Admin', text: 'Verifiqué dirección por WhatsApp. Vive en Las Juntas, confirmado. Doc CFE coincide.', created_at: old },
    { id: 'n-4', entity_id: 't-miguel', author: 'Daniel Olvera', text: 'Llamada de bienvenida realizada. Habla claro, entiende el flujo. Le envié liga de tutorial.', created_at: old },
  ];

  const tmsg = (id: string, ticket_id: string, sender_id: string, content: string, created_at = now()): TicketMessage => ({
    id, ticket_id, sender_id, content, attachments: [], is_flagged: false, created_at,
  });
  const tickets: Ticket[] = [
    {
      id: 'TK-501', subject: 'Cobro duplicado en mi tarjeta', requester_id: CLIENT_ID, role: 'cliente',
      status: 'open', priority: 'alta', request_id: 'SVC-2835', created_at: old,
      messages: [
        tmsg('tm-1', 'TK-501', CLIENT_ID, 'Hola, me aparecen dos cargos por el servicio del calentador. ¿Me pueden ayudar?', old),
        tmsg('tm-2', 'TK-501', ADMIN_ID, 'Hola María, ya lo estamos revisando con el procesador de pagos. Te confirmo hoy mismo.', old),
      ],
    },
    {
      id: 'TK-502', subject: 'No puedo actualizar mi CLABE', requester_id: TECH_USER_ID, role: 'tecnico',
      status: 'pending', priority: 'media', request_id: null, created_at: old,
      messages: [
        tmsg('tm-3', 'TK-502', TECH_USER_ID, 'La app me marca error al guardar mi nueva CLABE de BBVA.'),
        tmsg('tm-4', 'TK-502', ADMIN_ID, '¿Nos compartes una captura del error? Con eso lo escalamos a ingeniería.'),
      ],
    },
    {
      id: 'TK-503', subject: 'El técnico llegó tarde a la cita', requester_id: 'u-carlos', role: 'cliente',
      status: 'open', priority: 'baja', request_id: null, created_at: now(),
      messages: [tmsg('tm-5', 'TK-503', 'u-carlos', 'La cita era a las 10 y llegó 11:40. Quiero dejar constancia.')],
    },
    {
      id: 'TK-504', subject: '¿Cómo amplío mi zona de cobertura?', requester_id: 'u-ag', role: 'tecnico',
      status: 'resolved', priority: 'baja', request_id: null, created_at: old,
      messages: [
        tmsg('tm-6', 'TK-504', 'u-ag', 'Quiero cubrir también Tonalá, ¿dónde lo configuro?', old),
        tmsg('tm-7', 'TK-504', ADMIN_ID, 'Desde tu perfil > Cobertura puedes agregar zonas. Ya te habilité la opción. ¡Saludos!', old),
      ],
    },
  ];

  return {
    profiles,
    categories,
    subcategories,
    technicians,
    technicianCategories,
    coverage,
    availability,
    addresses,
    requests,
    extras: [],
    events,
    messages,
    payments,
    ratings,
    documents,
    disputes,
    wallets,
    walletTxns,
    payouts,
    notes,
    tickets,
  };
}

let world: World = build();

/** The live in-memory world. */
export const demoWorld = () => world;

/** Reset to the seeded state (used when (re)entering demo mode). */
export function resetDemoWorld() {
  world = build();
}
