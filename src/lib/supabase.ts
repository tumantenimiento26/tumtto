// Tumantenimiento DB types — HAND-AUTHORED from supabase/migrations/0001_init.sql.
// ponytail: Insert/Update are Partial<Row>, not precise nullability. Regenerate the
// real types once the project is linked:  pnpm gen:types
// (supabase gen types typescript --linked > src/types/supabase.ts)

export type UserRole = 'cliente' | 'tecnico' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type KycStatus = 'pending_review' | 'approved' | 'rejected';
export type DocStatus = 'pending' | 'approved' | 'rejected';
export type RequestStatus =
  | 'solicitado' | 'aceptado' | 'en_camino' | 'en_sitio' | 'en_ejecucion'
  | 'completado' | 'pagado' | 'calificado' | 'cancelado' | 'rechazado';
export type ExtraStatus = 'pending_approval' | 'approved' | 'rejected';
export type PaymentMethod = 'tarjeta' | 'oxxo' | 'mercadopago' | 'efectivo';
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded';
export type RefundStatus = 'requested' | 'approved' | 'rejected' | 'processed';
export type WalletTxnType = 'credit' | 'debit' | 'payout' | 'fee';
export type PayoutStatus = 'pending' | 'processing' | 'processed' | 'failed';
export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'closed';

type Ts = { id: string; created_at: string; updated_at: string };

export interface Country extends Ts { name: string; iso2: string; is_active: boolean }
export interface Region extends Ts { country_id: string; name: string; is_active: boolean }
export interface City extends Ts { region_id: string; name: string; is_active: boolean }
export interface Neighborhood extends Ts { city_id: string; name: string; polygon: unknown | null; is_active: boolean }
export interface Category extends Ts { name: string; icon: string | null; description: string | null; is_active: boolean }
export interface Subcategory extends Ts {
  category_id: string; name: string; description: string | null;
  price_min: number | null; price_max: number | null; base_price_suggested: number | null; is_active: boolean;
}
export interface Profile { id: string; full_name: string | null; phone: string | null; role: UserRole; avatar_url: string | null; status: UserStatus; created_at: string; updated_at: string }
export interface ClientAddress extends Ts {
  user_id: string; alias: string | null; line1: string; line2: string | null;
  neighborhood: string | null; city: string | null; state: string | null; zip: string | null;
  geo: unknown | null; is_primary: boolean;
}
export interface TechnicianProfile extends Ts {
  user_id: string; bio: string | null; kyc_status: KycStatus;
  kyc_reviewed_by: string | null; kyc_reviewed_at: string | null;
  rating_avg: number; ratings_count: number; total_jobs: number;
  payout_clabe: string | null; is_available: boolean;
}
export interface TechnicianDocument extends Ts { technician_id: string; doc_type: string; file_url: string; status: DocStatus; reviewed_by: string | null; reviewed_at: string | null }
export interface TechnicianCategory extends Ts { technician_id: string; subcategory_id: string; base_price: number }
export interface TechnicianCoverageArea extends Ts { technician_id: string; region_id: string; neighborhood_id: string | null; center_geo: unknown | null; radius_km: number | null }
export interface TechnicianAvailability extends Ts { technician_id: string; weekday: number; start_time: string; end_time: string }
export interface TechnicianBlock extends Ts { technician_id: string; block_date: string; slot_start: string | null; slot_end: string | null }
export interface ServiceRequest extends Ts {
  client_id: string; technician_id: string | null; subcategory_id: string; region_id: string | null;
  status: RequestStatus; problem_description: string | null; photos: string[];
  address_snapshot: Record<string, unknown> | null; scheduled_at: string | null;
  base_price: number | null; total_price: number | null;
}
export interface ServiceExtra extends Ts { request_id: string; description: string; amount: number; photo_url: string | null; status: ExtraStatus; approved_at: string | null }
export interface ServiceStatusEvent { id: string; request_id: string; status: RequestStatus; actor_id: string | null; geo: unknown | null; note: string | null; created_at: string }
export interface Message { id: string; request_id: string; sender_id: string; content: string | null; attachments: string[]; is_flagged: boolean; created_at: string }
export interface Payment extends Ts {
  request_id: string; method: PaymentMethod; provider: string | null; provider_payment_id: string | null;
  status: PaymentStatus; gross_amount: number; platform_fee: number; technician_net: number; paid_at: string | null;
}
export interface Refund extends Ts { payment_id: string; amount: number; reason: string | null; status: RefundStatus; requested_by: string | null; approved_by: string | null }
export interface Rating { id: string; request_id: string; from_user_id: string; to_user_id: string; stars: number; comment: string | null; tags: string[]; created_at: string }
export interface TechnicianWallet extends Ts { technician_id: string; balance: number; currency: string }
export interface WalletTransaction { id: string; wallet_id: string; type: WalletTxnType; amount: number; reference: string | null; created_at: string }
export interface Payout extends Ts { technician_id: string; amount: number; status: PayoutStatus; processed_at: string | null; batch_id: string | null; clabe_snapshot: string | null }
export interface Dispute extends Ts { request_id: string | null; opened_by: string | null; type: string | null; status: DisputeStatus; assigned_admin: string | null; resolution: string | null }
export interface AuditLog { id: string; actor_id: string | null; action: string; target_table: string | null; target_id: string | null; payload: Record<string, unknown> | null; created_at: string }
export interface AppConfig { key: string; value: Record<string, unknown>; created_at: string; updated_at: string }

