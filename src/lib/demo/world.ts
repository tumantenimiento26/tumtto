import type { Database } from '@/types/supabase';

/**
 * In-memory demo world — one coherent dataset shared across the Cliente,
 * Técnico and Admin console views. Selectors/mutators live in `store.ts`.
 *
 * Types mirror the DEPLOYED DB Row shapes (tumtto-backend migrations) so the
 * console renders exactly what production data will look like.
 */
type T = Database['public']['Tables'];
export type Profile = T['profiles']['Row'];
export type ServiceCategory = T['service_categories']['Row'];
export type Technician = T['technicians']['Row'];
export type TechnicianCategory = T['technician_categories']['Row'];
export type TechnicianRate = T['technician_rates']['Row'];
export type ClientAddress = T['client_addresses']['Row'];
export type ServiceOrder = T['service_orders']['Row'];
export type ServiceQuote = T['service_quotes']['Row'];
export type ServiceQuoteItem = T['service_quote_items']['Row'];
export type ServiceStatusEvent = T['service_order_status_events']['Row'];
export type Payment = T['payments']['Row'];
export type LedgerEntry = T['ledger_entries']['Row'];
export type KycSession = T['kyc_sessions']['Row'];
export type Dispute = T['disputes']['Row'];
export type OrderStatus = Database['public']['Enums']['service_order_status'];
export type UserRole = Database['public']['Enums']['user_role'];
export type KycStatus = Database['public']['Enums']['kyc_status'];

// Compat alias while pages migrate naming.
export type Category = ServiceCategory;
export type ServiceRequest = ServiceOrder;
export type RequestStatus = OrderStatus;

// ── Demo-only shapes (no DB table behind them yet) ───────────────────────────
// ponytail: chat, ratings, payout requests, notes y tickets no tienen tabla en
// el esquema desplegado — viven solo en el demo world. Migraciones pendientes.
export type DemoMessage = {
  id: string;
  order_id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
};
export type DemoRating = {
  id: string;
  order_id: string;
  from_id: string;
  to_id: string;
  stars: number;
  comment: string | null;
  tags: string[];
  created_at: string;
};
export type DemoPayout = {
  id: string;
  technician_id: string;
  amount_cents: number;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  clabe_snapshot: string | null;
  batch_id: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Internal admin note attached to any entity (order, técnico, cliente…). */
export interface Note {
  id: string;
  entity_id: string;
  author: string;
  text: string;
  created_at: string;
}

/** Support-ticket message — keyed by ticket_id. */
export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  subject: string;
  requester_id: string;
  role: 'cliente' | 'tecnico';
  status: 'open' | 'pending' | 'resolved';
  priority: 'alta' | 'media' | 'baja';
  order_id: string | null;
  created_at: string;
  messages: TicketMessage[];
}

const now = () => new Date().toISOString();
const ts = () => ({ created_at: now(), updated_at: now() });
let seq = 1000;
export const nextId = (p: string) => `${p}-${++seq}`;

// ── Identities ──────────────────────────────────────────────────────────────
// technicians.id === profiles.id in the deployed schema (1:1).
export const CLIENT_ID = 'demo-cliente';
export const TECH_USER_ID = 'demo-tecnico'; // Ramón — the técnico the cliente hires
export const ADMIN_ID = 'demo-admin';

function profile(
  id: string,
  full_name: string,
  role: UserRole,
  phone = '+52 33 0000 0000',
): Profile {
  return {
    id,
    full_name,
    phone,
    role,
    avatar_path: null,
    status: 'active',
    ...ts(),
  };
}

// ── Catalog (mirrors supabase/seed.sql) ──────────────────────────────────────
const CAT = (
  slug: string,
  name: string,
  icon: string,
  sort_order: number,
  description: string,
): ServiceCategory => ({
  id: `cat-${slug}`,
  slug,
  name,
  icon,
  description,
  sort_order,
  is_active: true,
  ...ts(),
});

// ── Technician factory (id = profile id) ─────────────────────────────────────
function tech(
  id: string,
  rating: number,
  ratings: number,
  available = true,
): Technician {
  return {
    id,
    display_name: null,
    bio: 'Técnico certificado con experiencia comprobada. Garantía de 30 días.',
    kyc_status: 'approved',
    rating_avg: rating,
    rating_count: ratings,
    is_available: available,
    curp: null,
    rfc: null,
    home_address: null,
    bank_name: 'BBVA',
    clabe: '012345678901234567',
    ...ts(),
  };
}

