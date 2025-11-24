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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      acadia_sftp_analytics: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          telegram_id: number
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          telegram_id: number
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "acadia_sftp_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_telegram_id: number
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_telegram_id: number
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_telegram_id?: number
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          role: string
          telegram_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: string
          telegram_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: string
          telegram_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_learning_patterns: {
        Row: {
          created_at: string | null
          id: string
          last_applied_at: string | null
          pattern_data: Json
          pattern_type: string
          success_score: number | null
          updated_at: string | null
          usage_count: number | null
          user_telegram_id: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_applied_at?: string | null
          pattern_data: Json
          pattern_type: string
          success_score?: number | null
          updated_at?: string | null
          usage_count?: number | null
          user_telegram_id: number
        }
        Update: {
          created_at?: string | null
          id?: string
          last_applied_at?: string | null
          pattern_data?: Json
          pattern_type?: string
          success_score?: number | null
          updated_at?: string | null
          usage_count?: number | null
          user_telegram_id?: number
        }
        Relationships: []
      }
      ai_market_insights: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          sample_size: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          sample_size?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          sample_size?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      ai_transaction_feedback: {
        Row: {
          created_at: string | null
          feedback_type: string
          id: string
          learning_extracted: boolean | null
          match_id: string | null
          outcome_data: Json
          transaction_id: string | null
          user_telegram_id: number
        }
        Insert: {
          created_at?: string | null
          feedback_type: string
          id?: string
          learning_extracted?: boolean | null
          match_id?: string | null
          outcome_data: Json
          transaction_id?: string | null
          user_telegram_id: number
        }
        Update: {
          created_at?: string | null
          feedback_type?: string
          id?: string
          learning_extracted?: boolean | null
          match_id?: string | null
          outcome_data?: Json
          transaction_id?: string | null
          user_telegram_id?: number
        }
        Relationships: []
      }
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
      auction_analytics: {
        Row: {
          auction_id: string
          created_at: string | null
          event_data: Json | null
          event_type: string
          group_chat_id: number | null
          id: string
          telegram_id: number | null
        }
        Insert: {
          auction_id: string
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          group_chat_id?: number | null
          id?: string
          telegram_id?: number | null
        }
        Update: {
          auction_id?: string
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          group_chat_id?: number | null
          id?: string
          telegram_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_analytics_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_bids: {
        Row: {
          auction_id: string
          bid_amount: number
          bidder_name: string | null
          bidder_telegram_id: number
          created_at: string
          id: string
        }
        Insert: {
          auction_id: string
          bid_amount: number
          bidder_name?: string | null
          bidder_telegram_id: number
          created_at?: string
          id?: string
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          bidder_name?: string | null
          bidder_telegram_id?: number
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_diamonds: {
        Row: {
          auction_id: string
          certificate_number: number | null
          certificate_url: string | null
          clarity: string | null
          color: string | null
          created_at: string | null
          cut: string | null
          depth_percentage: number | null
          fluorescence: string | null
          id: string
          lab: string | null
          measurements: string | null
          picture: string | null
          polish: string | null
          price_per_carat: number | null
          shape: string | null
          stock_number: string
          symmetry: string | null
          table_percentage: number | null
          total_price: number | null
          video_url: string | null
          weight: number | null
        }
        Insert: {
          auction_id: string
          certificate_number?: number | null
          certificate_url?: string | null
          clarity?: string | null
          color?: string | null
          created_at?: string | null
          cut?: string | null
          depth_percentage?: number | null
          fluorescence?: string | null
          id?: string
          lab?: string | null
          measurements?: string | null
          picture?: string | null
          polish?: string | null
          price_per_carat?: number | null
          shape?: string | null
          stock_number: string
          symmetry?: string | null
          table_percentage?: number | null
          total_price?: number | null
          video_url?: string | null
          weight?: number | null
        }
        Update: {
          auction_id?: string
          certificate_number?: number | null
          certificate_url?: string | null
          clarity?: string | null
          color?: string | null
          created_at?: string | null
          cut?: string | null
          depth_percentage?: number | null
          fluorescence?: string | null
          id?: string
          lab?: string | null
          measurements?: string | null
          picture?: string | null
          polish?: string | null
          price_per_carat?: number | null
          shape?: string | null
          stock_number?: string
          symmetry?: string | null
          table_percentage?: number | null
          total_price?: number | null
          video_url?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_diamonds_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: true
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_watchers: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          telegram_id: number
          user_name: string | null
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          telegram_id: number
          user_name?: string | null
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          telegram_id?: number
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_watchers_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          auto_extend: boolean | null
          bid_count: number | null
          created_at: string
          currency: string
          current_price: number
          diamond_data: Json | null
          ends_at: string
          id: string
          message_ids: Json | null
          min_increment: number
          notify_seller: boolean | null
          reserve_price: number | null
          seller_telegram_id: number
          starting_price: number
          starts_at: string
          status: string
          stock_number: string
          total_clicks: number | null
          total_views: number | null
          unique_viewers: number | null
          updated_at: string
          winner_telegram_id: number | null
        }
        Insert: {
          auto_extend?: boolean | null
          bid_count?: number | null
          created_at?: string
          currency?: string
          current_price: number
          diamond_data?: Json | null
          ends_at: string
          id?: string
          message_ids?: Json | null
          min_increment?: number
          notify_seller?: boolean | null
          reserve_price?: number | null
          seller_telegram_id: number
          starting_price: number
          starts_at?: string
          status?: string
          stock_number: string
          total_clicks?: number | null
          total_views?: number | null
          unique_viewers?: number | null
          updated_at?: string
          winner_telegram_id?: number | null
        }
        Update: {
          auto_extend?: boolean | null
          bid_count?: number | null
          created_at?: string
          currency?: string
          current_price?: number
          diamond_data?: Json | null
          ends_at?: string
          id?: string
          message_ids?: Json | null
          min_increment?: number
          notify_seller?: boolean | null
          reserve_price?: number | null
          seller_telegram_id?: number
          starting_price?: number
          starts_at?: string
          status?: string
          stock_number?: string
          total_clicks?: number | null
          total_views?: number | null
          unique_viewers?: number | null
          updated_at?: string
          winner_telegram_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_auction_diamond"
            columns: ["stock_number"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["stock_number"]
          },
        ]
      }
      auth_debug_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          error_stack: string | null
          event_data: Json | null
          event_type: string
          has_valid_token: boolean | null
          id: string
          init_data_length: number | null
          init_data_present: boolean | null
          telegram_id: number | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          error_stack?: string | null
          event_data?: Json | null
          event_type: string
          has_valid_token?: boolean | null
          id?: string
          init_data_length?: number | null
          init_data_present?: boolean | null
          telegram_id?: number | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          error_stack?: string | null
          event_data?: Json | null
          event_type?: string
          has_valid_token?: boolean | null
          id?: string
          init_data_length?: number | null
          init_data_present?: boolean | null
          telegram_id?: number | null
          timestamp?: string | null
          user_agent?: string | null
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
      bot_usage_analytics: {
        Row: {
          api_version: string | null
          bot_token_type: string
          chat_id: number
          chat_type: string
          command: string | null
          created_at: string
          id: string
          message_data: Json | null
          message_type: string
          processed_at: string | null
          response_sent: boolean | null
          response_time_ms: number | null
          telegram_id: number
          user_info: Json | null
        }
        Insert: {
          api_version?: string | null
          bot_token_type?: string
          chat_id: number
          chat_type?: string
          command?: string | null
          created_at?: string
          id?: string
          message_data?: Json | null
          message_type: string
          processed_at?: string | null
          response_sent?: boolean | null
          response_time_ms?: number | null
          telegram_id: number
          user_info?: Json | null
        }
        Update: {
          api_version?: string | null
          bot_token_type?: string
          chat_id?: number
          chat_type?: string
          command?: string | null
          created_at?: string
          id?: string
          message_data?: Json | null
          message_type?: string
          processed_at?: string | null
          response_sent?: boolean | null
          response_time_ms?: number | null
          telegram_id?: number
          user_info?: Json | null
        }
        Relationships: []
      }
      buyer_requests: {
        Row: {
          buyer_id: number
          confidence_score: number | null
          created_at: string
          extracted_criteria_json: Json
          id: string
          original_message: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: number
          confidence_score?: number | null
          created_at?: string
          extracted_criteria_json?: Json
          id?: string
          original_message?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: number
          confidence_score?: number | null
          created_at?: string
          extracted_criteria_json?: Json
          id?: string
          original_message?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      campaign_button_clicks: {
        Row: {
          button_text: string
          button_url: string | null
          clicked_at: string
          id: string
          metadata: Json | null
          notification_id: string | null
          telegram_id: number
        }
        Insert: {
          button_text: string
          button_url?: string | null
          clicked_at?: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          telegram_id: number
        }
        Update: {
          button_text?: string
          button_url?: string | null
          clicked_at?: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_button_clicks_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
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
      chatbot_messages: {
        Row: {
          chat_id: number
          chat_title: string | null
          chat_type: string
          confidence_score: number | null
          created_at: string | null
          id: string
          message_text: string
          message_timestamp: string
          parsed_data: Json | null
          processed: boolean | null
          sender_info: Json
          telegram_id: number
        }
        Insert: {
          chat_id: number
          chat_title?: string | null
          chat_type?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          message_text: string
          message_timestamp: string
          parsed_data?: Json | null
          processed?: boolean | null
          sender_info: Json
          telegram_id: number
        }
        Update: {
          chat_id?: number
          chat_title?: string | null
          chat_type?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          message_text?: string
          message_timestamp?: string
          parsed_data?: Json | null
          processed?: boolean | null
          sender_info?: Json
          telegram_id?: number
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
      diamond_detail_views: {
        Row: {
          came_from: string
          catalog_position: number | null
          clicked_contact: boolean | null
          clicked_share: boolean | null
          created_at: string
          diamond_stock_number: string
          id: string
          scroll_depth_percentage: number | null
          session_id: string
          time_spent_seconds: number | null
          timestamp: string
          user_telegram_id: number | null
          viewed_360: boolean | null
          viewed_certificate: boolean | null
        }
        Insert: {
          came_from: string
          catalog_position?: number | null
          clicked_contact?: boolean | null
          clicked_share?: boolean | null
          created_at?: string
          diamond_stock_number: string
          id?: string
          scroll_depth_percentage?: number | null
          session_id: string
          time_spent_seconds?: number | null
          timestamp?: string
          user_telegram_id?: number | null
          viewed_360?: boolean | null
          viewed_certificate?: boolean | null
        }
        Update: {
          came_from?: string
          catalog_position?: number | null
          clicked_contact?: boolean | null
          clicked_share?: boolean | null
          created_at?: string
          diamond_stock_number?: string
          id?: string
          scroll_depth_percentage?: number | null
          session_id?: string
          time_spent_seconds?: number | null
          timestamp?: string
          user_telegram_id?: number | null
          viewed_360?: boolean | null
          viewed_certificate?: boolean | null
        }
        Relationships: []
      }
      diamond_offers: {
        Row: {
          buyer_contact: string | null
          buyer_name: string | null
          buyer_telegram_id: number
          created_at: string
          diamond_owner_telegram_id: number
          diamond_stock_number: string
          id: string
          message: string | null
          offered_price: number
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          buyer_contact?: string | null
          buyer_name?: string | null
          buyer_telegram_id: number
          created_at?: string
          diamond_owner_telegram_id: number
          diamond_stock_number: string
          id?: string
          message?: string | null
          offered_price: number
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_contact?: string | null
          buyer_name?: string | null
          buyer_telegram_id?: number
          created_at?: string
          diamond_owner_telegram_id?: number
          diamond_stock_number?: string
          id?: string
          message?: string | null
          offered_price?: number
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
          viewer_ip_address: unknown
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
          viewer_ip_address?: unknown
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
          viewer_ip_address?: unknown
          viewer_telegram_id?: number | null
          viewer_user_agent?: string | null
        }
        Relationships: []
      }
      diamond_shares: {
        Row: {
          created_at: string
          diamond_id: string
          id: string
          share_url: string
          shared_by: number
          stock_number: string
        }
        Insert: {
          created_at?: string
          diamond_id: string
          id?: string
          share_url: string
          shared_by: number
          stock_number: string
        }
        Update: {
          created_at?: string
          diamond_id?: string
          id?: string
          share_url?: string
          shared_by?: number
          stock_number?: string
        }
        Relationships: []
      }
      diamond_story_shares: {
        Row: {
          clicks_count: number | null
          conversions_count: number | null
          created_at: string
          deep_link: string
          diamond_stock_number: string
          id: string
          share_type: string
          shared_by_name: string | null
          shared_by_telegram_id: number | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          clicks_count?: number | null
          conversions_count?: number | null
          created_at?: string
          deep_link: string
          diamond_stock_number: string
          id?: string
          share_type?: string
          shared_by_name?: string | null
          shared_by_telegram_id?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          clicks_count?: number | null
          conversions_count?: number | null
          created_at?: string
          deep_link?: string
          diamond_stock_number?: string
          id?: string
          share_type?: string
          shared_by_name?: string | null
          shared_by_telegram_id?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      diamond_views: {
        Row: {
          device_type: string | null
          diamond_id: string
          id: string
          interactions: Json | null
          last_interaction: string | null
          referrer: string | null
          reshared: boolean | null
          session_id: string
          total_view_time: number | null
          user_agent: string | null
          view_start: string
          viewer_telegram_id: number | null
        }
        Insert: {
          device_type?: string | null
          diamond_id: string
          id?: string
          interactions?: Json | null
          last_interaction?: string | null
          referrer?: string | null
          reshared?: boolean | null
          session_id: string
          total_view_time?: number | null
          user_agent?: string | null
          view_start?: string
          viewer_telegram_id?: number | null
        }
        Update: {
          device_type?: string | null
          diamond_id?: string
          id?: string
          interactions?: Json | null
          last_interaction?: string | null
          referrer?: string | null
          reshared?: boolean | null
          session_id?: string
          total_view_time?: number | null
          user_agent?: string | null
          view_start?: string
          viewer_telegram_id?: number | null
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
      error_reports: {
        Row: {
          additional_context: Json | null
          created_at: string
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          severity: string
          timestamp: string
          updated_at: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          additional_context?: Json | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          severity: string
          timestamp?: string
          updated_at?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          additional_context?: Json | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          severity?: string
          timestamp?: string
          updated_at?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      group_cta_clicks: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          fastapi_response: Json | null
          id: string
          registration_attempted: boolean | null
          registration_error: string | null
          registration_success: boolean | null
          registration_token: string | null
          source_group_id: number | null
          start_parameter: string
          telegram_id: number
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          fastapi_response?: Json | null
          id?: string
          registration_attempted?: boolean | null
          registration_error?: string | null
          registration_success?: boolean | null
          registration_token?: string | null
          source_group_id?: number | null
          start_parameter: string
          telegram_id: number
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          fastapi_response?: Json | null
          id?: string
          registration_attempted?: boolean | null
          registration_error?: string | null
          registration_success?: boolean | null
          registration_token?: string | null
          source_group_id?: number | null
          start_parameter?: string
          telegram_id?: number
          user_agent?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          certificate_comment: string | null
          certificate_image_url: string | null
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
          gem360_url: string | null
          gia_report_pdf: string | null
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
          v360_url: string | null
          video_url: string | null
          weight: number
          width: number | null
        }
        Insert: {
          certificate_comment?: string | null
          certificate_image_url?: string | null
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
          gem360_url?: string | null
          gia_report_pdf?: string | null
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
          v360_url?: string | null
          video_url?: string | null
          weight: number
          width?: number | null
        }
        Update: {
          certificate_comment?: string | null
          certificate_image_url?: string | null
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
          gem360_url?: string | null
          gia_report_pdf?: string | null
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
          v360_url?: string | null
          video_url?: string | null
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
      match_notifications: {
        Row: {
          buyer_id: number
          confidence_score: number | null
          created_at: string
          details_json: Json | null
          diamond_id: string
          id: string
          is_match: boolean
          seller_id: number
          updated_at: string
        }
        Insert: {
          buyer_id: number
          confidence_score?: number | null
          created_at?: string
          details_json?: Json | null
          diamond_id: string
          id?: string
          is_match?: boolean
          seller_id: number
          updated_at?: string
        }
        Update: {
          buyer_id?: number
          confidence_score?: number | null
          created_at?: string
          details_json?: Json | null
          diamond_id?: string
          id?: string
          is_match?: boolean
          seller_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      meshy_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          gpt_prompt: string | null
          id: string
          job_type: string
          meshy_task_id: string
          processing_started_at: string
          ring_order_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          gpt_prompt?: string | null
          id?: string
          job_type?: string
          meshy_task_id: string
          processing_started_at?: string
          ring_order_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          gpt_prompt?: string | null
          id?: string
          job_type?: string
          meshy_task_id?: string
          processing_started_at?: string
          ring_order_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meshy_jobs_ring_order_id_fkey"
            columns: ["ring_order_id"]
            isOneToOne: false
            referencedRelation: "ring_orders"
            referencedColumns: ["id"]
          },
        ]
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
          time_spent: unknown
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
          time_spent?: unknown
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
          time_spent?: unknown
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
      retention_campaigns: {
        Row: {
          campaign_type: string
          created_at: string | null
          days_since_signup: number | null
          has_inventory: boolean | null
          id: string
          is_paying: boolean | null
          message_content: string
          sent_at: string | null
          user_telegram_id: number
        }
        Insert: {
          campaign_type: string
          created_at?: string | null
          days_since_signup?: number | null
          has_inventory?: boolean | null
          id?: string
          is_paying?: boolean | null
          message_content: string
          sent_at?: string | null
          user_telegram_id: number
        }
        Update: {
          campaign_type?: string
          created_at?: string | null
          days_since_signup?: number | null
          has_inventory?: boolean | null
          id?: string
          is_paying?: boolean | null
          message_content?: string
          sent_at?: string | null
          user_telegram_id?: number
        }
        Relationships: []
      }
      ring_assets: {
        Row: {
          created_at: string
          frame_sequence: string[] | null
          glb_url: string | null
          id: string
          meshy_job_id: string | null
          ring_order_id: string | null
          thumbnail_url: string | null
          turntable_gif_url: string | null
          updated_at: string
          usdz_url: string | null
        }
        Insert: {
          created_at?: string
          frame_sequence?: string[] | null
          glb_url?: string | null
          id?: string
          meshy_job_id?: string | null
          ring_order_id?: string | null
          thumbnail_url?: string | null
          turntable_gif_url?: string | null
          updated_at?: string
          usdz_url?: string | null
        }
        Update: {
          created_at?: string
          frame_sequence?: string[] | null
          glb_url?: string | null
          id?: string
          meshy_job_id?: string | null
          ring_order_id?: string | null
          thumbnail_url?: string | null
          turntable_gif_url?: string | null
          updated_at?: string
          usdz_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ring_assets_meshy_job_id_fkey"
            columns: ["meshy_job_id"]
            isOneToOne: false
            referencedRelation: "meshy_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ring_assets_ring_order_id_fkey"
            columns: ["ring_order_id"]
            isOneToOne: false
            referencedRelation: "ring_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ring_orders: {
        Row: {
          budget_currency: string
          budget_max: number
          budget_min: number
          created_at: string
          crown_head: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_telegram_id: number
          diamond_shape: string | null
          gpt_style_prompt: string | null
          id: string
          lead_status: string
          ring_material: string
          ring_style_description: string | null
          ring_style_tags: string[] | null
          selected_diamond_id: string | null
          selected_diamond_stock_number: string | null
          updated_at: string
        }
        Insert: {
          budget_currency?: string
          budget_max: number
          budget_min: number
          created_at?: string
          crown_head?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_telegram_id: number
          diamond_shape?: string | null
          gpt_style_prompt?: string | null
          id?: string
          lead_status?: string
          ring_material: string
          ring_style_description?: string | null
          ring_style_tags?: string[] | null
          selected_diamond_id?: string | null
          selected_diamond_stock_number?: string | null
          updated_at?: string
        }
        Update: {
          budget_currency?: string
          budget_max?: number
          budget_min?: number
          created_at?: string
          crown_head?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_telegram_id?: number
          diamond_shape?: string | null
          gpt_style_prompt?: string | null
          id?: string
          lead_status?: string
          ring_material?: string
          ring_style_description?: string | null
          ring_style_tags?: string[] | null
          selected_diamond_id?: string | null
          selected_diamond_stock_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sftp_requests: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string | null
          notes: string | null
          processed_at: string | null
          requested_at: string
          status: string
          telegram_id: number
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: string
          last_name?: string | null
          notes?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          telegram_id: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string | null
          notes?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          telegram_id?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      store_item_analytics: {
        Row: {
          created_at: string
          device_type: string | null
          diamond_stock_number: string
          event_type: string
          id: string
          scroll_position: number | null
          session_id: string
          timestamp: string
          user_telegram_id: number | null
          view_duration_seconds: number | null
          viewport_percentage: number | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          diamond_stock_number: string
          event_type: string
          id?: string
          scroll_position?: number | null
          session_id: string
          timestamp?: string
          user_telegram_id?: number | null
          view_duration_seconds?: number | null
          viewport_percentage?: number | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          diamond_stock_number?: string
          event_type?: string
          id?: string
          scroll_position?: number | null
          session_id?: string
          timestamp?: string
          user_telegram_id?: number | null
          view_duration_seconds?: number | null
          viewport_percentage?: number | null
        }
        Relationships: []
      }
      store_item_reshares: {
        Row: {
          created_at: string | null
          id: string
          original_share_id: string | null
          reshare_type: string
          reshared_by_telegram_id: number
          reshared_to_telegram_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          original_share_id?: string | null
          reshare_type: string
          reshared_by_telegram_id: number
          reshared_to_telegram_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          original_share_id?: string | null
          reshare_type?: string
          reshared_by_telegram_id?: number
          reshared_to_telegram_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "store_item_reshares_original_share_id_fkey"
            columns: ["original_share_id"]
            isOneToOne: false
            referencedRelation: "store_item_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      store_item_shares: {
        Row: {
          created_at: string | null
          diamond_stock_number: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          owner_telegram_id: number
          share_type: string
          share_url: string
          shared_with_telegram_id: number | null
        }
        Insert: {
          created_at?: string | null
          diamond_stock_number: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_telegram_id: number
          share_type: string
          share_url: string
          shared_with_telegram_id?: number | null
        }
        Update: {
          created_at?: string | null
          diamond_stock_number?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_telegram_id?: number
          share_type?: string
          share_url?: string
          shared_with_telegram_id?: number | null
        }
        Relationships: []
      }
      store_item_views: {
        Row: {
          created_at: string | null
          device_info: Json | null
          diamond_stock_number: string
          id: string
          session_id: string | null
          share_id: string | null
          total_view_duration_seconds: number | null
          view_ended_at: string | null
          view_started_at: string | null
          viewer_telegram_id: number | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          diamond_stock_number: string
          id?: string
          session_id?: string | null
          share_id?: string | null
          total_view_duration_seconds?: number | null
          view_ended_at?: string | null
          view_started_at?: string | null
          viewer_telegram_id?: number | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          diamond_stock_number?: string
          id?: string
          session_id?: string | null
          share_id?: string | null
          total_view_duration_seconds?: number | null
          view_ended_at?: string | null
          view_started_at?: string | null
          viewer_telegram_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "store_item_views_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "store_item_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_attempts: {
        Row: {
          attempted_at: string
          created_at: string
          has_subscription: boolean
          id: string
          telegram_id: number
          trial_expired: boolean
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          has_subscription: boolean
          id?: string
          telegram_id: number
          trial_expired: boolean
        }
        Update: {
          attempted_at?: string
          created_at?: string
          has_subscription?: boolean
          id?: string
          telegram_id?: number
          trial_expired?: boolean
        }
        Relationships: []
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
      telegram_button_clicks: {
        Row: {
          button_id: string
          button_label: string
          clicked_at: string
          created_at: string
          id: string
          session_duration_seconds: number | null
          target_page: string
          telegram_user_id: number
          user_first_name: string | null
          user_username: string | null
        }
        Insert: {
          button_id: string
          button_label: string
          clicked_at?: string
          created_at?: string
          id?: string
          session_duration_seconds?: number | null
          target_page: string
          telegram_user_id: number
          user_first_name?: string | null
          user_username?: string | null
        }
        Update: {
          button_id?: string
          button_label?: string
          clicked_at?: string
          created_at?: string
          id?: string
          session_duration_seconds?: number | null
          target_page?: string
          telegram_user_id?: number
          user_first_name?: string | null
          user_username?: string | null
        }
        Relationships: []
      }
      telegram_diamond_views: {
        Row: {
          created_at: string | null
          diamond_stock_number: string
          id: string
          referrer_data: Json | null
          source: string | null
          viewed_at: string | null
          viewer_telegram_id: number
        }
        Insert: {
          created_at?: string | null
          diamond_stock_number: string
          id?: string
          referrer_data?: Json | null
          source?: string | null
          viewed_at?: string | null
          viewer_telegram_id: number
        }
        Update: {
          created_at?: string | null
          diamond_stock_number?: string
          id?: string
          referrer_data?: Json | null
          source?: string | null
          viewed_at?: string | null
          viewer_telegram_id?: number
        }
        Relationships: []
      }
      telegram_group_campaigns: {
        Row: {
          campaign_name: string
          created_at: string
          id: string
          message_id: number | null
          message_text: string
          sent_at: string
          sent_by_telegram_id: number
          target_group_id: number
          total_clicks: number | null
          unique_users_clicked: number | null
          updated_at: string
        }
        Insert: {
          campaign_name: string
          created_at?: string
          id?: string
          message_id?: number | null
          message_text: string
          sent_at?: string
          sent_by_telegram_id: number
          target_group_id: number
          total_clicks?: number | null
          unique_users_clicked?: number | null
          updated_at?: string
        }
        Update: {
          campaign_name?: string
          created_at?: string
          id?: string
          message_id?: number | null
          message_text?: string
          sent_at?: string
          sent_by_telegram_id?: number
          target_group_id?: number
          total_clicks?: number | null
          unique_users_clicked?: number | null
          updated_at?: string
        }
        Relationships: []
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
      upload_errors: {
        Row: {
          column_name: string | null
          created_at: string
          error_message: string
          error_type: string
          id: string
          raw_data: Json | null
          row_number: number | null
          upload_job_id: string
        }
        Insert: {
          column_name?: string | null
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          raw_data?: Json | null
          row_number?: number | null
          upload_job_id: string
        }
        Update: {
          column_name?: string | null
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          raw_data?: Json | null
          row_number?: number | null
          upload_job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_errors_upload_job_id_fkey"
            columns: ["upload_job_id"]
            isOneToOne: false
            referencedRelation: "upload_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_jobs: {
        Row: {
          created_at: string
          diamonds_failed: number | null
          diamonds_processed: number | null
          error_message: string | null
          file_size_bytes: number | null
          filename: string
          id: string
          processing_completed_at: string | null
          processing_started_at: string | null
          status: string
          updated_at: string
          user_id: number
        }
        Insert: {
          created_at?: string
          diamonds_failed?: number | null
          diamonds_processed?: number | null
          error_message?: string | null
          file_size_bytes?: number | null
          filename: string
          id?: string
          processing_completed_at?: string | null
          processing_started_at?: string | null
          status?: string
          updated_at?: string
          user_id: number
        }
        Update: {
          created_at?: string
          diamonds_failed?: number | null
          diamonds_processed?: number | null
          error_message?: string | null
          file_size_bytes?: number | null
          filename?: string
          id?: string
          processing_completed_at?: string | null
          processing_started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: number
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
          total_time_spent: unknown
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
          total_time_spent?: unknown
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
          total_time_spent?: unknown
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
          total_time_spent: unknown
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
          total_time_spent?: unknown
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
          total_time_spent?: unknown
          updated_at?: string | null
          uploads_count?: number | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          category: string
          created_at: string | null
          feedback_type: string
          id: string
          message: string | null
          metadata: Json | null
          rating: number | null
          telegram_id: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          feedback_type: string
          id?: string
          message?: string | null
          metadata?: Json | null
          rating?: number | null
          telegram_id: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          feedback_type?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          rating?: number | null
          telegram_id?: number
          updated_at?: string | null
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
          last_active: string | null
          last_login: string | null
          last_name: string | null
          notes: string | null
          payment_status: string | null
          phone_number: string | null
          photo_url: string | null
          shares_remaining: number
          status: string | null
          subscription_plan: string | null
          telegram_id: number
          timezone: string | null
          trial_expires_at: string | null
          trial_started_at: string | null
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
          last_active?: string | null
          last_login?: string | null
          last_name?: string | null
          notes?: string | null
          payment_status?: string | null
          phone_number?: string | null
          photo_url?: string | null
          shares_remaining?: number
          status?: string | null
          subscription_plan?: string | null
          telegram_id: number
          timezone?: string | null
          trial_expires_at?: string | null
          trial_started_at?: string | null
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
          last_active?: string | null
          last_login?: string | null
          last_name?: string | null
          notes?: string | null
          payment_status?: string | null
          phone_number?: string | null
          photo_url?: string | null
          shares_remaining?: number
          status?: string | null
          subscription_plan?: string | null
          telegram_id?: number
          timezone?: string | null
          trial_expires_at?: string | null
          trial_started_at?: string | null
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
          total_duration: unknown
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
          total_duration?: unknown
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
          total_duration?: unknown
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
      user_share_history: {
        Row: {
          analytics_data: Json
          created_at: string
          diamond_stock_number: string
          id: string
          share_type: string
          shares_remaining_after: number
          user_telegram_id: number
        }
        Insert: {
          analytics_data?: Json
          created_at?: string
          diamond_stock_number: string
          id?: string
          share_type?: string
          shares_remaining_after: number
          user_telegram_id: number
        }
        Update: {
          analytics_data?: Json
          created_at?: string
          diamond_stock_number?: string
          id?: string
          share_type?: string
          shares_remaining_after?: number
          user_telegram_id?: number
        }
        Relationships: []
      }
      user_share_quotas: {
        Row: {
          created_at: string
          id: string
          quota_reset_at: string | null
          shares_granted: number
          shares_used: number
          updated_at: string
          user_telegram_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          quota_reset_at?: string | null
          shares_granted?: number
          shares_used?: number
          updated_at?: string
          user_telegram_id: number
        }
        Update: {
          created_at?: string
          id?: string
          quota_reset_at?: string | null
          shares_granted?: number
          shares_used?: number
          updated_at?: string
          user_telegram_id?: number
        }
        Relationships: []
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
      diamond_view_analytics: {
        Row: {
          diamond_stock_number: string | null
          last_viewed_at: string | null
          total_views: number | null
          unique_viewers: number | null
          view_date: string | null
        }
        Relationships: []
      }
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
          p_certificate_url: string
          p_clarity: string
          p_color: string
          p_cut: string
          p_picture: string
          p_polish: string
          p_price_per_carat: number
          p_shape: string
          p_status: string
          p_stock_number: string
          p_symmetry: string
          p_user_id: number
          p_weight: number
        }
        Returns: boolean
      }
      check_certificate_exists: {
        Args: { p_certificate_number: number; p_user_id: number }
        Returns: boolean
      }
      check_is_admin_role: {
        Args: { check_telegram_id: number }
        Returns: boolean
      }
      check_is_super_admin: {
        Args: { check_telegram_id: number }
        Returns: boolean
      }
      clean_expired_cache: { Args: never; Returns: undefined }
      create_auction_with_context: {
        Args: {
          p_currency: string
          p_ends_at: string
          p_min_increment: number
          p_seller_telegram_id: number
          p_starting_price: number
          p_stock_number: string
        }
        Returns: Json
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
      expire_auctions: { Args: never; Returns: number }
      expire_keshett_agreements: { Args: never; Returns: number }
      get_ai_recommendations: {
        Args: { p_context_type?: string; p_user_telegram_id: number }
        Returns: {
          confidence: number
          pattern_type: string
          recommendation: Json
        }[]
      }
      get_auction_stats: { Args: { auction_id_param: string }; Returns: Json }
      get_bot_usage_summary: {
        Args: never
        Returns: {
          active_chats: number
          avg_response_time_ms: number
          bot_distribution: Json
          commands_used_today: number
          most_used_commands: Json
          total_messages_today: number
          unique_users_today: number
        }[]
      }
      get_current_user_telegram_id: { Args: never; Returns: number }
      get_public_diamond_count: { Args: never; Returns: number }
      get_realistic_analytics_summary: {
        Args: never
        Returns: {
          active_users_last_hour: number
          avg_session_duration_seconds: number
          today_views: number
          total_page_views: number
          total_sessions: number
          total_users: number
        }[]
      }
      get_user_statistics: {
        Args: never
        Returns: {
          active_users: number
          blocked_users: number
          premium_users: number
          recent_signups: number
          total_users: number
          users_with_phone: number
        }[]
      }
      is_admin: { Args: { telegram_id_param: number }; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_trial_active: { Args: { p_telegram_id: number }; Returns: boolean }
      log_admin_action: {
        Args: {
          action_param: string
          admin_telegram_id_param: number
          metadata_param?: Json
          resource_id_param?: string
          resource_type_param?: string
        }
        Returns: undefined
      }
      log_subscription_attempt: {
        Args: {
          p_has_subscription: boolean
          p_telegram_id: number
          p_trial_expired: boolean
        }
        Returns: undefined
      }
      remove_all_duplicate_certificates: { Args: never; Returns: number }
      remove_duplicate_certificates: {
        Args: { p_user_id: number }
        Returns: number
      }
      set_admin_session_context: {
        Args: { telegram_id_param: number }
        Returns: undefined
      }
      set_session_context: {
        Args: { key: string; value: string }
        Returns: undefined
      }
      set_user_context: { Args: { telegram_id: number }; Returns: undefined }
      update_ai_learning_pattern: {
        Args: {
          p_pattern_data: Json
          p_pattern_type: string
          p_success_score?: number
          p_user_telegram_id: number
        }
        Returns: string
      }
      update_diamond_for_user: {
        Args: { p_stock_number: string; p_update_data: Json; p_user_id: number }
        Returns: boolean
      }
      use_share_quota: {
        Args: { p_diamond_stock_number: string; p_user_telegram_id: number }
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
