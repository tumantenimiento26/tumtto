export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      client_addresses: {
        Row: {
          address_line: string | null
          client_id: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          neighborhood: string | null
          place_name: string | null
          postal_code: string | null
          raw_mapbox_feature: Json | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          location: unknown
          mapbox_feature_id?: string | null
          municipality?: string | null
          neighborhood?: string | null
          place_name?: string | null
          postal_code?: string | null
          raw_mapbox_feature?: Json | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          location?: unknown
          mapbox_feature_id?: string | null
          municipality?: string | null
          neighborhood?: string | null
          place_name?: string | null
          postal_code?: string | null
          raw_mapbox_feature?: Json | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_addresses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          id: string
          opened_by: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          opened_by: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          service_order_id: string
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          opened_by?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          service_order_id?: string
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_sessions: {
        Row: {
          created_at: string
          didit_session_id: string
          id: string
          last_webhook_at: string | null
          raw_decision: Json | null
          session_token: string | null
          status: Database["public"]["Enums"]["didit_session_status"]
          technician_id: string
          updated_at: string
          vendor_data: string
          verification_url: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string
          didit_session_id: string
          id?: string
          last_webhook_at?: string | null
          raw_decision?: Json | null
          session_token?: string | null
          status?: Database["public"]["Enums"]["didit_session_status"]
          technician_id: string
          updated_at?: string
          vendor_data: string
          verification_url?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string
          didit_session_id?: string
          id?: string
          last_webhook_at?: string | null
          raw_decision?: Json | null
          session_token?: string | null
          status?: Database["public"]["Enums"]["didit_session_status"]
          technician_id?: string
          updated_at?: string
          vendor_data?: string
          verification_url?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_sessions_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_sessions_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          id: string
          metadata: Json
          payment_id: string | null
          service_order_id: string | null
          technician_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          id?: string
          metadata?: Json
          payment_id?: string | null
          service_order_id?: string | null
          technician_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          entry_type?: Database["public"]["Enums"]["ledger_entry_type"]
          id?: string
          metadata?: Json
          payment_id?: string | null
          service_order_id?: string | null
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          client_id: string
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          client_id: string
          commission_cents?: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          mp_status?: string | null
          paid_at?: string | null
          service_order_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_id?: string
          commission_cents?: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          method?: Database["public"]["Enums"]["payment_method"]
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          mp_status?: string | null
          paid_at?: string | null
          service_order_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          commission_bps: number | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          commission_bps?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          commission_bps?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_evidence: {
        Row: {
          created_at: string
          id: string
          is_final: boolean
          kind: Database["public"]["Enums"]["evidence_kind"]
          service_order_id: string
          storage_path: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_final?: boolean
          kind?: Database["public"]["Enums"]["evidence_kind"]
          service_order_id: string
          storage_path: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          is_final?: boolean
          kind?: Database["public"]["Enums"]["evidence_kind"]
          service_order_id?: string
          storage_path?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_evidence_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_evidence_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_status_events: {
        Row: {
          actor_id: string | null
          created_at: string
          from_status:
            | Database["public"]["Enums"]["service_order_status"]
            | null
          id: string
          note: string | null
          service_order_id: string
          to_status: Database["public"]["Enums"]["service_order_status"]
          updated_at: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["service_order_status"]
            | null
          id?: string
          note?: string | null
          service_order_id: string
          to_status: Database["public"]["Enums"]["service_order_status"]
          updated_at?: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["service_order_status"]
            | null
          id?: string
          note?: string | null
          service_order_id?: string
          to_status?: Database["public"]["Enums"]["service_order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_status_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_status_events_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          accepted_at: string | null
          address_line: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          category_id: string
          client_address_id: string | null
          client_id: string
          commission_bps: number | null
          commission_cents: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_disputed: boolean
          is_urgent: boolean
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          neighborhood: string | null
          paid_at: string | null
          place_name: string | null
          postal_code: string | null
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          updated_at: string
          urgent_surcharge_bps: number
        }
        Insert: {
          accepted_at?: string | null
          address_line?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          category_id: string
          client_address_id?: string | null
          client_id: string
          commission_bps?: number | null
          commission_cents?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_disputed?: boolean
          is_urgent?: boolean
          location: unknown
          mapbox_feature_id?: string | null
          municipality?: string | null
          neighborhood?: string | null
          paid_at?: string | null
          place_name?: string | null
          postal_code?: string | null
          quoted_subtotal_cents?: number | null
          quoted_total_cents?: number | null
          raw_mapbox_feature?: Json | null
          state?: string | null
          status?: Database["public"]["Enums"]["service_order_status"]
          technician_id?: string | null
          title?: string | null
          updated_at?: string
          urgent_surcharge_bps?: number
        }
        Update: {
          accepted_at?: string | null
          address_line?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          category_id?: string
          client_address_id?: string | null
          client_id?: string
          commission_bps?: number | null
          commission_cents?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_disputed?: boolean
          is_urgent?: boolean
          location?: unknown
          mapbox_feature_id?: string | null
          municipality?: string | null
          neighborhood?: string | null
          paid_at?: string | null
          place_name?: string | null
          postal_code?: string | null
          quoted_subtotal_cents?: number | null
          quoted_total_cents?: number | null
          raw_mapbox_feature?: Json | null
          state?: string | null
          status?: Database["public"]["Enums"]["service_order_status"]
          technician_id?: string | null
          title?: string | null
          updated_at?: string
          urgent_surcharge_bps?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_client_address_id_fkey"
            columns: ["client_address_id"]
            isOneToOne: false
            referencedRelation: "client_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quote_items: {
        Row: {
          created_at: string
          description: string
          id: string
          quantity: number
          quote_id: string
          total_cents: number
          unit_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          quantity?: number
          quote_id: string
          total_cents: number
          unit_cents: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quote_id?: string
          total_cents?: number
          unit_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "service_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      service_quotes: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          labor_cents: number
          materials_cents: number
          notes: string | null
          rejected_at: string | null
          service_order_id: string
          surcharge_cents: number
          technician_id: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          labor_cents?: number
          materials_cents?: number
          notes?: string | null
          rejected_at?: string | null
          service_order_id: string
          surcharge_cents?: number
          technician_id: string
          total_cents: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          labor_cents?: number
          materials_cents?: number
          notes?: string | null
          rejected_at?: string | null
          service_order_id?: string
          surcharge_cents?: number
          technician_id?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_quotes_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quotes_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quotes_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_categories: {
        Row: {
          category_id: string
          created_at: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_categories_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_categories_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_locations: {
        Row: {
          address_line: string | null
          created_at: string
          id: string
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          neighborhood: string | null
          place_name: string | null
          postal_code: string | null
          raw_mapbox_feature: Json | null
          recorded_at: string
          state: string | null
          technician_id: string
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          created_at?: string
          id?: string
          location: unknown
          mapbox_feature_id?: string | null
          municipality?: string | null
          neighborhood?: string | null
          place_name?: string | null
          postal_code?: string | null
          raw_mapbox_feature?: Json | null
          recorded_at?: string
          state?: string | null
          technician_id: string
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          created_at?: string
          id?: string
          location?: unknown
          mapbox_feature_id?: string | null
          municipality?: string | null
          neighborhood?: string | null
          place_name?: string | null
          postal_code?: string | null
          raw_mapbox_feature?: Json | null
          recorded_at?: string
          state?: string | null
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_locations_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_locations_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_rates: {
        Row: {
          category_id: string
          created_at: string
          currency: string
          hora_cents: number
          id: string
          minimo_cents: number
          technician_id: string
          updated_at: string
          visita_cents: number
        }
        Insert: {
          category_id: string
          created_at?: string
          currency?: string
          hora_cents: number
          id?: string
          minimo_cents: number
          technician_id: string
          updated_at?: string
          visita_cents: number
        }
        Update: {
          category_id?: string
          created_at?: string
          currency?: string
          hora_cents?: number
          id?: string
          minimo_cents?: number
          technician_id?: string
          updated_at?: string
          visita_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "technician_rates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_rates_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_rates_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          bank_name: string | null
          bio: string | null
          clabe: string | null
          created_at: string
          curp: string | null
          display_name: string | null
          home_address: string | null
          id: string
          is_available: boolean
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          rating_avg: number
          rating_count: number
          rfc: string | null
          updated_at: string
        }
        Insert: {
          bank_name?: string | null
          bio?: string | null
          clabe?: string | null
          created_at?: string
          curp?: string | null
          display_name?: string | null
          home_address?: string | null
          id: string
          is_available?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          rating_avg?: number
          rating_count?: number
          rfc?: string | null
          updated_at?: string
        }
        Update: {
          bank_name?: string | null
          bio?: string | null
          clabe?: string | null
          created_at?: string
          curp?: string | null
          display_name?: string | null
          home_address?: string | null
          id?: string
          is_available?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          rating_avg?: number
          rating_count?: number
          rfc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technicians_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      technician_public_profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          display_name: string | null
          id: string | null
          is_available: boolean | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          rating_avg: number | null
          rating_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      // Escritos a mano (tumtto-backend 20260927150000_audit_fixes) hasta
      // regenerar con `pnpm gen:types` tras el deploy.
      admin_reassign_order: {
        Args: { p_order_id: string; p_technician_id: string; p_note?: string }
        Returns: Database["public"]["Tables"]["service_orders"]["Row"]
      }
      admin_refund_order: {
        Args: { p_order_id: string; p_reason?: string; p_stripe_refund_id?: string }
        Returns: Database["public"]["Tables"]["payments"]["Row"]
      }
      admin_resolve_kyc: {
        Args: {
          p_technician_id: string
          p_status: Database["public"]["Enums"]["kyc_status"]
          p_note?: string
        }
        Returns: Database["public"]["Tables"]["technicians"]["Row"]
      }
      admin_set_user_status: {
        Args: {
          p_user_id: string
          p_status: Database["public"]["Enums"]["profile_status"]
        }
        Returns: Database["public"]["Tables"]["profiles"]["Row"]
      }
      accept_quote: {
        Args: { p_quote_id: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          category_id: string
          client_address_id: string | null
          client_id: string
          commission_bps: number | null
          commission_cents: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_disputed: boolean
          is_urgent: boolean
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          neighborhood: string | null
          paid_at: string | null
          place_name: string | null
          postal_code: string | null
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          updated_at: string
          urgent_surcharge_bps: number
        }
        SetofOptions: {
          from: "*"
          to: "service_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      accept_service_order: {
        Args: { p_order_id: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          category_id: string
          client_address_id: string | null
          client_id: string
          commission_bps: number | null
          commission_cents: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_disputed: boolean
          is_urgent: boolean
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          neighborhood: string | null
          paid_at: string | null
          place_name: string | null
          postal_code: string | null
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          updated_at: string
          urgent_surcharge_bps: number
        }
        SetofOptions: {
          from: "*"
          to: "service_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      close_service_order: {
        Args: { p_note?: string; p_order_id: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          category_id: string
          client_address_id: string | null
          client_id: string
          commission_bps: number | null
          commission_cents: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_disputed: boolean
          is_urgent: boolean
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          neighborhood: string | null
          paid_at: string | null
          place_name: string | null
          postal_code: string | null
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          updated_at: string
          urgent_surcharge_bps: number
        }
        SetofOptions: {
          from: "*"
          to: "service_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_service_request: {
        Args: {
          p_address_line?: string
          p_category_id: string
          p_client_address_id?: string
          p_description?: string
          p_is_urgent?: boolean
          p_lat: number
          p_lng: number
          p_mapbox_feature_id?: string
          p_municipality?: string
          p_neighborhood?: string
          p_place_name?: string
          p_postal_code?: string
          p_raw_mapbox_feature?: Json
          p_state?: string
          p_title?: string
        }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          category_id: string
          client_address_id: string | null
          client_id: string
          commission_bps: number | null
          commission_cents: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_disputed: boolean
          is_urgent: boolean
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          neighborhood: string | null
          paid_at: string | null
          place_name: string | null
          postal_code: string | null
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          updated_at: string
          urgent_surcharge_bps: number
        }
        SetofOptions: {
          from: "*"
          to: "service_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expire_stale_requests: { Args: never; Returns: number }
      find_nearby_technicians: {
        Args: {
          p_category_id?: string
          p_lat: number
          p_lng: number
          p_radius_m?: number
        }
        Returns: {
          display_name: string
          distance_m: number
          hora_cents: number
          minimo_cents: number
          rating_avg: number
          rating_count: number
          technician_id: string
          visita_cents: number
        }[]
      }
      open_dispute: {
        Args: { p_order_id: string; p_reason: string }
        Returns: {
          created_at: string
          id: string
          opened_by: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "disputes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_quote: {
        Args: {
          p_items?: Json
          p_labor_cents: number
          p_materials_cents?: number
          p_notes?: string
          p_order_id: string
        }
        Returns: {
          accepted_at: string | null
          created_at: string
          id: string
          labor_cents: number
          materials_cents: number
          notes: string | null
          rejected_at: string | null
          service_order_id: string
          surcharge_cents: number
          technician_id: string
          total_cents: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "service_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transition_service_order: {
        Args: {
          p_note?: string
          p_order_id: string
          p_to_status: Database["public"]["Enums"]["service_order_status"]
        }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          category_id: string
          client_address_id: string | null
          client_id: string
          commission_bps: number | null
          commission_cents: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_disputed: boolean
          is_urgent: boolean
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          neighborhood: string | null
          paid_at: string | null
          place_name: string | null
          postal_code: string | null
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          updated_at: string
          urgent_surcharge_bps: number
        }
        SetofOptions: {
          from: "*"
          to: "service_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      didit_session_status:
        | "not_started"
        | "in_progress"
        | "approved"
        | "declined"
        | "in_review"
        | "abandoned"
        | "resubmitted"
      dispute_status: "open" | "in_review" | "resolved" | "rejected"
      evidence_kind: "arrival" | "work" | "final" | "other"
      kyc_status:
        | "not_started"
        | "pending"
        | "in_review"
        | "approved"
        | "declined"
        | "abandoned"
        | "resubmitted"
      ledger_entry_type:
        | "commission_owed"
        | "commission_collected"
        | "payout"
        | "adjustment"
        | "refund"
      payment_method: "card" | "oxxo" | "wallet" | "cash"
      payment_status:
        | "pending"
        | "authorized"
        | "paid"
        | "failed"
        | "refunded"
        | "cancelled"
      profile_status: "active" | "suspended" | "deleted"
      service_order_status:
        | "requested"
        | "accepted"
        | "enroute"
        | "onsite"
        | "quote"
        | "working"
        | "closing"
        | "completed"
        | "paid"
        | "closed"
        | "expired"
        | "cancelled"
      user_role: "client" | "technician" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      didit_session_status: [
        "not_started",
        "in_progress",
        "approved",
        "declined",
        "in_review",
        "abandoned",
        "resubmitted",
      ],
      dispute_status: ["open", "in_review", "resolved", "rejected"],
      evidence_kind: ["arrival", "work", "final", "other"],
      kyc_status: [
        "not_started",
        "pending",
        "in_review",
        "approved",
        "declined",
        "abandoned",
        "resubmitted",
      ],
      ledger_entry_type: [
        "commission_owed",
        "commission_collected",
        "payout",
        "adjustment",
        "refund",
      ],
      payment_method: ["card", "oxxo", "wallet", "cash"],
      payment_status: [
        "pending",
        "authorized",
        "paid",
        "failed",
        "refunded",
        "cancelled",
      ],
      profile_status: ["active", "suspended", "deleted"],
      service_order_status: [
        "requested",
        "accepted",
        "enroute",
        "onsite",
        "quote",
        "working",
        "closing",
        "completed",
        "paid",
        "closed",
        "expired",
        "cancelled",
      ],
      user_role: ["client", "technician", "admin"],
    },
  },
} as const
