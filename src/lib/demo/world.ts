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
  ];

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
  ];

  const technicians = [
    tech('t-ramon', TECH_USER_ID, 4.9, 214, 214),
    tech('t-ag', 'u-ag', 4.8, 167, 167),
    tech('t-sc', 'u-sc', 4.7, 92, 92),
    tech('t-do', 'u-do', 4.5, 38, 38, false),
    tech('t-carla', 'u-carla', 0, 0, 0, false), // pendiente KYC
  ];
  // Carla is mid-review for the admin KYC queue.
  technicians[4].kyc_status = 'pending_review';
  technicians[4].kyc_reviewed_by = null;
  technicians[4].kyc_reviewed_at = null;

  const technicianCategories: TechnicianCategory[] = [
    { id: 'tc-1', technician_id: 't-ramon', subcategory_id: 'sub-fugas', base_price: 450, ...ts() },
    { id: 'tc-2', technician_id: 't-ramon', subcategory_id: 'sub-calent', base_price: 550, ...ts() },
    { id: 'tc-3', technician_id: 't-ramon', subcategory_id: 'sub-drenaje', base_price: 480, ...ts() },
    { id: 'tc-4', technician_id: 't-do', subcategory_id: 'sub-fugas', base_price: 380, ...ts() },
    { id: 'tc-5', technician_id: 't-ag', subcategory_id: 'sub-contactos', base_price: 400, ...ts() },
    { id: 'tc-6', technician_id: 't-ag', subcategory_id: 'sub-lamparas', base_price: 420, ...ts() },
    { id: 'tc-7', technician_id: 't-sc', subcategory_id: 'sub-regulador', base_price: 360, ...ts() },
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

  const documents: TechnicianDocument[] = [
    { id: 'doc-1', technician_id: 't-carla', doc_type: 'INE frente', file_url: 'demo://ine-front', status: 'pending', reviewed_by: null, reviewed_at: null, ...ts() },
    { id: 'doc-2', technician_id: 't-carla', doc_type: 'Comprobante domicilio', file_url: 'demo://addr', status: 'pending', reviewed_by: null, reviewed_at: null, ...ts() },
    { id: 'doc-3', technician_id: 't-ag', doc_type: 'INE frente', file_url: 'demo://ine-ag', status: 'pending', reviewed_by: null, reviewed_at: null, ...ts() },
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
  };
}

let world: World = build();

/** The live in-memory world. */
export const demoWorld = () => world;

/** Reset to the seeded state (used when (re)entering demo mode). */
export function resetDemoWorld() {
  world = build();
}
