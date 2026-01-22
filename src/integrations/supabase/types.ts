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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          entity_id: string | null
          id: string
          is_primary: boolean
          label: string
          state: string | null
          street: string
          type: string
          updated_at: string
          zip: string | null
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          entity_id?: string | null
          id?: string
          is_primary?: boolean
          label: string
          state?: string | null
          street: string
          type?: string
          updated_at?: string
          zip?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          entity_id?: string | null
          id?: string
          is_primary?: boolean
          label?: string
          state?: string | null
          street?: string
          type?: string
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_number: string
          bank: string
          created_at: string
          currency: string
          entity_id: string | null
          id: string
          name: string
          routing_number: string | null
          type: string
          updated_at: string
        }
        Insert: {
          account_number: string
          bank: string
          created_at?: string
          currency?: string
          entity_id?: string | null
          id?: string
          name: string
          routing_number?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          account_number?: string
          bank?: string
          created_at?: string
          currency?: string
          entity_id?: string | null
          id?: string
          name?: string
          routing_number?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          ai_summary: string | null
          created_at: string
          end_date: string | null
          entity_id: string | null
          file_name: string | null
          file_path: string | null
          id: string
          parties: string[]
          start_date: string | null
          status: string
          summary_generated_at: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          end_date?: string | null
          entity_id?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          parties?: string[]
          start_date?: string | null
          status?: string
          summary_generated_at?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          end_date?: string | null
          entity_id?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          parties?: string[]
          start_date?: string | null
          status?: string
          summary_generated_at?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          card_color: string
          card_number: string
          cardholder_name: string | null
          created_at: string
          credit_limit: number
          due_date: string | null
          entity_id: string | null
          expiry_date: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          card_color?: string
          card_number: string
          cardholder_name?: string | null
          created_at?: string
          credit_limit?: number
          due_date?: string | null
          entity_id?: string | null
          expiry_date?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          card_color?: string
          card_number?: string
          cardholder_name?: string | null
          created_at?: string
          credit_limit?: number
          due_date?: string | null
          entity_id?: string | null
          expiry_date?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string
          duns_number: string | null
          ein_tax_id: string | null
          email: string | null
          founded_date: string | null
          id: string
          is_verified: boolean
          jurisdiction: string | null
          name: string
          phone: string | null
          registration_number: string | null
          status: string
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          duns_number?: string | null
          ein_tax_id?: string | null
          email?: string | null
          founded_date?: string | null
          id?: string
          is_verified?: boolean
          jurisdiction?: string | null
          name: string
          phone?: string | null
          registration_number?: string | null
          status?: string
          type?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          duns_number?: string | null
          ein_tax_id?: string | null
          email?: string | null
          founded_date?: string | null
          id?: string
          is_verified?: boolean
          jurisdiction?: string | null
          name?: string
          phone?: string | null
          registration_number?: string | null
          status?: string
          type?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      issuing_authorities: {
        Row: {
          country: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          country_code: string
          created_at: string
          entity_id: string
          id: string
          is_primary: boolean
          label: string
          phone_number: string
          purpose: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          entity_id: string
          id?: string
          is_primary?: boolean
          label?: string
          phone_number: string
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          entity_id?: string
          id?: string
          is_primary?: boolean
          label?: string
          phone_number?: string
          purpose?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_accounts: {
        Row: {
          color: string
          created_at: string
          followers: string | null
          icon: string | null
          id: string
          is_verified: boolean
          platform: string
          profile_url: string | null
          updated_at: string
          username: string
        }
        Insert: {
          color?: string
          created_at?: string
          followers?: string | null
          icon?: string | null
          id?: string
          is_verified?: boolean
          platform: string
          profile_url?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          color?: string
          created_at?: string
          followers?: string | null
          icon?: string | null
          id?: string
          is_verified?: boolean
          platform?: string
          profile_url?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      tax_id_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          label: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      tax_ids: {
        Row: {
          authority: string
          country: string
          created_at: string
          entity_id: string
          expiry_date: string | null
          id: string
          is_primary: boolean
          issued_date: string | null
          notes: string | null
          tax_id_number: string
          type: string
          updated_at: string
        }
        Insert: {
          authority: string
          country?: string
          created_at?: string
          entity_id: string
          expiry_date?: string | null
          id?: string
          is_primary?: boolean
          issued_date?: string | null
          notes?: string | null
          tax_id_number: string
          type?: string
          updated_at?: string
        }
        Update: {
          authority?: string
          country?: string
          created_at?: string
          entity_id?: string
          expiry_date?: string | null
          id?: string
          is_primary?: boolean
          issued_date?: string | null
          notes?: string | null
          tax_id_number?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_ids_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
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