// Row is intersected with an index signature so each table satisfies
// @supabase/supabase-js's GenericTable (`Row: Record<string, unknown>`). The
// hand-authored Rows are interfaces, which otherwise aren't assignable to it and
// make table ops resolve to `never`. Real gen:types emits index-signature rows.
type Idx<Row> = Row & { [key: string]: unknown };
type Table<Row> = {
  Row: Idx<Row>;
  Insert: Partial<Idx<Row>>;
  Update: Partial<Idx<Row>>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      countries: Table<Country>;
      regions: Table<Region>;
      cities: Table<City>;
      neighborhoods: Table<Neighborhood>;
      categories: Table<Category>;
      subcategories: Table<Subcategory>;
      profiles: Table<Profile>;
      client_addresses: Table<ClientAddress>;
      technician_profiles: Table<TechnicianProfile>;
      technician_documents: Table<TechnicianDocument>;
      technician_categories: Table<TechnicianCategory>;
      technician_coverage_areas: Table<TechnicianCoverageArea>;
      technician_availability: Table<TechnicianAvailability>;
      technician_blocks: Table<TechnicianBlock>;
      service_requests: Table<ServiceRequest>;
      service_extras: Table<ServiceExtra>;
      service_status_events: Table<ServiceStatusEvent>;
      messages: Table<Message>;
      payments: Table<Payment>;
      refunds: Table<Refund>;
      ratings: Table<Rating>;
      technician_wallet: Table<TechnicianWallet>;
      wallet_transactions: Table<WalletTransaction>;
      payouts: Table<Payout>;
      disputes: Table<Dispute>;
      audit_logs: Table<AuditLog>;
      app_config: Table<AppConfig>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole; user_status: UserStatus; kyc_status: KycStatus; doc_status: DocStatus;
      request_status: RequestStatus; extra_status: ExtraStatus; payment_method: PaymentMethod;
      payment_status: PaymentStatus; refund_status: RefundStatus; wallet_txn_type: WalletTxnType;
      payout_status: PayoutStatus; dispute_status: DisputeStatus;
    };
    // Compat shim: @supabase/supabase-js >=2.108 requires CompositeTypes on the
    // schema, else table ops resolve to `never`. Real gen:types emits this key.
    CompositeTypes: Record<string, never>;
  };
}
