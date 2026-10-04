export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
      company_tool_assignments: {
        Row: {
          assign_note: string | null
          assigned_at: string
          assigned_by: string | null
          assigned_condition: Database["public"]["Enums"]["inventory_condition"]
          created_at: string
          id: string
          return_note: string | null
          returned_at: string | null
          returned_by: string | null
          returned_condition:
            | Database["public"]["Enums"]["inventory_condition"]
            | null
          technician_id: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          assign_note?: string | null
          assigned_at?: string
          assigned_by?: string | null
          assigned_condition: Database["public"]["Enums"]["inventory_condition"]
          created_at?: string
          id?: string
          return_note?: string | null
          returned_at?: string | null
          returned_by?: string | null
          returned_condition?:
            | Database["public"]["Enums"]["inventory_condition"]
            | null
          technician_id: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          assign_note?: string | null
          assigned_at?: string
          assigned_by?: string | null
          assigned_condition?: Database["public"]["Enums"]["inventory_condition"]
          created_at?: string
          id?: string
          return_note?: string | null
          returned_at?: string | null
          returned_by?: string | null
          returned_condition?:
            | Database["public"]["Enums"]["inventory_condition"]
            | null
          technician_id?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_tool_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tool_assignments_returned_by_fkey"
            columns: ["returned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tool_assignments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tool_assignments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "company_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      company_tools: {
        Row: {
          acquired_on: string | null
          acquisition_cost_cents: number | null
          brand: string | null
          catalog_id: string | null
          category_id: string | null
          created_at: string
          id: string
          model: string | null
          name: string
          photo_path: string | null
          retired_at: string | null
          retired_by: string | null
          retired_note: string | null
          retired_reason:
            | Database["public"]["Enums"]["inventory_retire_reason"]
            | null
          serial_or_code: string
          status: Database["public"]["Enums"]["inventory_status"]
          updated_at: string
        }
        Insert: {
          acquired_on?: string | null
          acquisition_cost_cents?: number | null
          brand?: string | null
          catalog_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          model?: string | null
          name: string
          photo_path?: string | null
          retired_at?: string | null
          retired_by?: string | null
          retired_note?: string | null
          retired_reason?:
            | Database["public"]["Enums"]["inventory_retire_reason"]
            | null
          serial_or_code: string
          status?: Database["public"]["Enums"]["inventory_status"]
          updated_at?: string
        }
        Update: {
          acquired_on?: string | null
          acquisition_cost_cents?: number | null
          brand?: string | null
          catalog_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          model?: string | null
          name?: string
          photo_path?: string | null
          retired_at?: string | null
          retired_by?: string | null
          retired_note?: string | null
          retired_reason?:
            | Database["public"]["Enums"]["inventory_retire_reason"]
            | null
          serial_or_code?: string
          status?: Database["public"]["Enums"]["inventory_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_tools_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "tool_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tools_retired_by_fkey"
            columns: ["retired_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_note: string | null
          consent_at: string
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at: string
          email: string
          email_status: string | null
          handled_at: string | null
          handled_by: string | null
          id: string
          ip_hash: string | null
          message: string
          name: string
          phone: string
          source: string | null
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          admin_note?: string | null
          consent_at: string
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          email: string
          email_status?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          phone: string
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          admin_note?: string | null
          consent_at?: string
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          email?: string
          email_status?: string | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          phone?: string
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_handled_by_fkey"
            columns: ["handled_by"]
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
          created_at: string
          distance_m: number | null
          id: string
          notified_at: string
          order_id: string
          radius_m: number
          round: number
          technician_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          distance_m?: number | null
          id?: string
          notified_at?: string
          order_id: string
          radius_m: number
          round: number
          technician_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          distance_m?: number | null
          id?: string
          notified_at?: string
          order_id?: string
          radius_m?: number
          round?: number
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_dispatch_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_dispatch_log_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_dispatch_log_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technician_wallet_summaries"
            referencedColumns: ["technician_id"]
          },
          {
            foreignKeyName: "emergency_dispatch_log_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string
          date: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          name?: string
          updated_at?: string
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
          data: Json | null
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
          data?: Json | null
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
          data?: Json | null
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
          hidden_at: string | null
          hidden_by: string | null
          hidden_note: string | null
          hidden_reason:
            | Database["public"]["Enums"]["rating_moderation_reason"]
            | null
          id: string
          is_hidden: boolean
          reviewee_id: string
          reviewer_id: string
          score: number
          service_order_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_note?: string | null
          hidden_reason?:
            | Database["public"]["Enums"]["rating_moderation_reason"]
            | null
          id?: string
          is_hidden?: boolean
          reviewee_id: string
          reviewer_id: string
          score: number
          service_order_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_note?: string | null
          hidden_reason?:
            | Database["public"]["Enums"]["rating_moderation_reason"]
            | null
          id?: string
          is_hidden?: boolean
          reviewee_id?: string
          reviewer_id?: string
          score?: number
          service_order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_ratings_hidden_by_fkey"
            columns: ["hidden_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          cash_received_cents: number | null
          cash_reported_at: string | null
          cash_reported_by: string | null
          cash_status: string | null
          client_cash_responded_at: string | null
          client_cash_response: string | null
          client_dispute_reason: string | null
          client_id: string
          client_reported_cents: number | null
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          kind: string
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          platform_fee_cents: number
          refund_attempts: number
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_cents: number
          review_notes: string | null
          review_opened_at: string | null
          review_outcome: string | null
          review_reason: string | null
          review_resolved_at: string | null
          review_resolved_by: string | null
          review_status: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          tech_credit_cents: number
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          cash_confirmed_at?: string | null
          cash_confirmed_by?: string | null
          cash_debt_recovered_cents?: number
          cash_received_cents?: number | null
          cash_reported_at?: string | null
          cash_reported_by?: string | null
          cash_status?: string | null
          client_cash_responded_at?: string | null
          client_cash_response?: string | null
          client_dispute_reason?: string | null
          client_id: string
          client_reported_cents?: number | null
          commission_cents?: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          kind?: string
          metadata?: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          mp_status?: string | null
          paid_at?: string | null
          platform_fee_cents?: number
          refund_attempts?: number
          refund_reason?: string | null
          refund_requested_at?: string | null
          refunded_cents?: number
          review_notes?: string | null
          review_opened_at?: string | null
          review_outcome?: string | null
          review_reason?: string | null
          review_resolved_at?: string | null
          review_resolved_by?: string | null
          review_status?: string | null
          service_order_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_dispute_id?: string | null
          stripe_fee_cents?: number
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          tech_credit_cents?: number
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          cash_confirmed_at?: string | null
          cash_confirmed_by?: string | null
          cash_debt_recovered_cents?: number
          cash_received_cents?: number | null
          cash_reported_at?: string | null
          cash_reported_by?: string | null
          cash_status?: string | null
          client_cash_responded_at?: string | null
          client_cash_response?: string | null
          client_dispute_reason?: string | null
          client_id?: string
          client_reported_cents?: number | null
          commission_cents?: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          kind?: string
          metadata?: Json
          method?: Database["public"]["Enums"]["payment_method"]
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          mp_status?: string | null
          paid_at?: string | null
          platform_fee_cents?: number
          refund_attempts?: number
          refund_reason?: string | null
          refund_requested_at?: string | null
          refunded_cents?: number
          review_notes?: string | null
          review_opened_at?: string | null
          review_outcome?: string | null
          review_reason?: string | null
          review_resolved_at?: string | null
          review_resolved_by?: string | null
          review_status?: string | null
          service_order_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_dispute_id?: string | null
          stripe_fee_cents?: number
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          tech_credit_cents?: number
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
            foreignKeyName: "payments_review_resolved_by_fkey"
            columns: ["review_resolved_by"]
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
          platform_topup_cents: number
          platform_transfer_id: string | null
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
          platform_topup_cents?: number
          platform_transfer_id?: string | null
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
          platform_topup_cents?: number
          platform_transfer_id?: string | null
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
          avatar_icon: string
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
          avatar_icon: string
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
          avatar_icon?: string
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
      schedule_surcharge_rules: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          is_active: boolean
          kind: string
          name: string
          sort_order: number
          start_time: string | null
          surcharge_type: string
          updated_at: string
          value: number
          weekdays: number[] | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          kind: string
          name: string
          sort_order?: number
          start_time?: string | null
          surcharge_type: string
          updated_at?: string
          value: number
          weekdays?: number[] | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          sort_order?: number
          start_time?: string | null
          surcharge_type?: string
          updated_at?: string
          value?: number
          weekdays?: number[] | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          base_visit_fee_cents: number | null
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
          base_visit_fee_cents?: number | null
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
          base_visit_fee_cents?: number | null
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
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
          updated_at: string
          urgent_surcharge_bps: number
        }
        Insert: {
          accepted_at?: string | null
          address_line?: string | null
          assignment_mode?: string
          base_fee_cents?: number
          base_fee_credited_at?: string | null
          base_fee_paid_at?: string | null
          base_fee_refunded_at?: string | null
          base_fee_status?: string
          base_surcharge_cents?: number
          base_total_cents?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cash_review_open?: boolean
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
          payment_model?: string
          place_name?: string | null
          postal_code?: string | null
          priority?: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents?: number | null
          quoted_total_cents?: number | null
          raw_mapbox_feature?: Json | null
          requested_technician_id?: string | null
          schedule_surcharge_bps?: number
          schedule_surcharge_cents?: number | null
          schedule_surcharge_name?: string | null
          schedule_surcharge_rule_id?: string | null
          scheduled_for?: string | null
          scheduled_until?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["service_order_status"]
          technician_id?: string | null
          title?: string | null
          unassigned_alerted_at?: string | null
          updated_at?: string
          urgent_surcharge_bps?: number
        }
        Update: {
          accepted_at?: string | null
          address_line?: string | null
          assignment_mode?: string
          base_fee_cents?: number
          base_fee_credited_at?: string | null
          base_fee_paid_at?: string | null
          base_fee_refunded_at?: string | null
          base_fee_status?: string
          base_surcharge_cents?: number
          base_total_cents?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cash_review_open?: boolean
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
          payment_model?: string
          place_name?: string | null
          postal_code?: string | null
          priority?: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents?: number | null
          quoted_total_cents?: number | null
          raw_mapbox_feature?: Json | null
          requested_technician_id?: string | null
          schedule_surcharge_bps?: number
          schedule_surcharge_cents?: number | null
          schedule_surcharge_name?: string | null
          schedule_surcharge_rule_id?: string | null
          scheduled_for?: string | null
          scheduled_until?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["service_order_status"]
          technician_id?: string | null
          title?: string | null
          unassigned_alerted_at?: string | null
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
            foreignKeyName: "service_orders_schedule_surcharge_rule_id_fkey"
            columns: ["schedule_surcharge_rule_id"]
            isOneToOne: false
            referencedRelation: "schedule_surcharge_rules"
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
      service_quote_attachments: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string
          quote_id: string
          service_order_id: string
          size_bytes: number
          storage_path: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          quote_id: string
          service_order_id: string
          size_bytes: number
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          quote_id?: string
          service_order_id?: string
          size_bytes?: number
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_quote_attachments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "service_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quote_attachments_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quote_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          reject_reason: string | null
          rejected_at: string | null
          service_order_id: string
          submitted_at: string | null
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
          reject_reason?: string | null
          rejected_at?: string | null
          service_order_id: string
          submitted_at?: string | null
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
          reject_reason?: string | null
          rejected_at?: string | null
          service_order_id?: string
          submitted_at?: string | null
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
            foreignKeyName: "technician_tools_custom_category_id_fkey"
            columns: ["custom_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
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
    }
    Views: {
      technician_public_profiles: {
        Row: {
          accepts_card: boolean | null
          accepts_cash: boolean | null
          avatar_icon: string | null
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
          reviewer_avatar_icon: string | null
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
      accept_quote: {
        Args: { p_quote_id: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      admin_assign_company_tool: {
        Args: {
          p_assigned_at?: string
          p_condition?: Database["public"]["Enums"]["inventory_condition"]
          p_note?: string
          p_technician_id: string
          p_tool_id: string
        }
        Returns: {
          assign_note: string | null
          assigned_at: string
          assigned_by: string | null
          assigned_condition: Database["public"]["Enums"]["inventory_condition"]
          created_at: string
          id: string
          return_note: string | null
          returned_at: string | null
          returned_by: string | null
          returned_condition:
            | Database["public"]["Enums"]["inventory_condition"]
            | null
          technician_id: string
          tool_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "company_tool_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_assign_order: {
        Args: { p_note?: string; p_order_id: string; p_technician_id: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      admin_company_tools_by_technician: {
        Args: never
        Returns: {
          technician_id: string
          technician_name: string
          tools: Json
          tools_count: number
          total_value_cents: number
        }[]
      }
      admin_company_tools_outstanding: {
        Args: { p_older_than_days?: number }
        Returns: {
          acquisition_cost_cents: number
          assigned_at: string
          assigned_condition: Database["public"]["Enums"]["inventory_condition"]
          assignment_id: string
          days_held: number
          serial_or_code: string
          technician_id: string
          technician_name: string
          tool_id: string
          tool_name: string
        }[]
      }
      admin_custom_tools: {
        Args: never
        Returns: {
          category_ids: string[]
          first_seen: string
          name: string
          technicians_count: number
        }[]
      }
      admin_delete_holiday: { Args: { p_date: string }; Returns: undefined }
      admin_delete_schedule_rule: { Args: { p_id: string }; Returns: undefined }
      admin_emergency_history: { Args: { p_order_id: string }; Returns: Json }
      admin_escalate_dispute: {
        Args: { p_dispute_id: string; p_note?: string }
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
      admin_find_technicians_by_plate: {
        Args: { p_query: string }
        Returns: {
          color: string
          is_primary: boolean
          make: string
          model: string
          plate: string
          technician_id: string
          technician_name: string
          year: number
        }[]
      }
      admin_hide_rating: {
        Args: {
          p_note?: string
          p_rating_id: string
          p_reason: Database["public"]["Enums"]["rating_moderation_reason"]
        }
        Returns: {
          comment: string | null
          created_at: string
          hidden_at: string | null
          hidden_by: string | null
          hidden_note: string | null
          hidden_reason:
            | Database["public"]["Enums"]["rating_moderation_reason"]
            | null
          id: string
          is_hidden: boolean
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
      admin_list_admin_roles: {
        Args: never
        Returns: {
          admin_role: string
          email: string
          user_id: string
        }[]
      }
      admin_list_cash_reviews: {
        Args: never
        Returns: {
          client_dispute_reason: string
          client_id: string
          client_name: string
          client_reported_cents: number
          expected_cents: number
          folio: number
          order_id: string
          payment_id: string
          received_cents: number
          review_opened_at: string
          review_reason: string
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string
          technician_name: string
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
      admin_preview_schedule_surcharge: {
        Args: { p_category_id: string; p_ts?: string }
        Returns: Json
      }
      admin_promote_custom_tool: {
        Args: { p_category_id?: string; p_custom_name: string; p_name: string }
        Returns: {
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tool_catalog"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_reassign_order: {
        Args: { p_note?: string; p_order_id: string; p_technician_id: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
          p_payment_id?: string
          p_reason?: string
          p_stripe_refund_id?: string
        }
        Returns: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_received_cents: number | null
          cash_reported_at: string | null
          cash_reported_by: string | null
          cash_status: string | null
          client_cash_responded_at: string | null
          client_cash_response: string | null
          client_dispute_reason: string | null
          client_id: string
          client_reported_cents: number | null
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          kind: string
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          platform_fee_cents: number
          refund_attempts: number
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_cents: number
          review_notes: string | null
          review_opened_at: string | null
          review_outcome: string | null
          review_reason: string | null
          review_resolved_at: string | null
          review_resolved_by: string | null
          review_status: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          tech_credit_cents: number
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
      admin_reject_request: {
        Args: { p_order_id: string; p_reason: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      admin_report_cash_by_technician: {
        Args: { p_from: string; p_technician_id?: string; p_to: string }
        Returns: {
          base_fee_credited_cents: number
          cash_awaiting_client_cents: number
          cash_client_confirmed_cents: number
          cash_disputed_cents: number
          cash_expected_cents: number
          cash_reported_cents: number
          commission_generated_cents: number
          commission_pending_cents: number
          commission_recovered_cents: number
          quotes_rejected: number
          reviews_open: number
          schedule_surcharge_credited_cents: number
          services_count: number
          technician_id: string
          technician_name: string
        }[]
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
        Args: {
          p_from: string
          p_method?: Database["public"]["Enums"]["payment_method"]
          p_to: string
        }
        Returns: Json
      }
      admin_report_payments: {
        Args: {
          p_cash_status?: string
          p_from: string
          p_limit?: number
          p_method?: Database["public"]["Enums"]["payment_method"]
          p_offset?: number
          p_only_review?: boolean
          p_to: string
        }
        Returns: {
          base_fee_cents: number
          base_fee_status: string
          base_method: string
          base_refunded_cents: number
          base_surcharge_cents: number
          base_total_cents: number
          cash_expected_cents: number
          cash_received_cents: number
          cash_reported_at: string
          cash_review_open: boolean
          cash_status: string
          category_name: string
          client_id: string
          client_name: string
          client_response: string
          closed_by_quote_rejection: boolean
          commission_cents: number
          created_at: string
          emergency_surcharge_cents: number
          folio: number
          order_id: string
          payment_model: string
          quote_method: string
          quote_status: string
          quote_total_cents: number
          schedule_rule_name: string
          schedule_surcharge_cents: number
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string
          technician_name: string
          total_cents: number
          total_count: number
        }[]
      }
      admin_report_ticket_by_category: {
        Args: {
          p_from: string
          p_method?: Database["public"]["Enums"]["payment_method"]
          p_to: string
        }
        Returns: {
          avg_ticket_cents: number
          category_id: string
          category_name: string
          paid_orders: number
        }[]
      }
      admin_resolve_cash_review: {
        Args: {
          p_notes?: string
          p_order_id: string
          p_outcome: string
          p_received_cents?: number
        }
        Returns: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_received_cents: number | null
          cash_reported_at: string | null
          cash_reported_by: string | null
          cash_status: string | null
          client_cash_responded_at: string | null
          client_cash_response: string | null
          client_dispute_reason: string | null
          client_id: string
          client_reported_cents: number | null
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          kind: string
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          platform_fee_cents: number
          refund_attempts: number
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_cents: number
          review_notes: string | null
          review_opened_at: string | null
          review_outcome: string | null
          review_reason: string | null
          review_resolved_at: string | null
          review_resolved_by: string | null
          review_status: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          tech_credit_cents: number
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
        SetofOptions: {
          from: "*"
          to: "technicians"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_restore_rating: {
        Args: { p_note?: string; p_rating_id: string }
        Returns: {
          comment: string | null
          created_at: string
          hidden_at: string | null
          hidden_by: string | null
          hidden_note: string | null
          hidden_reason:
            | Database["public"]["Enums"]["rating_moderation_reason"]
            | null
          id: string
          is_hidden: boolean
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
      admin_retire_company_tool: {
        Args: {
          p_note?: string
          p_reason: Database["public"]["Enums"]["inventory_retire_reason"]
          p_tool_id: string
        }
        Returns: {
          acquired_on: string | null
          acquisition_cost_cents: number | null
          brand: string | null
          catalog_id: string | null
          category_id: string | null
          created_at: string
          id: string
          model: string | null
          name: string
          photo_path: string | null
          retired_at: string | null
          retired_by: string | null
          retired_note: string | null
          retired_reason:
            | Database["public"]["Enums"]["inventory_retire_reason"]
            | null
          serial_or_code: string
          status: Database["public"]["Enums"]["inventory_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "company_tools"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_retry_base_fee_refund: {
        Args: { p_order_id: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      admin_return_company_tool: {
        Args: {
          p_condition?: Database["public"]["Enums"]["inventory_condition"]
          p_note?: string
          p_returned_at?: string
          p_to_repair?: boolean
          p_tool_id: string
        }
        Returns: {
          assign_note: string | null
          assigned_at: string
          assigned_by: string | null
          assigned_condition: Database["public"]["Enums"]["inventory_condition"]
          created_at: string
          id: string
          return_note: string | null
          returned_at: string | null
          returned_by: string | null
          returned_condition:
            | Database["public"]["Enums"]["inventory_condition"]
            | null
          technician_id: string
          tool_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "company_tool_assignments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_category_base_fee: {
        Args: { p_category_id: string; p_cents: number }
        Returns: {
          base_visit_fee_cents: number | null
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
        SetofOptions: {
          from: "*"
          to: "service_categories"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_company_tool_repair: {
        Args: { p_in_repair: boolean; p_note?: string; p_tool_id: string }
        Returns: {
          acquired_on: string | null
          acquisition_cost_cents: number | null
          brand: string | null
          catalog_id: string | null
          category_id: string | null
          created_at: string
          id: string
          model: string | null
          name: string
          photo_path: string | null
          retired_at: string | null
          retired_by: string | null
          retired_note: string | null
          retired_reason:
            | Database["public"]["Enums"]["inventory_retire_reason"]
            | null
          serial_or_code: string
          status: Database["public"]["Enums"]["inventory_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "company_tools"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_schedule_rule_active: {
        Args: { p_active: boolean; p_id: string }
        Returns: {
          created_at: string
          end_time: string | null
          id: string
          is_active: boolean
          kind: string
          name: string
          sort_order: number
          start_time: string | null
          surcharge_type: string
          updated_at: string
          value: number
          weekdays: number[] | null
        }
        SetofOptions: {
          from: "*"
          to: "schedule_surcharge_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_technician_type: {
        Args: {
          p_company_id?: string
          p_note?: string
          p_technician_id: string
          p_type: Database["public"]["Enums"]["technician_type"]
        }
        Returns: {
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
          avatar_icon: string
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
      admin_suggest_technicians: {
        Args: { p_order_id: string }
        Returns: {
          active_orders: number
          display_name: string
          distance_m: number
          is_available: boolean
          rating_avg: number
          rating_count: number
          technician_id: string
          zone_match: boolean
        }[]
      }
      admin_update_contact_message: {
        Args: {
          p_id: string
          p_note?: string
          p_status: Database["public"]["Enums"]["contact_status"]
        }
        Returns: {
          admin_note: string | null
          consent_at: string
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at: string
          email: string
          email_status: string | null
          handled_at: string | null
          handled_by: string | null
          id: string
          ip_hash: string | null
          message: string
          name: string
          phone: string
          source: string | null
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          user_agent: string | null
        }
        SetofOptions: {
          from: "*"
          to: "contact_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_upsert_company_tool: {
        Args: {
          p_acquired_on?: string
          p_acquisition_cost_cents?: number
          p_brand?: string
          p_catalog_id?: string
          p_category_id?: string
          p_id?: string
          p_model?: string
          p_name?: string
          p_photo_path?: string
          p_serial_or_code?: string
        }
        Returns: {
          acquired_on: string | null
          acquisition_cost_cents: number | null
          brand: string | null
          catalog_id: string | null
          category_id: string | null
          created_at: string
          id: string
          model: string | null
          name: string
          photo_path: string | null
          retired_at: string | null
          retired_by: string | null
          retired_note: string | null
          retired_reason:
            | Database["public"]["Enums"]["inventory_retire_reason"]
            | null
          serial_or_code: string
          status: Database["public"]["Enums"]["inventory_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "company_tools"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_upsert_holiday: {
        Args: { p_date: string; p_name: string }
        Returns: {
          created_at: string
          date: string
          name: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "holidays"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_upsert_schedule_rule: {
        Args: {
          p_end_time?: string
          p_id: string
          p_is_active?: boolean
          p_kind: string
          p_name: string
          p_sort_order?: number
          p_start_time?: string
          p_surcharge_type?: string
          p_value?: number
          p_weekdays?: number[]
        }
        Returns: {
          created_at: string
          end_time: string | null
          id: string
          is_active: boolean
          kind: string
          name: string
          sort_order: number
          start_time: string | null
          surcharge_type: string
          updated_at: string
          value: number
          weekdays: number[] | null
        }
        SetofOptions: {
          from: "*"
          to: "schedule_surcharge_rules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_waive_base_fee: {
        Args: { p_order_id: string; p_reason: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      advance_emergency_dispatch: { Args: never; Returns: number }
      alert_unassigned_requests: { Args: never; Returns: number }
      anonymize_user_account: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      apply_base_fee_refund: {
        Args: { p_payment_id: string; p_stripe_refund_id: string }
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
      auto_confirm_cash_payments: { Args: never; Returns: number }
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
          platform_topup_cents: number
          platform_transfer_id: string | null
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
      client_address_verified: {
        Args: { p_client_id: string }
        Returns: boolean
      }
      close_service_order: {
        Args: { p_note?: string; p_order_id: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
          cash_received_cents: number | null
          cash_reported_at: string | null
          cash_reported_by: string | null
          cash_status: string | null
          client_cash_responded_at: string | null
          client_cash_response: string | null
          client_dispute_reason: string | null
          client_id: string
          client_reported_cents: number | null
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          kind: string
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          platform_fee_cents: number
          refund_attempts: number
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_cents: number
          review_notes: string | null
          review_opened_at: string | null
          review_outcome: string | null
          review_reason: string | null
          review_resolved_at: string | null
          review_resolved_by: string | null
          review_status: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          tech_credit_cents: number
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
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      create_unassigned_request: {
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
          p_scheduled_for?: string
          p_scheduled_until?: string
          p_state?: string
        }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      deactivate_device_token: { Args: { p_token: string }; Returns: undefined }
      dispute_cash_payment: {
        Args: { p_order_id: string; p_paid_cents?: number; p_reason?: string }
        Returns: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_received_cents: number | null
          cash_reported_at: string | null
          cash_reported_by: string | null
          cash_status: string | null
          client_cash_responded_at: string | null
          client_cash_response: string | null
          client_dispute_reason: string | null
          client_id: string
          client_reported_cents: number | null
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          kind: string
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          platform_fee_cents: number
          refund_attempts: number
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_cents: number
          review_notes: string | null
          review_opened_at: string | null
          review_outcome: string | null
          review_reason: string | null
          review_resolved_at: string | null
          review_resolved_by: string | null
          review_status: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          tech_credit_cents: number
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
      expire_stale_requests: { Args: never; Returns: number }
      expire_unpaid_base_fees: { Args: never; Returns: number }
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
          avatar_icon: string
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
      get_emergency_terms: {
        Args: { p_category_id: string }
        Returns: {
          mode: string
          surcharge_bps: number
          surcharge_fixed_cents: number
          timeout_minutes: number
        }[]
      }
      get_order_payment_summary: { Args: { p_order_id: string }; Returns: Json }
      get_request_terms: {
        Args: {
          p_category_id: string
          p_scheduled_for?: string
          p_technician_id?: string
        }
        Returns: {
          applies: boolean
          base_fee_cents: number
          schedule_rule_id: string
          schedule_rule_name: string
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number
          schedule_surcharge_type: string
          schedule_surcharge_value: number
          source: string
          total_cents: number
          visit_base_cents: number
        }[]
      }
      get_technician_cash_summary: {
        Args: { p_technician_id?: string }
        Returns: Json
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
          platform_topup_cents: number
          platform_transfer_id: string | null
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
      notify_admins_contact_message: { Args: { p_id: string }; Returns: number }
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
      order_technician_location: {
        Args: { p_order_id: string }
        Returns: {
          accuracy_m: number
          heading: number
          lat: number
          lng: number
          recorded_at: string
        }[]
      }
      order_technician_vehicle: {
        Args: { p_order_id: string }
        Returns: {
          color: string
          make: string
          model: string
          plate: string
          year: number
        }[]
      }
      prepare_payout_topup: { Args: { p_request_id: string }; Returns: Json }
      prepare_stripe_checkout: { Args: { p_order_id: string }; Returns: Json }
      record_base_fee_refund_failure: {
        Args: { p_error?: string; p_payment_id: string }
        Returns: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_received_cents: number | null
          cash_reported_at: string | null
          cash_reported_by: string | null
          cash_status: string | null
          client_cash_responded_at: string | null
          client_cash_response: string | null
          client_dispute_reason: string | null
          client_id: string
          client_reported_cents: number | null
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          kind: string
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          platform_fee_cents: number
          refund_attempts: number
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_cents: number
          review_notes: string | null
          review_opened_at: string | null
          review_outcome: string | null
          review_reason: string | null
          review_resolved_at: string | null
          review_resolved_by: string | null
          review_status: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          tech_credit_cents: number
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
      record_payout_topup: {
        Args: {
          p_request_id: string
          p_topup_cents: number
          p_transfer_id: string
        }
        Returns: undefined
      }
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
      reject_quote: {
        Args: { p_quote_id: string; p_reason?: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      release_service_order: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
          cash_received_cents: number | null
          cash_reported_at: string | null
          cash_reported_by: string | null
          cash_status: string | null
          client_cash_responded_at: string | null
          client_cash_response: string | null
          client_dispute_reason: string | null
          client_id: string
          client_reported_cents: number | null
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          kind: string
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          platform_fee_cents: number
          refund_attempts: number
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_cents: number
          review_notes: string | null
          review_opened_at: string | null
          review_outcome: string | null
          review_reason: string | null
          review_resolved_at: string | null
          review_resolved_by: string | null
          review_status: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          tech_credit_cents: number
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
          platform_topup_cents: number
          platform_transfer_id: string | null
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
      revert_service_order_status: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      send_quote: {
        Args: { p_quote_id: string }
        Returns: {
          accepted_at: string | null
          created_at: string
          id: string
          labor_cents: number
          materials_cents: number
          notes: string | null
          reject_reason: string | null
          rejected_at: string | null
          service_order_id: string
          submitted_at: string | null
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
          hidden_at: string | null
          hidden_by: string | null
          hidden_note: string | null
          hidden_reason:
            | Database["public"]["Enums"]["rating_moderation_reason"]
            | null
          id: string
          is_hidden: boolean
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
          reject_reason: string | null
          rejected_at: string | null
          service_order_id: string
          submitted_at: string | null
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
      technician_confirm_cash: {
        Args: { p_order_id: string; p_received_cents?: number }
        Returns: {
          amount_cents: number
          cash_confirmed_at: string | null
          cash_confirmed_by: string | null
          cash_debt_recovered_cents: number
          cash_received_cents: number | null
          cash_reported_at: string | null
          cash_reported_by: string | null
          cash_status: string | null
          client_cash_responded_at: string | null
          client_cash_response: string | null
          client_dispute_reason: string | null
          client_id: string
          client_reported_cents: number | null
          commission_cents: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          kind: string
          metadata: Json
          method: Database["public"]["Enums"]["payment_method"]
          mp_payment_id: string | null
          mp_preference_id: string | null
          mp_status: string | null
          paid_at: string | null
          platform_fee_cents: number
          refund_attempts: number
          refund_reason: string | null
          refund_requested_at: string | null
          refunded_cents: number
          review_notes: string | null
          review_opened_at: string | null
          review_outcome: string | null
          review_reason: string | null
          review_resolved_at: string | null
          review_resolved_by: string | null
          review_status: string | null
          service_order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_dispute_id: string | null
          stripe_fee_cents: number
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          tech_credit_cents: number
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
      transition_service_order: {
        Args: {
          p_note?: string
          p_order_id: string
          p_to_status: Database["public"]["Enums"]["service_order_status"]
        }
        Returns: {
          accepted_at: string | null
          address_line: string | null
          assignment_mode: string
          base_fee_cents: number
          base_fee_credited_at: string | null
          base_fee_paid_at: string | null
          base_fee_refunded_at: string | null
          base_fee_status: string
          base_surcharge_cents: number
          base_total_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cash_review_open: boolean
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
          payment_model: string
          place_name: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["service_priority"]
          quoted_subtotal_cents: number | null
          quoted_total_cents: number | null
          raw_mapbox_feature: Json | null
          requested_technician_id: string | null
          schedule_surcharge_bps: number
          schedule_surcharge_cents: number | null
          schedule_surcharge_name: string | null
          schedule_surcharge_rule_id: string | null
          scheduled_for: string | null
          scheduled_until: string | null
          state: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          technician_id: string | null
          title: string | null
          unassigned_alerted_at: string | null
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
      contact_status: "new" | "handled" | "archived"
      contact_type: "client" | "company" | "technician" | "other"
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
      inventory_condition: "new" | "good" | "fair" | "damaged"
      inventory_retire_reason: "damage" | "loss" | "theft" | "end_of_life"
      inventory_status: "available" | "assigned" | "in_repair" | "retired"
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
      rating_moderation_reason:
        | "offensive"
        | "fraudulent"
        | "duplicate"
        | "cancelled_service"
        | "client_error"
        | "other"
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
      service_priority: "normal" | "emergency"
      technician_document_kind:
        | "criminal_record"
        | "proof_of_address"
        | "bank_statement"
      technician_type: "tumtto" | "third_party" | "independent"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      client_document_kind: ["proof_of_address"],
      contact_status: ["new", "handled", "archived"],
      contact_type: ["client", "company", "technician", "other"],
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
      inventory_condition: ["new", "good", "fair", "damaged"],
      inventory_retire_reason: ["damage", "loss", "theft", "end_of_life"],
      inventory_status: ["available", "assigned", "in_repair", "retired"],
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
      rating_moderation_reason: [
        "offensive",
        "fraudulent",
        "duplicate",
        "cancelled_service",
        "client_error",
        "other",
      ],
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
      service_priority: ["normal", "emergency"],
      technician_document_kind: [
        "criminal_record",
        "proof_of_address",
        "bank_statement",
      ],
      technician_type: ["tumtto", "third_party", "independent"],
      ticket_status: ["open", "pending", "in_progress", "resolved", "closed"],
      user_role: ["client", "technician", "admin"],
    },
  },
} as const

