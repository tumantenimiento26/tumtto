export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          cancel_reason: string | null
          created_at: string
          execute_after: string
          id: string
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["deletion_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_reason?: string | null
          created_at?: string
          execute_after: string
          id?: string
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["deletion_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_reason?: string | null
          created_at?: string
          execute_after?: string
          id?: string
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["deletion_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_deletion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_events: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          payload: Json
          updated_at: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          payload?: Json
          updated_at?: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      client_documents: {
        Row: {
          bucket_id: string
          client_id: string
          created_at: string
          id: string
          issued_on: string
          kind: Database["public"]["Enums"]["client_document_kind"]
          review_notes: string | null
          review_status: Database["public"]["Enums"]["document_review_status"]
          reviewed_at: string | null
          reviewed_by: string | null
          storage_path: string
          updated_at: string
        }
        Insert: {
          bucket_id?: string
          client_id: string
          created_at?: string
          id?: string
          issued_on: string
          kind?: Database["public"]["Enums"]["client_document_kind"]
          review_notes?: string | null
          review_status?: Database["public"]["Enums"]["document_review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          client_id?: string
          created_at?: string
          id?: string
          issued_on?: string
          kind?: Database["public"]["Enums"]["client_document_kind"]
          review_notes?: string | null
          review_status?: Database["public"]["Enums"]["document_review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coverage_zones: {
        Row: {
          created_at: string
          geom: unknown
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          geom: unknown
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          geom?: unknown
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          expo_push_token: string | null
          id: string
          is_active: boolean
          last_seen_at: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expo_push_token?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expo_push_token?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
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
          outcome: string | null
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
          outcome?: string | null
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
          outcome?: string | null
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
      emergency_dispatch_log: {
        Row: {
          distance_m: number
          id: string
          notified_at: string
          order_id: string
          radius_m: number
          round: number
          technician_id: string
        }
        Insert: {
          distance_m: number
          id?: string
          notified_at?: string
          order_id: string
          radius_m: number
          round: number
          technician_id: string
        }
        Update: {
          distance_m?: number
          id?: string
          notified_at?: string
          order_id?: string
          radius_m?: number
          round?: number
          technician_id?: string
        }
        Relationships: []
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
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
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
          idempotency_key: string | null
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
          idempotency_key?: string | null
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
          idempotency_key?: string | null
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
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
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
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          service_order_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          service_order_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          service_order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          categories: Json
          created_at: string
          email_enabled: boolean
          push_enabled: boolean
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          categories?: Json
          created_at?: string
          email_enabled?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          categories?: Json
          created_at?: string
          email_enabled?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          kind: string
          read_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kind: string
          read_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          reviewee_id: string
          reviewer_id: string
          score: number
          service_order_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          reviewee_id: string
          reviewer_id: string
          score: number
          service_order_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          reviewee_id?: string
          reviewer_id?: string
          score?: number
          service_order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_ratings_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_ratings_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_ratings_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_reported_at: string | null
          cash_reported_by: string | null
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
          platform_fee_cents: number
          refunded_cents: number
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          cash_confirmed_at?: string | null
          cash_confirmed_by?: string | null
          cash_debt_recovered_cents?: number
          cash_reported_at?: string | null
          cash_reported_by?: string | null
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
          platform_fee_cents?: number
          refunded_cents?: number
          service_order_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_dispute_id?: string | null
          stripe_fee_cents?: number
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          cash_confirmed_at?: string | null
          cash_confirmed_by?: string | null
          cash_debt_recovered_cents?: number
          cash_reported_at?: string | null
          cash_reported_by?: string | null
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
          platform_fee_cents?: number
          refunded_cents?: number
          service_order_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_dispute_id?: string | null
          stripe_fee_cents?: number
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_cash_confirmed_by_fkey"
            columns: ["cash_confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_cash_reported_by_fkey"
            columns: ["cash_reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
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
      payout_batches: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          processed_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount_cents: number
          approved_at: string | null
          approved_by: string | null
          batch_id: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          idempotency_key: string
          status: Database["public"]["Enums"]["payout_status"]
          stripe_account_id: string | null
          stripe_payout_id: string | null
          technician_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          idempotency_key: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_account_id?: string | null
          stripe_payout_id?: string | null
          technician_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          idempotency_key?: string
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_account_id?: string | null
          stripe_payout_id?: string | null
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "payout_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
          },
          {
            foreignKeyName: "payout_requests_technician_id_fkey"
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
          stripe_customer_id: string | null
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
          stripe_customer_id?: string | null
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
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_outbox: {
        Row: {
          attempts: number
          created_at: string
          device_token_id: string | null
          id: string
          last_error: string | null
          notification_id: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          device_token_id?: string | null
          id?: string
          last_error?: string | null
          notification_id: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          device_token_id?: string | null
          id?: string
          last_error?: string | null
          notification_id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_outbox_device_token_id_fkey"
            columns: ["device_token_id"]
            isOneToOne: false
            referencedRelation: "device_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_outbox_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
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
          is_revert: boolean
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
          is_revert?: boolean
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
          is_revert?: boolean
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
          dispatch_deadline_at: string | null
          dispatch_last_round_at: string | null
          dispatch_radius_m: number | null
          dispatch_round: number | null
          dispatch_started_at: string | null
          dispatch_status: string | null
          emergency_surcharge_cents: number | null
          expires_at: string | null
          folio: number
          id: string
          is_disputed: boolean
          is_urgent: boolean
          location: unknown
          mapbox_feature_id: string | null
          municipality: string | null
          needs_manual_assignment: boolean
          neighborhood: string | null
          paid_at: string | null
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
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
          dispatch_deadline_at?: string | null
          dispatch_last_round_at?: string | null
          dispatch_radius_m?: number | null
          dispatch_round?: number | null
          dispatch_started_at?: string | null
          dispatch_status?: string | null
          emergency_surcharge_cents?: number | null
          expires_at?: string | null
          folio?: number
          id?: string
          is_disputed?: boolean
          is_urgent?: boolean
          location: unknown
          mapbox_feature_id?: string | null
          municipality?: string | null
          needs_manual_assignment?: boolean
          neighborhood?: string | null
          paid_at?: string | null
          place_name?: string | null
          postal_code?: string | null
          priority?: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents?: number | null
          quoted_total_cents?: number | null
          raw_mapbox_feature?: Json | null
          requested_technician_id?: string | null
          scheduled_for?: string | null
          scheduled_until?: string | null
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
          dispatch_deadline_at?: string | null
          dispatch_last_round_at?: string | null
          dispatch_radius_m?: number | null
          dispatch_round?: number | null
          dispatch_started_at?: string | null
          dispatch_status?: string | null
          emergency_surcharge_cents?: number | null
          expires_at?: string | null
          folio?: number
          id?: string
          is_disputed?: boolean
          is_urgent?: boolean
          location?: unknown
          mapbox_feature_id?: string | null
          municipality?: string | null
          needs_manual_assignment?: boolean
          neighborhood?: string | null
          paid_at?: string | null
          place_name?: string | null
          postal_code?: string | null
          priority?: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents?: number | null
          quoted_total_cents?: number | null
          raw_mapbox_feature?: Json | null
          requested_technician_id?: string | null
          scheduled_for?: string | null
          scheduled_until?: string | null
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
            foreignKeyName: "service_orders_requested_technician_id_fkey"
            columns: ["requested_technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_requested_technician_id_fkey"
            columns: ["requested_technician_id"]
            isOneToOne: false
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
          },
          {
            foreignKeyName: "service_orders_requested_technician_id_fkey"
            columns: ["requested_technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
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
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
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
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
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
      stripe_connected_accounts: {
        Row: {
          created_at: string
          details_submitted: boolean
          last_event_id: string | null
          metadata: Json
          onboarding_status: string
          payouts_enabled: boolean
          stripe_account_id: string
          technician_id: string
          transfers_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details_submitted?: boolean
          last_event_id?: string | null
          metadata?: Json
          onboarding_status?: string
          payouts_enabled?: boolean
          stripe_account_id: string
          technician_id: string
          transfers_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details_submitted?: boolean
          last_event_id?: string | null
          metadata?: Json
          onboarding_status?: string
          payouts_enabled?: boolean
          stripe_account_id?: string
          technician_id?: string
          transfers_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_connected_accounts_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_connected_accounts_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
          },
          {
            foreignKeyName: "stripe_connected_accounts_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string
          error: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          stripe_account_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type: string
          id: string
          payload?: Json
          processed_at?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_admin_id: string | null
          client_id: string | null
          created_at: string
          id: string
          opened_by: string
          service_order_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_admin_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          opened_by: string
          service_order_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_admin_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          opened_by?: string
          service_order_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
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
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
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
      technician_companies: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          rfc: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          rfc?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rfc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      technician_documents: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          issued_on: string | null
          kind: Database["public"]["Enums"]["technician_document_kind"]
          review_notes: string | null
          review_status: Database["public"]["Enums"]["document_review_status"]
          reviewed_at: string | null
          reviewed_by: string | null
          storage_path: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          issued_on?: string | null
          kind: Database["public"]["Enums"]["technician_document_kind"]
          review_notes?: string | null
          review_status?: Database["public"]["Enums"]["document_review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          issued_on?: string | null
          kind?: Database["public"]["Enums"]["technician_document_kind"]
          review_notes?: string | null
          review_status?: Database["public"]["Enums"]["document_review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_documents_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
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
      technician_order_locations: {
        Row: {
          accuracy_m: number | null
          created_at: string
          heading: number | null
          id: string
          location: unknown
          recorded_at: string
          service_order_id: string
          speed_mps: number | null
          technician_id: string
          updated_at: string
        }
        Insert: {
          accuracy_m?: number | null
          created_at?: string
          heading?: number | null
          id?: string
          location: unknown
          recorded_at?: string
          service_order_id: string
          speed_mps?: number | null
          technician_id: string
          updated_at?: string
        }
        Update: {
          accuracy_m?: number | null
          created_at?: string
          heading?: number | null
          id?: string
          location?: unknown
          recorded_at?: string
          service_order_id?: string
          speed_mps?: number | null
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_order_locations_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_order_locations_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_order_locations_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
          },
          {
            foreignKeyName: "technician_order_locations_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_vehicles: {
        Row: {
          color: string
          created_at: string
          id: string
          is_primary: boolean
          make: string
          model: string
          plate: string
          technician_id: string
          updated_at: string
          year: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_primary?: boolean
          make: string
          model: string
          plate: string
          technician_id: string
          updated_at?: string
          year: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          make?: string
          model?: string
          plate?: string
          technician_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "technician_vehicles_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_catalog: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_catalog_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_tools: {
        Row: {
          catalog_id: string | null
          created_at: string
          custom_category_id: string | null
          custom_name: string | null
          id: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          catalog_id?: string | null
          created_at?: string
          custom_category_id?: string | null
          custom_name?: string | null
          id?: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          catalog_id?: string | null
          created_at?: string
          custom_category_id?: string | null
          custom_name?: string | null
          id?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_tools_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "tool_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_tools_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
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
      technician_schedules: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          starts_at: string
          technician_id: string
          timezone: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          starts_at: string
          technician_id: string
          timezone?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          starts_at?: string
          technician_id?: string
          timezone?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "technician_schedules_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_schedules_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
          },
          {
            foreignKeyName: "technician_schedules_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          accepts_cash: boolean
          bank_name: string | null
          bio: string | null
          clabe: string | null
          company_id: string | null
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
          service_radius_m: number | null
          technician_type: Database["public"]["Enums"]["technician_type"]
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          accepts_cash?: boolean
          bank_name?: string | null
          bio?: string | null
          clabe?: string | null
          company_id?: string | null
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
          service_radius_m?: number | null
          technician_type?: Database["public"]["Enums"]["technician_type"]
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          accepts_cash?: boolean
          bank_name?: string | null
          bio?: string | null
          clabe?: string | null
          company_id?: string | null
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
          service_radius_m?: number | null
          technician_type?: Database["public"]["Enums"]["technician_type"]
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "technician_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "coverage_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      technician_public_profiles: {
        Row: {
          accepts_card: boolean | null
          accepts_cash: boolean | null
          avatar_path: string | null
          bio: string | null
          display_name: string | null
          id: string | null
          is_available: boolean | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          rating_avg: number | null
          rating_count: number | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "coverage_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_public_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          reviewee_id: string | null
          score: number | null
          service_order_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_ratings_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_ratings_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_wallet_summaries: {
        Row: {
          available_cents: number | null
          balance_cents: number | null
          held_cents: number | null
          paid_out_cents: number | null
          technician_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_emergency_history: {
        Args: { p_order_id: string }
        Returns: Json
      }
      create_emergency_request: {
        Args: {
          p_address_line?: string
          p_category_id: string
          p_client_address_id?: string
          p_client_id?: string
          p_description?: string
          p_lat: number
          p_lng: number
          p_mapbox_feature_id?: string
          p_municipality?: string
          p_neighborhood?: string
          p_place_name?: string
          p_postal_code?: string
          p_raw_mapbox_feature?: Json
          p_state?: string
        }
        Returns: Database["public"]["Tables"]["service_orders"]["Row"]
      }
      get_emergency_terms: {
        Args: { p_category_id: string }
        Returns: Json
      }
      admin_find_technicians_by_plate: {
        Args: { p_query: string }
        Returns: {
          full_name: string
          make: string
          model: string
          plate: string
          technician_id: string
          year: number
        }[]
      }
      admin_custom_tools: {
        Args: Record<PropertyKey, never>
        Returns: {
          category_ids: string[]
          first_seen: string
          name: string
          technicians_count: number
        }[]
      }
      admin_promote_custom_tool: {
        Args: { p_category_id?: string; p_custom_name: string; p_name: string }
        Returns: Database["public"]["Tables"]["tool_catalog"]["Row"]
      }
      admin_set_technician_type: {
        Args: {
          p_company_id?: string
          p_note?: string
          p_technician_id: string
          p_type: Database["public"]["Enums"]["technician_type"]
        }
        Returns: Database["public"]["Tables"]["technicians"]["Row"]
      }
      revert_service_order_status: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: Database["public"]["Tables"]["service_orders"]["Row"]
      }
      client_address_verified: {
        Args: { p_client_id: string }
        Returns: boolean
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
          folio: number
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
          requested_technician_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
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
          folio: number
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
          requested_technician_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
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
      add_admin_note: {
        Args: { p_entity_id: string; p_entity_type: string; p_note: string }
        Returns: {
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          payload: Json
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "admin_events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_list_admin_roles: {
        Args: never
        Returns: {
          admin_role: string
          email: string
          user_id: string
        }[]
      }
      admin_list_coverage_zones: {
        Args: never
        Returns: {
          geojson: Json
          id: string
          is_active: boolean
          name: string
          slug: string
          technician_count: number
        }[]
      }
      admin_reassign_order: {
        Args: { p_note?: string; p_order_id: string; p_technician_id: string }
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
          folio: number
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
          requested_technician_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
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
      admin_refund_order: {
        Args: {
          p_amount_cents?: number
          p_order_id: string
          p_reason?: string
          p_stripe_refund_id?: string
        }
        Returns: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_reported_at: string | null
          cash_reported_by: string | null
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
          platform_fee_cents: number
          refunded_cents: number
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          technician_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_report_cold_zones: {
        Args: { p_from: string; p_to: string }
        Returns: {
          order_count: number
          zone_id: string
          zone_name: string
        }[]
      }
      admin_report_demand_heatmap: {
        Args: { p_from: string; p_to: string }
        Returns: {
          dow: number
          hour: number
          order_count: number
        }[]
      }
      admin_report_kpis: {
        Args: { p_from: string; p_to: string }
        Returns: Json
      }
      admin_report_ticket_by_category: {
        Args: { p_from: string; p_to: string }
        Returns: {
          avg_ticket_cents: number
          category_id: string
          category_name: string
          paid_orders: number
        }[]
      }
      admin_resolve_dispute: {
        Args: { p_dispute_id: string; p_notes?: string; p_outcome: string }
        Returns: {
          created_at: string
          id: string
          opened_by: string
          outcome: string | null
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
      admin_resolve_kyc: {
        Args: {
          p_note?: string
          p_status: Database["public"]["Enums"]["kyc_status"]
          p_technician_id: string
        }
        Returns: {
          accepts_cash: boolean
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
          service_radius_m: number | null
          updated_at: string
          zone_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "technicians"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_user_status: {
        Args: {
          p_status: Database["public"]["Enums"]["profile_status"]
          p_user_id: string
        }
        Returns: {
          avatar_path: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["profile_status"]
          stripe_customer_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      anonymize_user_account: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      apply_stripe_account_payout: {
        Args: {
          p_amount_cents: number
          p_failure_reason?: string
          p_paid: boolean
          p_stripe_account_id: string
          p_stripe_payout_id: string
        }
        Returns: undefined
      }
      apply_stripe_dispute_closed: {
        Args: {
          p_lost: boolean
          p_payment_id: string
          p_stripe_dispute_id: string
        }
        Returns: undefined
      }
      apply_stripe_dispute_created: {
        Args: { p_payment_id: string; p_stripe_dispute_id: string }
        Returns: undefined
      }
      apply_stripe_payment_failed: {
        Args: { p_payment_id: string; p_stripe_payment_intent_id?: string }
        Returns: undefined
      }
      apply_stripe_payment_succeeded: {
        Args: {
          p_payment_id: string
          p_stripe_charge_id: string
          p_stripe_fee_cents?: number
          p_stripe_payment_intent_id: string
          p_stripe_transfer_id: string
        }
        Returns: undefined
      }
      apply_stripe_payout_result: {
        Args: {
          p_failure_reason?: string
          p_paid: boolean
          p_request_id: string
          p_stripe_payout_id: string
        }
        Returns: undefined
      }
      apply_stripe_refund: {
        Args: {
          p_amount_refunded_cents?: number
          p_payment_id: string
          p_stripe_refund_id: string
        }
        Returns: undefined
      }
      approve_payout_requests: {
        Args: { p_note?: string; p_request_ids: string[] }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          processed_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payout_batches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_technician_zone: {
        Args: { p_technician_id: string; p_zone_id: string }
        Returns: {
          accepts_cash: boolean
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
          service_radius_m: number | null
          updated_at: string
          zone_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "technicians"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      attach_stripe_checkout_session: {
        Args: { p_checkout_session_id: string; p_payment_id: string }
        Returns: undefined
      }
      cancel_account_deletion: {
        Args: never
        Returns: {
          cancel_reason: string | null
          created_at: string
          execute_after: string
          id: string
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["deletion_request_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "account_deletion_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_payout_request: {
        Args: { p_request_id: string }
        Returns: {
          amount_cents: number
          approved_at: string | null
          approved_by: string | null
          batch_id: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          idempotency_key: string
          status: Database["public"]["Enums"]["payout_status"]
          stripe_account_id: string | null
          stripe_payout_id: string | null
          technician_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payout_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_push_outbox: {
        Args: { p_limit?: number }
        Returns: {
          attempts: number
          created_at: string
          device_token_id: string | null
          id: string
          last_error: string | null
          notification_id: string
          sent_at: string | null
          status: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "push_outbox"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_stripe_event: {
        Args: {
          p_event_id: string
          p_event_type: string
          p_payload?: Json
          p_stripe_account_id?: string
        }
        Returns: boolean
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
          folio: number
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
          requested_technician_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
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
      complete_push_outbox: {
        Args: { p_error?: string; p_id: string; p_ok: boolean }
        Returns: undefined
      }
      confirm_cash_payment: {
        Args: { p_order_id: string }
        Returns: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_reported_at: string | null
          cash_reported_by: string | null
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
          platform_fee_cents: number
          refunded_cents: number
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          technician_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_service_request: {
        Args: {
          p_address_line?: string
          p_category_id: string
          p_client_address_id?: string
          p_client_id?: string
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
          p_scheduled_for?: string
          p_scheduled_until?: string
          p_state?: string
          p_technician_id?: string
          p_title?: string
        }
        Returns: Database["public"]["Tables"]["service_orders"]["Row"]
        SetofOptions: {
          from: "*"
          to: "service_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_device_token: { Args: { p_token: string }; Returns: undefined }
      expire_stale_requests: { Args: never; Returns: number }
      find_nearby_technicians: {
        Args: {
          p_accepts_cash?: boolean
          p_category_id?: string
          p_lat: number
          p_lng: number
          p_radius_m?: number
          p_scheduled_for?: string
          p_zone_id?: string
        }
        Returns: {
          accepts_cash: boolean
          display_name: string
          distance_m: number
          hora_cents: number
          minimo_cents: number
          rating_avg: number
          rating_count: number
          technician_id: string
          visita_cents: number
          zone_id: string
        }[]
      }
      get_technician_wallet: {
        Args: { p_technician_id?: string }
        Returns: {
          available_cents: number | null
          balance_cents: number | null
          held_cents: number | null
          paid_out_cents: number | null
          technician_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "technician_wallet_summaries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      list_due_account_deletions: {
        Args: never
        Returns: {
          cancel_reason: string | null
          created_at: string
          execute_after: string
          id: string
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["deletion_request_status"]
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "account_deletion_requests"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      mark_messages_read: { Args: { p_order_id: string }; Returns: number }
      mark_notifications_read: {
        Args: { p_notification_ids?: string[] }
        Returns: number
      }
      mark_payout_processing: {
        Args: { p_request_id: string; p_stripe_payout_id: string }
        Returns: {
          amount_cents: number
          approved_at: string | null
          approved_by: string | null
          batch_id: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          idempotency_key: string
          status: Database["public"]["Enums"]["payout_status"]
          stripe_account_id: string | null
          stripe_payout_id: string | null
          technician_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payout_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_stripe_event_processed: {
        Args: { p_error?: string; p_event_id: string }
        Returns: undefined
      }
      open_dispute: {
        Args: { p_order_id: string; p_reason: string }
        Returns: {
          created_at: string
          id: string
          opened_by: string
          outcome: string | null
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
      prepare_stripe_checkout: { Args: { p_order_id: string }; Returns: Json }
      register_device_token: {
        Args: {
          p_expo_push_token?: string
          p_platform: string
          p_token: string
        }
        Returns: {
          created_at: string
          expo_push_token: string | null
          id: string
          is_active: boolean
          last_seen_at: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "device_tokens"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      release_service_order: {
        Args: { p_order_id: string; p_reason?: string }
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
          folio: number
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
          requested_technician_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
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
      report_cash_collected: {
        Args: { p_order_id: string }
        Returns: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_reported_at: string | null
          cash_reported_by: string | null
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
          platform_fee_cents: number
          refunded_cents: number
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          technician_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      report_order_location: {
        Args: {
          p_accuracy_m?: number
          p_heading?: number
          p_lat: number
          p_lng: number
          p_order_id: string
          p_speed_mps?: number
        }
        Returns: {
          accuracy_m: number | null
          created_at: string
          heading: number | null
          id: string
          location: unknown
          recorded_at: string
          service_order_id: string
          speed_mps: number | null
          technician_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "technician_order_locations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      request_account_deletion: {
        Args: never
        Returns: {
          cancel_reason: string | null
          created_at: string
          execute_after: string
          id: string
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["deletion_request_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "account_deletion_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      request_payout: {
        Args: { p_amount_cents: number }
        Returns: {
          amount_cents: number
          approved_at: string | null
          approved_by: string | null
          batch_id: string | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          idempotency_key: string
          status: Database["public"]["Enums"]["payout_status"]
          stripe_account_id: string | null
          stripe_payout_id: string | null
          technician_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payout_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_technician_categories: {
        Args: { p_items: Json; p_technician_id: string }
        Returns: {
          category_id: string
          created_at: string
          currency: string
          hora_cents: number
          id: string
          minimo_cents: number
          technician_id: string
          updated_at: string
          visita_cents: number
        }[]
        SetofOptions: {
          from: "*"
          to: "technician_rates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_technician_coverage: {
        Args: {
          p_lat: number
          p_lng: number
          p_place_name?: string
          p_radius_m: number
        }
        Returns: Json
      }
      set_technician_schedule: {
        Args: { p_slots: Json; p_technician_id?: string }
        Returns: {
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          starts_at: string
          technician_id: string
          timezone: string
          updated_at: string
          weekday: number
        }[]
        SetofOptions: {
          from: "*"
          to: "technician_schedules"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      submit_order_rating: {
        Args: { p_comment?: string; p_order_id: string; p_score: number }
        Returns: {
          comment: string | null
          created_at: string
          id: string
          reviewee_id: string
          reviewer_id: string
          score: number
          service_order_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "order_ratings"
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
          folio: number
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
          requested_technician_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
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
      upsert_coverage_zone: {
        Args: {
          p_geojson: Json
          p_id?: string
          p_is_active?: boolean
          p_name: string
          p_slug: string
        }
        Returns: {
          created_at: string
          geom: unknown
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "coverage_zones"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_notification_preferences: {
        Args: {
          p_categories?: Json
          p_email_enabled?: boolean
          p_push_enabled?: boolean
          p_sms_enabled?: boolean
        }
        Returns: {
          categories: Json
          created_at: string
          email_enabled: boolean
          push_enabled: boolean
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "notification_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_platform_setting: {
        Args: { p_description?: string; p_key: string; p_value: Json }
        Returns: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        SetofOptions: {
          from: "*"
          to: "platform_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_stripe_connected_account: {
        Args: {
          p_details_submitted: boolean
          p_last_event_id?: string
          p_metadata?: Json
          p_onboarding_status: string
          p_payouts_enabled: boolean
          p_stripe_account_id: string
          p_technician_id: string
          p_transfers_status: string
        }
        Returns: {
          created_at: string
          details_submitted: boolean
          last_event_id: string | null
          metadata: Json
          onboarding_status: string
          payouts_enabled: boolean
          stripe_account_id: string
          technician_id: string
          transfers_status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "stripe_connected_accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      zone_for_point: {
        Args: { p_lat: number; p_lng: number }
        Returns: {
          created_at: string
          geom: unknown
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "coverage_zones"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      client_document_kind: "proof_of_address"
      deletion_request_status:
        | "pending"
        | "cancelled"
        | "processing"
        | "completed"
      didit_session_status:
        | "not_started"
        | "in_progress"
        | "approved"
        | "declined"
        | "in_review"
        | "abandoned"
        | "resubmitted"
      dispute_status: "open" | "in_review" | "resolved" | "rejected"
      document_review_status: "pending" | "approved" | "rejected"
      evidence_kind: "arrival" | "work" | "final" | "other" | "request"
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
        | "service_revenue"
        | "platform_commission"
        | "stripe_fee"
        | "transfer_reversal"
        | "dispute_hold"
        | "dispute_release"
      payment_method: "card" | "oxxo" | "wallet" | "cash"
      payment_status:
        | "pending"
        | "authorized"
        | "paid"
        | "failed"
        | "refunded"
        | "cancelled"
      payout_status:
        | "pending"
        | "approved"
        | "processing"
        | "paid"
        | "failed"
        | "cancelled"
        | "held"
      profile_status: "active" | "suspended" | "deleted"
      service_priority: "normal" | "emergency"
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
      technician_type: "tumtto" | "third_party" | "independent"
      technician_document_kind:
        | "criminal_record"
        | "proof_of_address"
        | "bank_statement"
      ticket_status: "open" | "pending" | "in_progress" | "resolved" | "closed"
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
      client_document_kind: ["proof_of_address"],
      deletion_request_status: [
        "pending",
        "cancelled",
        "processing",
        "completed",
      ],
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
      document_review_status: ["pending", "approved", "rejected"],
      evidence_kind: ["arrival", "work", "final", "other", "request"],
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
        "service_revenue",
        "platform_commission",
        "stripe_fee",
        "transfer_reversal",
        "dispute_hold",
        "dispute_release",
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
      payout_status: [
        "pending",
        "approved",
        "processing",
        "paid",
        "failed",
        "cancelled",
        "held",
      ],
      profile_status: ["active", "suspended", "deleted"],
      service_priority: ["normal", "emergency"],
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
      technician_type: ["tumtto", "third_party", "independent"],
      technician_document_kind: [
        "criminal_record",
        "proof_of_address",
        "bank_statement",
      ],
      ticket_status: ["open", "pending", "in_progress", "resolved", "closed"],
      user_role: ["client", "technician", "admin"],
    },
  },
} as const