const rate = (
  technician_id: string,
  category_id: string,
  visita: number,
  hora: number,
  minimo: number,
): TechnicianRate => ({
  id: nextId('rate'),
  technician_id,
  category_id,
  visita_cents: visita,
  hora_cents: hora,
  minimo_cents: minimo,
  currency: 'MXN',
  ...ts(),
});

const geo = (lng: number, lat: number) => ({
  type: 'Point',
  coordinates: [lng, lat],
});

export interface World {
  profiles: Profile[];
  categories: ServiceCategory[];
  technicians: Technician[];
  technicianCategories: TechnicianCategory[];
  rates: TechnicianRate[];
  addresses: ClientAddress[];
  orders: ServiceOrder[];
  quotes: ServiceQuote[];
  quoteItems: ServiceQuoteItem[];
  events: ServiceStatusEvent[];
  payments: Payment[];
  ledger: LedgerEntry[];
  kycSessions: KycSession[];
  disputes: Dispute[];
  // demo-only (no backing tables yet)
  messages: DemoMessage[];
  ratings: DemoRating[];
  payouts: DemoPayout[];
  notes: Note[];
  tickets: Ticket[];
}

function build(): World {
  const profiles: Profile[] = [
    profile(CLIENT_ID, 'María Cliente (demo)', 'client', '+52 33 1234 5678'),
    profile(
      TECH_USER_ID,
      'Ramón Hernández (demo)',
      'technician',
      '+52 33 2345 6789',
    ),
    profile(ADMIN_ID, 'Sofía Admin (demo)', 'admin'),
    profile('u-ag', 'Adriana García Soto', 'technician'),
    profile('u-sc', 'Sergio Camarena R.', 'technician'),
    profile('u-do', 'Daniela Ortega Camacho', 'technician'),
    profile('u-carla', 'Carla Domínguez R.', 'technician'),
    profile('u-carlos', 'Carlos Mendoza', 'client'),
    // Roster ZMG (antes mocks del listado de técnicos — ahora viven en el mundo
    // para que las acciones KYC muten filas reales).
    profile(
      'u-miguel',
      'Miguel Ángel López Rentería',
      'technician',
      '+52 33 1842 5790',
    ),
    profile(
      'u-jose',
      'José Carlos Juárez Mendoza',
      'technician',
      '+52 33 1567 2034',
    ),
    profile(
      'u-lupita',
      'Lupita Pérez Vázquez',
      'technician',
      '+52 33 3120 9846',
    ),
    profile(
      'u-fer',
      'Fernanda Olivares Ramírez',
      'technician',
      '+52 33 1029 7733',
    ),
    profile(
      'u-luis',
      'Luis Esteban Gómez Salinas',
      'technician',
      '+52 33 2811 4467',
    ),
    profile(
      'u-ivan',
      'Carlos Iván Velázquez Robles',
      'technician',
      '+52 33 1992 0354',
    ),
    profile(
      'u-roberto',
      'Roberto Villanueva Aceves',
      'technician',
      '+52 33 3678 1102',
    ),
  ];
  // Luis está suspendido a nivel usuario (la suspensión vive en profiles.status).
  profiles.find(p => p.id === 'u-luis')!.status = 'suspended';

  const categories = [
    CAT(
      'plumbing',
      'Plomería',
      'wrench',
      10,
      'Fugas, destapes, instalaciones hidráulicas',
    ),
    CAT(
      'electrical',
      'Electricidad',
      'zap',
      20,
      'Cortocircuitos, instalaciones y mantenimiento eléctrico',
    ),
    CAT(
      'gas',
      'Gas',
      'flame',
      30,
      'Fugas, instalación y revisión de gas LP/natural',
    ),
    CAT(
      'ac',
      'Aire acondicionado',
      'wind',
      40,
      'Instalación, carga de gas y mantenimiento de AA',
    ),
    CAT(
      'appliances',
      'Electrodomésticos',
      'plug',
      50,
      'Reparación de lavadoras, refrigeradores y más',
    ),
    CAT(
      'locks',
      'Cerrajería',
      'key',
      60,
      'Aperturas, cambios de chapas y emergencias',
    ),
  ];

  const technicians = [
    tech(TECH_USER_ID, 4.9, 214),
    tech('u-ag', 4.8, 167),
    tech('u-sc', 4.7, 92),
    tech('u-do', 4.5, 38, false),
    tech('u-carla', 0, 0, false), // pendiente KYC
    tech('u-miguel', 0, 0, false), // pendiente KYC
    tech('u-jose', 4.9, 87),
    tech('u-lupita', 4.6, 45),
    tech('u-fer', 0, 0, false), // pendiente KYC
    tech('u-luis', 3.9, 27, false), // suspendido (profiles.status)
    tech('u-ivan', 0, 0), // pendiente KYC
    tech('u-roberto', 4.4, 56, false), // rechazado
  ];
  const pendingKyc = ['u-carla', 'u-miguel', 'u-fer', 'u-ivan'];
  for (const t of technicians) {
    if (pendingKyc.includes(t.id)) t.kyc_status = 'in_review';
  }
  technicians.find(t => t.id === 'u-roberto')!.kyc_status = 'declined';

  const tcat = (
    technician_id: string,
    category_id: string,
  ): TechnicianCategory => ({
    technician_id,
    category_id,
    ...ts(),
  });
  const technicianCategories: TechnicianCategory[] = [
    tcat(TECH_USER_ID, 'cat-plumbing'),
    tcat(TECH_USER_ID, 'cat-gas'),
    tcat('u-ag', 'cat-electrical'),
    tcat('u-sc', 'cat-gas'),
    tcat('u-do', 'cat-plumbing'),
    tcat('u-carla', 'cat-locks'),
    tcat('u-miguel', 'cat-locks'),
    tcat('u-jose', 'cat-electrical'),
    tcat('u-lupita', 'cat-appliances'),
    tcat('u-fer', 'cat-plumbing'),
    tcat('u-fer', 'cat-gas'),
    tcat('u-luis', 'cat-plumbing'),
    tcat('u-ivan', 'cat-locks'),
    tcat('u-roberto', 'cat-appliances'),
  ];

  const rates: TechnicianRate[] = [
    rate(TECH_USER_ID, 'cat-plumbing', 45000, 35000, 45000),
    rate(TECH_USER_ID, 'cat-gas', 36000, 30000, 36000),
    rate('u-ag', 'cat-electrical', 40000, 32000, 40000),
    rate('u-sc', 'cat-gas', 36000, 28000, 36000),
    rate('u-do', 'cat-plumbing', 38000, 30000, 38000),
    rate('u-jose', 'cat-electrical', 38000, 30000, 38000),
    rate('u-lupita', 'cat-appliances', 90000, 45000, 90000),
  ];

  const addresses: ClientAddress[] = [
    {
      id: 'addr-1',
      client_id: CLIENT_ID,
      label: 'Casa',
      address_line: 'Av. Pablo Neruda 2825',
      neighborhood: 'Providencia',
      municipality: 'Zapopan',
      state: 'Jalisco',
      postal_code: '44630',
      place_name: 'Av. Pablo Neruda 2825, Providencia, Zapopan',
      location: geo(-103.3773, 20.7062),
      mapbox_feature_id: null,
      raw_mapbox_feature: null,
      is_default: true,
      ...ts(),
    },
    {
      id: 'addr-2',
      client_id: CLIENT_ID,
      label: 'Oficina',
      address_line: 'Av. Américas 1500, Piso 4',
      neighborhood: 'Country Club',
      municipality: 'Guadalajara',
      state: 'Jalisco',
      postal_code: '44610',
      place_name: 'Av. Américas 1500, Country Club, Guadalajara',
      location: geo(-103.3695, 20.7096),
      mapbox_feature_id: null,
      raw_mapbox_feature: null,
      is_default: false,
      ...ts(),
    },
  ];

  // One historical closed+rated service, one active in-progress service.
  const old = new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString();
  const mins = (n: number) =>
    new Date(Date.now() - 1000 * 60 * n).toISOString();

  function order(
    partial: Partial<ServiceOrder> &
      Pick<ServiceOrder, 'id' | 'client_id' | 'category_id' | 'status'>,
  ): ServiceOrder {
    return {
      technician_id: null,
      client_address_id: null,
      title: null,
      description: null,
      is_urgent: false,
      urgent_surcharge_bps: 0,
      location: geo(-103.3773, 20.7062),
      place_name: null,
      address_line: null,
      neighborhood: null,
      municipality: 'Guadalajara',
      state: 'Jalisco',
      postal_code: null,
      mapbox_feature_id: null,
      raw_mapbox_feature: null,
      quoted_subtotal_cents: null,
      quoted_total_cents: null,
      commission_bps: 1500,
      commission_cents: null,
      is_disputed: false,
      accepted_at: null,
      completed_at: null,
      paid_at: null,
      cancelled_at: null,
      cancellation_reason: null,
      expires_at: null,
      ...ts(),
      ...partial,
    };
  }

  const orders: ServiceOrder[] = [
    order({
      id: 'SVC-2835',
      client_id: CLIENT_ID,
      technician_id: TECH_USER_ID,
      category_id: 'cat-plumbing',
      client_address_id: 'addr-1',
      status: 'closed',
      title: 'Calentador no enciende',
      description: 'Calentador no enciende, piloto apagado.',
      address_line: 'Av. Pablo Neruda 2825',
      neighborhood: 'Providencia',
      municipality: 'Zapopan',
      quoted_subtotal_cents: 164000,
      quoted_total_cents: 164000,
      commission_cents: 24600,
      accepted_at: old,
      completed_at: old,
      paid_at: old,
      created_at: old,
      updated_at: old,
    }),
    order({
      id: 'SVC-2851',
      client_id: CLIENT_ID,
      technician_id: TECH_USER_ID,
      category_id: 'cat-plumbing',
      client_address_id: 'addr-1',
      status: 'enroute',
      title: 'Fuga en el baño',
      description:
        'Fuga debajo del lavabo del baño desde ayer. El agua gotea y mojó el piso.',
      address_line: 'Av. Pablo Neruda 2825',
      neighborhood: 'Providencia',
      municipality: 'Zapopan',
      accepted_at: mins(25),
    }),
  ];

  const quotes: ServiceQuote[] = [
    {
      id: 'q-2851',
      service_order_id: 'SVC-2851',
      technician_id: TECH_USER_ID,
      labor_cents: 45000,
      materials_cents: 42000,
      surcharge_cents: 0,
      total_cents: 87000,
      notes: 'Incluye cambio de llave angular y cespol.',
      accepted_at: mins(20),
      rejected_at: null,
      ...ts(),
    },
  ];
  const quoteItems: ServiceQuoteItem[] = [
    {
      id: 'qi-1',
      quote_id: 'q-2851',
      description: 'Cambio de llave angular dañada',
      quantity: 1,
      unit_cents: 18000,
      total_cents: 18000,
      ...ts(),
    },
    {
      id: 'qi-2',
      quote_id: 'q-2851',
      description: 'Reemplazo de cespol y sello',
      quantity: 1,
      unit_cents: 24000,
      total_cents: 24000,
      ...ts(),
    },
  ];

  const events: ServiceStatusEvent[] = [
    {
      id: 'ev-1',
      service_order_id: 'SVC-2851',
      from_status: null,
      to_status: 'requested',
      actor_id: CLIENT_ID,
      note: null,
      created_at: mins(40),
      updated_at: mins(40),
    },
    {
      id: 'ev-2',
      service_order_id: 'SVC-2851',
      from_status: 'requested',
      to_status: 'accepted',
      actor_id: TECH_USER_ID,
      note: null,
      created_at: mins(25),
      updated_at: mins(25),
    },
    {
      id: 'ev-3',
      service_order_id: 'SVC-2851',
      from_status: 'accepted',
      to_status: 'enroute',
      actor_id: TECH_USER_ID,
      note: null,
      created_at: mins(12),
      updated_at: mins(12),
    },
  ];

  const payments: Payment[] = [
    {
      id: 'pay-2835',
      service_order_id: 'SVC-2835',
      client_id: CLIENT_ID,
      technician_id: TECH_USER_ID,
      method: 'card',
      status: 'paid',
      amount_cents: 164000,
      commission_cents: 24600,
      currency: 'MXN',
      mp_preference_id: 'pref_demo_2835',
      mp_payment_id: 'mp_demo_2835',
      mp_status: 'approved',
      idempotency_key: null,
      metadata: {},
      paid_at: old,
      created_at: old,
      updated_at: old,
    },
  ];

  // Signed amounts: positive = a favor del técnico, negative = cargo.
  const led = (
    id: string,
    technician_id: string,
    entry_type: LedgerEntry['entry_type'],
    amount_cents: number,
    description: string,
    service_order_id: string | null = null,
  ): LedgerEntry => ({
    id,
    technician_id,
    service_order_id,
    payment_id: null,
    entry_type,
    amount_cents,
    currency: 'MXN',
    description,
    metadata: {},
    created_at: old,
    updated_at: old,
  });
  const ledger: LedgerEntry[] = [
    led(
      'led-1',
      TECH_USER_ID,
      'adjustment',
      139400,
      'Neto SVC-2835 (tarjeta)',
      'SVC-2835',
    ),
    led(
      'led-2',
      TECH_USER_ID,
      'commission_collected',
      -24600,
      'Comisión plataforma SVC-2835',
      'SVC-2835',
    ),
    led('led-3', 'u-ag', 'adjustment', 31800, 'Neto servicios de la semana'),
    led('led-4', 'u-sc', 'adjustment', 22400, 'Neto servicios de la semana'),
  ];

  const kyc = (
    id: string,
    technician_id: string,
    status: KycSession['status'],
  ): KycSession => ({
    id,
    technician_id,
    didit_session_id: `didit-${id}`,
    workflow_id: 'wf-demo',
    vendor_data: technician_id,
    status,
    verification_url: 'https://verify.didit.me/session/demo',
    session_token: null,
    raw_decision: null,
    last_webhook_at: null,
    ...ts(),
  });
  const kycSessions: KycSession[] = [
    kyc('kyc-carla', 'u-carla', 'in_review'),
    kyc('kyc-miguel', 'u-miguel', 'in_review'),
    kyc('kyc-fer', 'u-fer', 'in_review'),
    kyc('kyc-ivan', 'u-ivan', 'in_progress'),
    kyc('kyc-roberto', 'u-roberto', 'declined'),
  ];

  const disputes: Dispute[] = [
    {
      id: 'D-118',
      service_order_id: 'SVC-2835',
      opened_by: CLIENT_ID,
      reason: 'Cobro no reconocido en el servicio de calentador.',
      status: 'open',
      resolution_notes: null,
      resolved_by: null,
      resolved_at: null,
      ...ts(),
    },
    {
      id: 'D-121',
      service_order_id: 'SVC-2851',
      opened_by: 'u-carlos',
      reason: 'El técnico canceló de último momento.',
      status: 'open',
      resolution_notes: null,
      resolved_by: null,
      resolved_at: null,
      ...ts(),
    },
  ];

  const messages: DemoMessage[] = [
    {
      id: 'm-1',
      order_id: 'SVC-2851',
      sender_id: TECH_USER_ID,
      content: '¡Hola! Ya acepté tu solicitud, voy en camino.',
      created_at: mins(24),
    },
    {
      id: 'm-2',
      order_id: 'SVC-2851',
      sender_id: CLIENT_ID,
      content: 'Perfecto, te espero. La fuga está en el baño principal.',
      created_at: mins(22),
    },
    {
      id: 'm-3',
      order_id: 'SVC-2851',
      sender_id: TECH_USER_ID,
      content: 'Entendido, llevo refacciones. Llego en 15 min.',
      created_at: mins(20),
    },
  ];

  const ratings: DemoRating[] = [
    {
      id: 'rt-1',
      order_id: 'SVC-2835',
      from_id: CLIENT_ID,
      to_id: TECH_USER_ID,
      stars: 5,
      comment: 'Excelente trabajo, muy puntual.',
      tags: ['Puntual', 'Profesional'],
      created_at: old,
    },
  ];

  const payout = (
    id: string,
    technician_id: string,
    amount_cents: number,
    status: DemoPayout['status'],
    clabe: string,
    batch: string | null = null,
  ): DemoPayout => ({
    id,
    technician_id,
    amount_cents,
    status,
    clabe_snapshot: clabe,
    batch_id: batch,
    processed_at: status === 'processed' ? old : null,
    created_at: old,
    updated_at: old,
  });
  const payouts: DemoPayout[] = [
    payout(
      'po-1',
      TECH_USER_ID,
      300000,
      'processed',
      '012345678901234567',
      'B-2026-05',
    ),
    payout('po-2', 'u-carla', 542000, 'pending', '012180001234567890'),
    payout('po-3', 'u-ag', 318000, 'pending', '044580009876543210'),
    payout(
      'po-4',
      'u-sc',
      224000,
      'processing',
      '014320005566778899',
      'B-2026-06',
    ),
  ];

  const notes: Note[] = [
    {
      id: 'n-1',
      entity_id: 'SVC-2851',
      author: 'Sofía Admin',
      text: 'Servicio monitoreado. Sin incidencias reportadas hasta el momento.',
      created_at: now(),
    },
    {
      id: 'n-2',
      entity_id: CLIENT_ID,
      author: 'Sofía Admin',
      text: 'Cliente recurrente y puntual con los pagos. Prefiere visitas por la mañana.',
      created_at: now(),
    },
    {
      id: 'n-3',
      entity_id: 'u-miguel',
      author: 'Sofía Admin',
      text: 'Verifiqué dirección por WhatsApp. Vive en Las Juntas, confirmado. Doc CFE coincide.',
      created_at: old,
    },
    {
      id: 'n-4',
      entity_id: 'u-miguel',
      author: 'Daniel Olvera',
      text: 'Llamada de bienvenida realizada. Habla claro, entiende el flujo. Le envié liga de tutorial.',
      created_at: old,
    },
  ];

  const tmsg = (
    id: string,
    ticket_id: string,
    sender_id: string,
    content: string,
    created_at = now(),
  ): TicketMessage => ({
    id,
    ticket_id,
    sender_id,
    content,
    created_at,
  });
  const tickets: Ticket[] = [
    {
      id: 'TK-501',
      subject: 'Cobro duplicado en mi tarjeta',
      requester_id: CLIENT_ID,
      role: 'cliente',
      status: 'open',
      priority: 'alta',
      order_id: 'SVC-2835',
      created_at: old,
      messages: [
        tmsg(
          'tm-1',
          'TK-501',
          CLIENT_ID,
          'Hola, me aparecen dos cargos por el servicio del calentador. ¿Me pueden ayudar?',
          old,
        ),
        tmsg(
          'tm-2',
          'TK-501',
          ADMIN_ID,
          'Hola María, ya lo estamos revisando con el procesador de pagos. Te confirmo hoy mismo.',
          old,
        ),
      ],
    },
    {
      id: 'TK-502',
      subject: 'No puedo actualizar mi CLABE',
      requester_id: TECH_USER_ID,
      role: 'tecnico',
      status: 'pending',
      priority: 'media',
      order_id: null,
      created_at: old,
      messages: [
        tmsg(
          'tm-3',
          'TK-502',
          TECH_USER_ID,
          'La app me marca error al guardar mi nueva CLABE de BBVA.',
        ),
        tmsg(
          'tm-4',
          'TK-502',
          ADMIN_ID,
          '¿Nos compartes una captura del error? Con eso lo escalamos a ingeniería.',
        ),
      ],
    },
    {
      id: 'TK-503',
      subject: 'El técnico llegó tarde a la cita',
      requester_id: 'u-carlos',
      role: 'cliente',
      status: 'open',
      priority: 'baja',
      order_id: null,
      created_at: now(),
      messages: [
        tmsg(
          'tm-5',
          'TK-503',
          'u-carlos',
          'La cita era a las 10 y llegó 11:40. Quiero dejar constancia.',
        ),
      ],
    },
    {
      id: 'TK-504',
      subject: '¿Cómo amplío mi zona de cobertura?',
      requester_id: 'u-ag',
      role: 'tecnico',
      status: 'resolved',
      priority: 'baja',
      order_id: null,
      created_at: old,
      messages: [
        tmsg(
          'tm-6',
          'TK-504',
          'u-ag',
          'Quiero cubrir también Tonalá, ¿dónde lo configuro?',
          old,
        ),
        tmsg(
          'tm-7',
          'TK-504',
          ADMIN_ID,
          'Desde tu perfil > Cobertura puedes agregar zonas. Ya te habilité la opción. ¡Saludos!',
          old,
        ),
      ],
    },
  ];

  return {
    profiles,
    categories,
    technicians,
    technicianCategories,
    rates,
    addresses,
    orders,
    quotes,
    quoteItems,
    events,
    payments,
    ledger,
    kycSessions,
    disputes,
    messages,
    ratings,
    payouts,
    notes,
    tickets,
  };
}

/** Empty world — the live data store starts here and fills it from Supabase. */
export function emptyWorld(): World {
  return {
    profiles: [],
    categories: [],
    technicians: [],
    technicianCategories: [],
    rates: [],
    addresses: [],
    orders: [],
    quotes: [],
    quoteItems: [],
    events: [],
    payments: [],
    ledger: [],
    kycSessions: [],
    disputes: [],
    messages: [],
    ratings: [],
    payouts: [],
    notes: [],
    tickets: [],
  };
}

let world: World = build();

/** The live in-memory world. */
export const demoWorld = () => world;

/** Reset to the seeded state (used when (re)entering demo mode). */
export function resetDemoWorld() {
  world = build();
}
