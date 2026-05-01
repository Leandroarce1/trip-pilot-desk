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
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_country: string | null
          number: string | null
          type: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_country?: string | null
          number?: string | null
          type: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_country?: string | null
          number?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          miles: Json | null
          name: string
          notes: string | null
          phone: string | null
          preferences: Json | null
          profile: Json | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          miles?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          profile?: Json | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          miles?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          profile?: Json | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          active: boolean
          best_season: string | null
          city: string
          country: string
          created_at: string
          flag: string | null
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          best_season?: string | null
          city: string
          country: string
          created_at?: string
          flag?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          best_season?: string | null
          city?: string
          country?: string
          created_at?: string
          flag?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flights: {
        Row: {
          airline: string | null
          checkin_alert: boolean
          client_id: string | null
          created_at: string
          departure_date: string | null
          departure_time: string | null
          destination: string | null
          flight_number: string | null
          id: string
          origin: string | null
          package_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          airline?: string | null
          checkin_alert?: boolean
          client_id?: string | null
          created_at?: string
          departure_date?: string | null
          departure_time?: string | null
          destination?: string | null
          flight_number?: string | null
          id?: string
          origin?: string | null
          package_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          airline?: string | null
          checkin_alert?: boolean
          client_id?: string | null
          created_at?: string
          departure_date?: string | null
          departure_time?: string | null
          destination?: string | null
          flight_number?: string | null
          id?: string
          origin?: string | null
          package_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flights_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flights_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          created_at: string
          days: Json
          id: string
          package_id: string | null
          quote_id: string | null
          shareable_slug: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days?: Json
          id?: string
          package_id?: string | null
          quote_id?: string | null
          shareable_slug?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days?: Json
          id?: string
          package_id?: string | null
          quote_id?: string | null
          shareable_slug?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itineraries_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          date: string
          id: string
          message: string | null
          read: boolean
          related_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          message?: string | null
          read?: boolean
          related_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          message?: string | null
          read?: boolean
          related_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          client_id: string | null
          created_at: string
          destination: string | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          notes: string | null
          position: number
          probability: number | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          destination?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          position?: number
          probability?: number | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          destination?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          position?: number
          probability?: number | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          client_id: string | null
          commission_percent: number | null
          confirmation_code: string | null
          created_at: string
          departure_date: string | null
          destination_city: string | null
          destination_country: string | null
          destination_flag: string | null
          documents: Json | null
          history: Json | null
          id: string
          name: string
          notes: string | null
          passengers: Json | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          quote_id: string | null
          reservation_status: Database["public"]["Enums"]["reservation_status"]
          return_date: string | null
          supplier: string | null
          supplier_id: string | null
          total_value: number | null
          trip_type: Database["public"]["Enums"]["trip_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          commission_percent?: number | null
          confirmation_code?: string | null
          created_at?: string
          departure_date?: string | null
          destination_city?: string | null
          destination_country?: string | null
          destination_flag?: string | null
          documents?: Json | null
          history?: Json | null
          id?: string
          name: string
          notes?: string | null
          passengers?: Json | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quote_id?: string | null
          reservation_status?: Database["public"]["Enums"]["reservation_status"]
          return_date?: string | null
          supplier?: string | null
          supplier_id?: string | null
          total_value?: number | null
          trip_type?: Database["public"]["Enums"]["trip_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          commission_percent?: number | null
          confirmation_code?: string | null
          created_at?: string
          departure_date?: string | null
          destination_city?: string | null
          destination_country?: string | null
          destination_flag?: string | null
          documents?: Json | null
          history?: Json | null
          id?: string
          name?: string
          notes?: string | null
          passengers?: Json | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quote_id?: string | null
          reservation_status?: Database["public"]["Enums"]["reservation_status"]
          return_date?: string | null
          supplier?: string | null
          supplier_id?: string | null
          total_value?: number | null
          trip_type?: Database["public"]["Enums"]["trip_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          base_price: number | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          supplier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          base_price?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          supplier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          base_price?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          destination: string
          end_date: string | null
          id: string
          items: Json | null
          itinerary: Json | null
          margin_percent: number | null
          opportunity_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          destination: string
          end_date?: string | null
          id?: string
          items?: Json | null
          itinerary?: Json | null
          margin_percent?: number | null
          opportunity_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          destination?: string
          end_date?: string | null
          id?: string
          items?: Json | null
          itinerary?: Json | null
          margin_percent?: number | null
          opportunity_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          access_notes: string | null
          active: boolean
          category: Database["public"]["Enums"]["supplier_category"]
          cnpj: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          default_commission: number | null
          id: string
          name: string
          notes: string | null
          payment_term: string | null
          rating: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          access_notes?: string | null
          active?: boolean
          category?: Database["public"]["Enums"]["supplier_category"]
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          default_commission?: number | null
          id?: string
          name: string
          notes?: string | null
          payment_term?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          access_notes?: string | null
          active?: boolean
          category?: Database["public"]["Enums"]["supplier_category"]
          cnpj?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          default_commission?: number | null
          id?: string
          name?: string
          notes?: string | null
          payment_term?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          related_client_id: string | null
          related_package_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_client_id?: string | null
          related_package_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_client_id?: string | null
          related_package_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_related_client_id_fkey"
            columns: ["related_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_package_id_fkey"
            columns: ["related_package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          category: string | null
          client_id: string | null
          created_at: string
          date: string
          description: string
          id: string
          package_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          package_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          package_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          confirmation_code: string | null
          created_at: string
          details: Json | null
          id: string
          issued: boolean
          notes: string | null
          package_id: string | null
          service_date: string | null
          supplier: string | null
          title: string
          type: Database["public"]["Enums"]["voucher_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmation_code?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          issued?: boolean
          notes?: string | null
          package_id?: string | null
          service_date?: string | null
          supplier?: string | null
          title: string
          type?: Database["public"]["Enums"]["voucher_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmation_code?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          issued?: boolean
          notes?: string | null
          package_id?: string | null
          service_date?: string | null
          supplier?: string | null
          title?: string
          type?: Database["public"]["Enums"]["voucher_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      client_status: "lead" | "negotiation" | "sold" | "postSale" | "recurring"
      flight_class: "economy" | "business" | "first"
      gender_type: "male" | "female" | "unspecified"
      notification_type: "checkin" | "payment" | "departure" | "general"
      opportunity_stage:
        | "new"
        | "contact"
        | "proposal"
        | "closed_won"
        | "closed_lost"
      origin_channel:
        | "referral"
        | "instagram"
        | "google"
        | "whatsapp"
        | "in-person"
        | "other"
      payment_status: "pending" | "partial" | "paid"
      quote_status: "sent" | "approved" | "cancelled" | "draft" | "lost"
      reservation_status: "quoting" | "pending" | "confirmed" | "cancelled"
      seat_preference: "window" | "aisle" | "none"
      supplier_category:
        | "airline"
        | "hotel"
        | "operator"
        | "cruise"
        | "insurance"
        | "carRental"
        | "transfer"
        | "other"
      task_priority: "low" | "medium" | "high"
      task_status: "todo" | "in_progress" | "done"
      transaction_status: "paid" | "pending"
      transaction_type: "income" | "expense"
      trip_type: "air" | "package" | "cruise" | "road" | "hotel"
      voucher_type:
        | "hotel"
        | "transfer"
        | "tour"
        | "ticket"
        | "insurance"
        | "other"
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
      client_status: ["lead", "negotiation", "sold", "postSale", "recurring"],
      flight_class: ["economy", "business", "first"],
      gender_type: ["male", "female", "unspecified"],
      notification_type: ["checkin", "payment", "departure", "general"],
      opportunity_stage: [
        "new",
        "contact",
        "proposal",
        "closed_won",
        "closed_lost",
      ],
      origin_channel: [
        "referral",
        "instagram",
        "google",
        "whatsapp",
        "in-person",
        "other",
      ],
      payment_status: ["pending", "partial", "paid"],
      quote_status: ["sent", "approved", "cancelled", "draft", "lost"],
      reservation_status: ["quoting", "pending", "confirmed", "cancelled"],
      seat_preference: ["window", "aisle", "none"],
      supplier_category: [
        "airline",
        "hotel",
        "operator",
        "cruise",
        "insurance",
        "carRental",
        "transfer",
        "other",
      ],
      task_priority: ["low", "medium", "high"],
      task_status: ["todo", "in_progress", "done"],
      transaction_status: ["paid", "pending"],
      transaction_type: ["income", "expense"],
      trip_type: ["air", "package", "cruise", "road", "hotel"],
      voucher_type: [
        "hotel",
        "transfer",
        "tour",
        "ticket",
        "insurance",
        "other",
      ],
    },
  },
} as const
