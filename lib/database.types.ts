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
      app_config: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          created_at: string
          icon_url: string | null
          id: string
          name: string
          symbol: string
          type: "crypto" | "fiat"
        }
        Insert: {
          created_at?: string
          icon_url?: string | null
          id?: string
          name: string
          symbol: string
          type: "crypto" | "fiat"
        }
        Update: {
          created_at?: string
          icon_url?: string | null
          id?: string
          name?: string
          symbol?: string
          type?: "crypto" | "fiat"
        }
        Relationships: []
      }
      exchange_pairs: {
        Row: {
          created_at: string | null
          fee: number
          fee_type: string
          from: string
          id: string
          payment_method_id: string | null
          to: string
        }
        Insert: {
          created_at?: string | null
          fee: number
          fee_type: string
          from: string
          id?: string
          payment_method_id?: string | null
          to: string
        }
        Update: {
          created_at?: string | null
          fee?: number
          fee_type?: string
          from?: string
          id?: string
          payment_method_id?: string | null
          to?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_pairs_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      exchanges: {
        Row: {
          created_at: string
          exchange_id: string
          fee_amount: number
          fee_details: string
          from_currency: string
          id: string
          payment_method_id: string | null
          receive_amount: number
          recipient_wallet_address: string | null
          send_amount: number
          status: string
          to_currency: string
          user_id: string | null
          usd_value: number | null
        }
        Insert: {
          created_at?: string
          exchange_id?: string
          fee_amount: number
          fee_details: string
          from_currency: string
          id?: string
          payment_method_id?: string | null
          receive_amount: number
          recipient_wallet_address?: string | null
          send_amount: number
          status?: string
          to_currency: string
          user_id?: string | null
          usd_value?: number | null
        }
        Update: {
          created_at?: string
          exchange_id?: string
          fee_amount?: number
          fee_details?: string
          from_currency?: string
          id?: string
          payment_method_id?: string | null
          receive_amount?: number
          recipient_wallet_address?: string | null
          send_amount?: number
          status?: string
          to_currency?: string
          user_id?: string | null
          usd_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exchanges_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchanges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          order: number
          question: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          order: number
          question: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          order?: number
          question?: string
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          order: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          order: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          order?: number
          title?: string
        }
        Relationships: []
      }
      how_it_works_steps: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          order: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          order: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          order?: number
          title?: string
        }
        Relationships: []
      }
      leadership_team: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          dribbble_url: string | null
          id: string
          linkedin_url: string | null
          metric_label: string | null
          metric_value: string | null
          name: string
          order: number
          title: string
          twitter_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          dribbble_url?: string | null
          id?: string
          linkedin_url?: string | null
          metric_label?: string | null
          metric_value?: string | null
          name: string
          order: number
          title: string
          twitter_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          dribbble_url?: string | null
          id?: string
          linkedin_url?: string | null
          metric_label?: string | null
          metric_value?: string | null
          name?: string
          order?: number
          title?: string
          twitter_url?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string
          detail_type: string
          details: string
          id: string
          method: string
          qr_code_url: string | null
        }
        Insert: {
          created_at?: string
          detail_type: string
          details: string
          id?: string
          method: string
          qr_code_url?: string | null
        }
        Update: {
          created_at?: string
          detail_type?: string
          details?: string
          id?: string
          method?: string
          qr_code_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author: string
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          order: number
          rating: number
          title: string
        }
        Insert: {
          author: string
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          order: number
          rating: number
          title: string
        }
        Update: {
          author?: string
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          order?: number
          rating?: number
          title?: string
        }
        Relationships: []
      }
      top_exchanges: {
        Row: {
          created_at: string
          from_currency_symbol: string
          id: string
          order: number
          to_currency_symbol: string
          volume: number
        }
        Insert: {
          created_at?: string
          from_currency_symbol: string
          id?: string
          order?: number
          to_currency_symbol: string
          volume: number
        }
        Update: {
          created_at?: string
          from_currency_symbol?: string
          id?: string
          order?: number
          to_currency_symbol?: string
          volume?: number
        }
        Relationships: []
      }
      top_traders: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          order: number
          title: string
          user_id: string | null
          volume: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          order: number
          title: string
          user_id?: string | null
          volume: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          order?: number
          title?: string
          user_id?: string | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "top_traders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          role_id: number
          user_id: string
        }
        Insert: {
          role_id: number
          user_id: string
        }
        Update: {
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_exchanges: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          created_at: string
          exchange_id: string
          from_currency: string
          to_currency: string
          send_amount: number
          receive_amount: number
          fee_amount: number
          fee_details: string
          status: string
          recipient_wallet_address: string | null
          payment_method_id: string | null
          user_id: string | null
          username: string | null
          email: string | null
          avatar_url: string | null
        }[]
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_exchange_details: {
        Args: {
          p_exchange_id: string
        }
        Returns: {
          exchange_data: Json
          payment_data: Json
        }
      }
      get_top_users_by_volume: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          username: string
          avatar_url: string
          total_volume: number
        }[]
      }
      get_user_exchanges: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
      get_users_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          username: string
          email: string
          avatar_url: string
          created_at: string
          roles: Json
        }[]
      }
      is_admin: {
        Args: {
          p_user_id: string
        }
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
