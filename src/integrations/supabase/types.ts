export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_path: string
          session_id: string
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_path: string
          session_id: string
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string
          session_id?: string
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_type: string
          client_id: string | null
          cost: number | null
          created_at: string
          id: string
          request_data: Json | null
          response_data: Json | null
          telegram_id: number | null
          tokens_used: number | null
        }
        Insert: {
          api_type: string
          client_id?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          telegram_id?: number | null
          tokens_used?: number | null
        }
        Update: {
          api_type?: string
          client_id?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          telegram_id?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by_telegram_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by_telegram_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by_telegram_id?: number | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_by_telegram_id: number
          created_at: string
          id: string
          reason: string | null
          telegram_id: number
          updated_at: string
        }
        Insert: {
          blocked_by_telegram_id: number
          created_at?: string
          id?: string
          reason?: string | null
          telegram_id: number
          updated_at?: string
        }
        Update: {
          blocked_by_telegram_id?: number
          created_at?: string
          id?: string
          reason?: string | null
          telegram_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversation_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          session_title: string | null
          telegram_id: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          session_title?: string | null
          telegram_id?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          session_title?: string | null
          telegram_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string | null
          telegram_id: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id?: string | null
          telegram_id?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string | null
          telegram_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_active: string | null
          last_name: string
          phone: string | null
          status: string
          telegram_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_active?: string | null
          last_name: string
          phone?: string | null
          status?: string
          telegram_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_active?: string | null
          last_name?: string
          phone?: string | null
          status?: string
          telegram_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      cost_tracking: {
        Row: {
          amount: number
          cost_type: string
          currency: string | null
          id: string
          recorded_at: string | null
          service_name: string | null
          telegram_id: number
          usage_details: Json | null
          user_id: string | null
        }
        Insert: {
          amount: number
          cost_type: string
          currency?: string | null
          id?: string
          recorded_at?: string | null
          service_name?: string | null
          telegram_id: number
          usage_details?: Json | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          cost_type?: string
          currency?: string | null
          id?: string
          recorded_at?: string | null
          service_name?: string | null
          telegram_id?: number
          usage_details?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diamond_share_analytics: {
        Row: {
          created_at: string | null
          device_type: string | null
          diamond_stock_number: string
          id: string
          owner_telegram_id: number
          referrer: string | null
          returned_visitor: boolean | null
          session_id: string | null
          time_spent_seconds: number | null
          view_timestamp: string
          viewed_other_diamonds: boolean | null
          viewer_ip_address: unknown | null
          viewer_telegram_id: number | null
          viewer_user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          diamond_stock_number: string
          id?: string
          owner_telegram_id: number
          referrer?: string | null
          returned_visitor?: boolean | null
          session_id?: string | null
          time_spent_seconds?: number | null
          view_timestamp?: string
          viewed_other_diamonds?: boolean | null
          viewer_ip_address?: unknown | null
          viewer_telegram_id?: number | null
          viewer_user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          diamond_stock_number?: string
          id?: string
          owner_telegram_id?: number
          referrer?: string | null
          returned_visitor?: boolean | null
          session_id?: string | null
          time_spent_seconds?: number | null
          view_timestamp?: string
          viewed_other_diamonds?: boolean | null
          viewer_ip_address?: unknown | null
          viewer_telegram_id?: number | null
          viewer_user_agent?: string | null
        }
        Relationships: []
      }
      diamonds: {
        Row: {
          carat: number
          clarity: string
          color: string
          created_at: string | null
          cut: string
          id: string
          price: number
          user_id: string
        }
        Insert: {
          carat: number
          clarity: string
          color: string
          created_at?: string | null
          cut: string
          id?: string
          price: number
          user_id: string
        }
        Update: {
          carat?: number
          clarity?: string
          color?: string
          created_at?: string | null
          cut?: string
          id?: string
          price?: number
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          certificate_comment: string | null
          certificate_number: number | null
          certificate_url: string | null
          clarity: string
          color: string
          created_at: string
          culet: string | null
          cut: string | null
          deleted_at: string | null
          depth: number | null
          depth_percentage: number | null
          fluorescence: string | null
          gridle: string | null
          id: string
          lab: string | null
          length: number | null
          picture: string | null
          polish: string | null
          price_per_carat: number | null
          rapnet: number | null
          ratio: number | null
          shape: string
          status: string | null
          stock_number: string
          store_visible: boolean | null
          symmetry: string | null
          table_percentage: number | null
          updated_at: string
          user_id: number
          weight: number
          width: number | null
        }
        Insert: {
          certificate_comment?: string | null
          certificate_number?: number | null
          certificate_url?: string | null
          clarity: string
          color: string
          created_at?: string
          culet?: string | null
          cut?: string | null
          deleted_at?: string | null
          depth?: number | null
          depth_percentage?: number | null
          fluorescence?: string | null
          gridle?: string | null
          id?: string
          lab?: string | null
          length?: number | null
          picture?: string | null
          polish?: string | null
          price_per_carat?: number | null
          rapnet?: number | null
          ratio?: number | null
          shape: string
          status?: string | null
          stock_number: string
          store_visible?: boolean | null
          symmetry?: string | null
          table_percentage?: number | null
          updated_at?: string
          user_id: number
          weight: number
          width?: number | null
        }
        Update: {
          certificate_comment?: string | null
          certificate_number?: number | null
          certificate_url?: string | null
          clarity?: string
          color?: string
          created_at?: string
          culet?: string | null
          cut?: string | null
          deleted_at?: string | null
          depth?: number | null
          depth_percentage?: number | null
          fluorescence?: string | null
          gridle?: string | null
          id?: string
          lab?: string | null
          length?: number | null
          picture?: string | null
          polish?: string | null
          price_per_carat?: number | null
          rapnet?: number | null
          ratio?: number | null
          shape?: string
          status?: string | null
          stock_number?: string
          store_visible?: boolean | null
          symmetry?: string | null
          table_percentage?: number | null
          updated_at?: string
          user_id?: number
          weight?: number
          width?: number | null
        }
        Relationships: []
      }
      inventory_analytics_cache: {
        Row: {
          analytics_type: string
          created_at: string | null
          data: Json
          expires_at: string
          id: string
          user_id: number
        }
        Insert: {
          analytics_type: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
          user_id: number
        }
        Update: {
          analytics_type?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          user_id?: number
        }
        Relationships: []
      }
      keshett_agreements: {
        Row: {
          accepted_at: string | null
          agreed_price: number
          buyer_telegram_id: number
          completed_at: string | null
          created_at: string
          diamond_data: Json
          diamond_stock_number: string
          expiry_at: string
          id: string
          notes: string | null
          seller_telegram_id: number
          status: string
          terms: Json | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          agreed_price: number
          buyer_telegram_id: number
          completed_at?: string | null
          created_at?: string
          diamond_data: Json
          diamond_stock_number: string
          expiry_at: string
          id?: string
          notes?: string | null
          seller_telegram_id: number
          status?: string
          terms?: Json | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          agreed_price?: number
          buyer_telegram_id?: number
          completed_at?: string | null
          created_at?: string
          diamond_data?: Json
          diamond_stock_number?: string
          expiry_at?: string
          id?: string
          notes?: string | null
          seller_telegram_id?: number
          status?: string
          terms?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          message_content: string
          message_type: string
          metadata: Json | null
          read_at: string | null
          sent_at: string
          status: string
          telegram_id: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          message_content: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string
          status?: string
          telegram_id: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          message_content?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string
          status?: string
          telegram_id?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_visits: {
        Row: {
          clicks_count: number | null
          created_at: string | null
          feature_used: string | null
          form_interactions: number | null
          id: string
          interaction_data: Json | null
          page_path: string
          page_title: string | null
          referrer: string | null
          scroll_depth: number | null
          session_id: string | null
          time_spent: unknown | null
          visit_timestamp: string | null
        }
        Insert: {
          clicks_count?: number | null
          created_at?: string | null
          feature_used?: string | null
          form_interactions?: number | null
          id?: string
          interaction_data?: Json | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_spent?: unknown | null
          visit_timestamp?: string | null
        }
        Update: {
          clicks_count?: number | null
          created_at?: string | null
          feature_used?: string | null
          form_interactions?: number | null
          id?: string
          interaction_data?: Json | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_spent?: unknown | null
          visit_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_visits_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          plan_name: string
          start_date: string | null
          status: string
          telegram_id: number
          trial_end_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          plan_name: string
          start_date?: string | null
          status?: string
          telegram_id: number
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          plan_name?: string
          start_date?: string | null
          status?: string
          telegram_id?: number
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_analytics: {
        Row: {
          created_at: string
          first_upload_completed_at: string | null
          id: string
          language_used: string | null
          source: string | null
          steps_completed: string[] | null
          telegram_id: number
          total_steps_viewed: number | null
          tutorial_completed_at: string | null
          tutorial_skipped_at: string | null
          tutorial_started_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_upload_completed_at?: string | null
          id?: string
          language_used?: string | null
          source?: string | null
          steps_completed?: string[] | null
          telegram_id: number
          total_steps_viewed?: number | null
          tutorial_completed_at?: string | null
          tutorial_skipped_at?: string | null
          tutorial_started_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_upload_completed_at?: string | null
          id?: string
          language_used?: string | null
          source?: string | null
          steps_completed?: string[] | null
          telegram_id?: number
          total_steps_viewed?: number | null
          tutorial_completed_at?: string | null
          tutorial_skipped_at?: string | null
          tutorial_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          page_url: string | null
          session_id: string | null
          telegram_id: number
          timestamp: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          page_url?: string | null
          session_id?: string | null
          telegram_id: number
          timestamp?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          page_url?: string | null
          session_id?: string | null
          telegram_id?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          api_calls_count: number | null
          cost_per_user: number | null
          created_at: string | null
          id: string
          last_active: string | null
          lifetime_value: number | null
          profit_loss: number | null
          revenue_per_user: number | null
          storage_used_mb: number | null
          subscription_status: string | null
          telegram_id: number
          total_time_spent: unknown | null
          total_visits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_calls_count?: number | null
          cost_per_user?: number | null
          created_at?: string | null
          id?: string
          last_active?: string | null
          lifetime_value?: number | null
          profit_loss?: number | null
          revenue_per_user?: number | null
          storage_used_mb?: number | null
          subscription_status?: string | null
          telegram_id: number
          total_time_spent?: unknown | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_calls_count?: number | null
          cost_per_user?: number | null
          created_at?: string | null
          id?: string
          last_active?: string | null
          lifetime_value?: number | null
          profit_loss?: number | null
          revenue_per_user?: number | null
          storage_used_mb?: number | null
          subscription_status?: string | null
          telegram_id?: number
          total_time_spent?: unknown | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_analytics: {
        Row: {
          created_at: string | null
          device_types: Json | null
          diamonds_added: number | null
          diamonds_deleted: number | null
          diamonds_edited: number | null
          engagement_score: number | null
          favorite_pages: Json | null
          first_visit: string | null
          id: string
          last_visit: string | null
          searches_count: number | null
          telegram_id: number
          total_page_views: number | null
          total_sessions: number | null
          total_time_spent: unknown | null
          updated_at: string | null
          uploads_count: number | null
        }
        Insert: {
          created_at?: string | null
          device_types?: Json | null
          diamonds_added?: number | null
          diamonds_deleted?: number | null
          diamonds_edited?: number | null
          engagement_score?: number | null
          favorite_pages?: Json | null
          first_visit?: string | null
          id?: string
          last_visit?: string | null
          searches_count?: number | null
          telegram_id: number
          total_page_views?: number | null
          total_sessions?: number | null
          total_time_spent?: unknown | null
          updated_at?: string | null
          uploads_count?: number | null
        }
        Update: {
          created_at?: string | null
          device_types?: Json | null
          diamonds_added?: number | null
          diamonds_deleted?: number | null
          diamonds_edited?: number | null
          engagement_score?: number | null
          favorite_pages?: Json | null
          first_visit?: string | null
          id?: string
          last_visit?: string | null
          searches_count?: number | null
          telegram_id?: number
          total_page_views?: number | null
          total_sessions?: number | null
          total_time_spent?: unknown | null
          updated_at?: string | null
          uploads_count?: number | null
        }
        Relationships: []
      }
      user_logins: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          init_data_hash: string | null
          ip_address: string | null
          is_premium: boolean | null
          language_code: string | null
          last_name: string | null
          login_timestamp: string
          photo_url: string | null
          telegram_id: number
          user_agent: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          init_data_hash?: string | null
          ip_address?: string | null
          is_premium?: boolean | null
          language_code?: string | null
          last_name?: string | null
          login_timestamp?: string
          photo_url?: string | null
          telegram_id: number
          user_agent?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          init_data_hash?: string | null
          ip_address?: string | null
          is_premium?: boolean | null
          language_code?: string | null
          last_name?: string | null
          login_timestamp?: string
          photo_url?: string | null
          telegram_id?: number
          user_agent?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_management_log: {
        Row: {
          action_type: string
          admin_telegram_id: number
          changes: Json | null
          created_at: string | null
          id: string
          reason: string | null
          target_telegram_id: number | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_telegram_id: number
          changes?: Json | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_telegram_id?: number | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_telegram_id?: number
          changes?: Json | null
          created_at?: string | null
          id?: string
          reason?: string | null
          target_telegram_id?: number | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bio: string | null
          business_name: string | null
          company: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_premium: boolean | null
          language: string | null
          language_code: string | null
          last_login: string | null
          last_name: string | null
          notes: string | null
          payment_status: string | null
          phone_number: string | null
          photo_url: string | null
          status: string | null
          subscription_plan: string | null
          telegram_id: number
          timezone: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_premium?: boolean | null
          language?: string | null
          language_code?: string | null
          last_login?: string | null
          last_name?: string | null
          notes?: string | null
          payment_status?: string | null
          phone_number?: string | null
          photo_url?: string | null
          status?: string | null
          subscription_plan?: string | null
          telegram_id: number
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_premium?: boolean | null
          language?: string | null
          language_code?: string | null
          last_login?: string | null
          last_name?: string | null
          notes?: string | null
          payment_status?: string | null
          phone_number?: string | null
          photo_url?: string | null
          status?: string | null
          subscription_plan?: string | null
          telegram_id?: number
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser_info: string | null
          created_at: string | null
          device_type: string | null
          entry_page: string | null
          exit_page: string | null
          id: string
          is_active: boolean | null
          pages_visited: number | null
          referrer_url: string | null
          screen_resolution: string | null
          session_end: string | null
          session_start: string | null
          telegram_id: number
          time_zone: string | null
          total_duration: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser_info?: string | null
          created_at?: string | null
          device_type?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          is_active?: boolean | null
          pages_visited?: number | null
          referrer_url?: string | null
          screen_resolution?: string | null
          session_end?: string | null
          session_start?: string | null
          telegram_id: number
          time_zone?: string | null
          total_duration?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser_info?: string | null
          created_at?: string | null
          device_type?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          is_active?: boolean | null
          pages_visited?: number | null
          referrer_url?: string | null
          screen_resolution?: string | null
          session_end?: string | null
          session_start?: string | null
          telegram_id?: number
          time_zone?: string | null
          total_duration?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          diamond_data: Json
          diamond_owner_telegram_id: number
          diamond_stock_number: string
          id: string
          updated_at: string
          visitor_telegram_id: number
        }
        Insert: {
          created_at?: string
          diamond_data: Json
          diamond_owner_telegram_id: number
          diamond_stock_number: string
          id?: string
          updated_at?: string
          visitor_telegram_id: number
        }
        Update: {
          created_at?: string
          diamond_data?: Json
          diamond_owner_telegram_id?: number
          diamond_stock_number?: string
          id?: string
          updated_at?: string
          visitor_telegram_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      recent_user_logins: {
        Row: {
          first_login: string | null
          first_name: string | null
          last_login: string | null
          last_name: string | null
          login_count: number | null
          telegram_id: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_diamond_for_user: {
        Args: {
          p_user_id: number
          p_stock_number: string
          p_shape: string
          p_weight: number
          p_color: string
          p_clarity: string
          p_cut: string
          p_polish: string
          p_symmetry: string
          p_price_per_carat: number
          p_status: string
          p_picture: string
          p_certificate_url: string
        }
        Returns: boolean
      }
      check_certificate_exists: {
        Args: { p_certificate_number: number; p_user_id: number }
        Returns: boolean
      }
      clean_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_diamond: {
        Args: { p_stock_number: string; p_user_id: number }
        Returns: boolean
      }
      delete_diamond_by_stock: {
        Args: { p_stock_number: string; p_user_id: number }
        Returns: boolean
      }
      delete_diamonds_with_5000_price: {
        Args: { p_user_id: number }
        Returns: number
      }
      expire_keshett_agreements: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_public_diamond_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_realistic_analytics_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_sessions: number
          total_page_views: number
          total_users: number
          active_users_last_hour: number
          today_views: number
          avg_session_duration_seconds: number
        }[]
      }
      get_user_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          active_users: number
          premium_users: number
          blocked_users: number
          users_with_phone: number
          recent_signups: number
        }[]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      remove_all_duplicate_certificates: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      remove_duplicate_certificates: {
        Args: { p_user_id: number }
        Returns: number
      }
      set_session_context: {
        Args: { key: string; value: string }
        Returns: undefined
      }
      update_diamond_for_user: {
        Args: { p_user_id: number; p_stock_number: string; p_update_data: Json }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
