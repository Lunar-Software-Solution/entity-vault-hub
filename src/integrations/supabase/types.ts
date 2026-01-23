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
      accountant_firms: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          engagement_end_date: string | null
          engagement_start_date: string | null
          entity_id: string
          fee_structure: string | null
          id: string
          is_active: boolean
          license_number: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          specializations: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          license_number?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          specializations?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id?: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          license_number?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          specializations?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accountant_firms_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
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
      advisors: {
        Row: {
          address: string | null
          advisor_type: string | null
          certifications: string[] | null
          contact_name: string | null
          created_at: string
          email: string | null
          engagement_end_date: string | null
          engagement_start_date: string | null
          entity_id: string
          fee_structure: string | null
          id: string
          is_active: boolean
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          advisor_type?: string | null
          certifications?: string[] | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          advisor_type?: string | null
          certifications?: string[] | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id?: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisors_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auditors: {
        Row: {
          address: string | null
          audit_types: string[] | null
          certifications: string[] | null
          contact_name: string | null
          created_at: string
          email: string | null
          engagement_end_date: string | null
          engagement_start_date: string | null
          entity_id: string
          fee_structure: string | null
          id: string
          is_active: boolean
          license_number: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          audit_types?: string[] | null
          certifications?: string[] | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          license_number?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          audit_types?: string[] | null
          certifications?: string[] | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id?: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          license_number?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditors_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_holder_name: string | null
          account_number: string
          bank: string
          bank_address: string | null
          bank_website: string | null
          created_at: string
          currency: string
          entity_id: string | null
          iban: string | null
          id: string
          is_primary: boolean | null
          name: string
          routing_number: string | null
          swift_bic: string | null
          type: string
          updated_at: string
        }
        Insert: {
          account_holder_name?: string | null
          account_number: string
          bank: string
          bank_address?: string | null
          bank_website?: string | null
          created_at?: string
          currency?: string
          entity_id?: string | null
          iban?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          routing_number?: string | null
          swift_bic?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string
          bank?: string
          bank_address?: string | null
          bank_website?: string | null
          created_at?: string
          currency?: string
          entity_id?: string | null
          iban?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          routing_number?: string | null
          swift_bic?: string | null
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
      consultants: {
        Row: {
          address: string | null
          consultant_type: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          engagement_end_date: string | null
          engagement_start_date: string | null
          entity_id: string
          fee_structure: string | null
          id: string
          is_active: boolean
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          project_scope: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          consultant_type?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          project_scope?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          consultant_type?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id?: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          project_scope?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultants_entity_id_fkey"
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
          issuer_website: string | null
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
          issuer_website?: string | null
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
          issuer_website?: string | null
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
      director_id_documents: {
        Row: {
          created_at: string
          director_id: string
          document_number: string | null
          document_type: string
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          director_id: string
          document_number?: string | null
          document_type: string
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          director_id?: string
          document_number?: string | null
          document_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "director_id_documents_director_id_fkey"
            columns: ["director_id"]
            isOneToOne: false
            referencedRelation: "directors_ubos"
            referencedColumns: ["id"]
          },
        ]
      }
      directors_ubos: {
        Row: {
          address: string | null
          appointment_date: string | null
          control_type: string | null
          country_of_residence: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          entity_id: string
          id: string
          id_document_file_name: string | null
          id_document_file_path: string | null
          id_document_number: string | null
          id_document_type: string | null
          id_expiry_date: string | null
          is_active: boolean | null
          is_pep: boolean | null
          is_primary: boolean | null
          name: string
          nationality: string | null
          notes: string | null
          ownership_percentage: number | null
          passport_number: string | null
          pep_details: string | null
          phone: string | null
          resignation_date: string | null
          role_type: string
          tax_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          appointment_date?: string | null
          control_type?: string | null
          country_of_residence?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          entity_id: string
          id?: string
          id_document_file_name?: string | null
          id_document_file_path?: string | null
          id_document_number?: string | null
          id_document_type?: string | null
          id_expiry_date?: string | null
          is_active?: boolean | null
          is_pep?: boolean | null
          is_primary?: boolean | null
          name: string
          nationality?: string | null
          notes?: string | null
          ownership_percentage?: number | null
          passport_number?: string | null
          pep_details?: string | null
          phone?: string | null
          resignation_date?: string | null
          role_type?: string
          tax_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          appointment_date?: string | null
          control_type?: string | null
          country_of_residence?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          entity_id?: string
          id?: string
          id_document_file_name?: string | null
          id_document_file_path?: string | null
          id_document_number?: string | null
          id_document_type?: string | null
          id_expiry_date?: string | null
          is_active?: boolean | null
          is_pep?: boolean | null
          is_primary?: boolean | null
          name?: string
          nationality?: string | null
          notes?: string | null
          ownership_percentage?: number | null
          passport_number?: string | null
          pep_details?: string | null
          phone?: string | null
          resignation_date?: string | null
          role_type?: string
          tax_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "directors_ubos_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_2fa_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      email_addresses: {
        Row: {
          created_at: string
          email: string
          entity_id: string | null
          id: string
          is_primary: boolean
          is_verified: boolean
          label: string
          mail_server_id: string | null
          purpose: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          entity_id?: string | null
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          label: string
          mail_server_id?: string | null
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          entity_id?: string | null
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          label?: string
          mail_server_id?: string | null
          purpose?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_addresses_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_email_mail_server"
            columns: ["mail_server_id"]
            isOneToOne: false
            referencedRelation: "mail_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string
          fiscal_year_end: string | null
          founded_date: string | null
          id: string
          jurisdiction: string | null
          name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fiscal_year_end?: string | null
          founded_date?: string | null
          id?: string
          jurisdiction?: string | null
          name: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fiscal_year_end?: string | null
          founded_date?: string | null
          id?: string
          jurisdiction?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      entity_documents: {
        Row: {
          ai_summary: string | null
          created_at: string
          document_type_id: string | null
          entity_id: string
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          id: string
          issued_date: string | null
          issuing_authority: string | null
          notes: string | null
          reference_number: string | null
          status: string
          summary_generated_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          document_type_id?: string | null
          entity_id: string
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          issued_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          reference_number?: string | null
          status?: string
          summary_generated_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          document_type_id?: string | null
          entity_id?: string
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          issued_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          reference_number?: string | null
          status?: string
          summary_generated_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_emails: {
        Row: {
          created_at: string
          email: string
          entity_id: string
          id: string
          is_primary: boolean | null
          label: string
          purpose: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          entity_id: string
          id?: string
          is_primary?: boolean | null
          label?: string
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          entity_id?: string
          id?: string
          is_primary?: boolean | null
          label?: string
          purpose?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_emails_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_filings: {
        Row: {
          amount: number | null
          confirmation_number: string | null
          created_at: string
          due_date: string
          due_day: number | null
          entity_id: string
          filed_by: string | null
          filing_date: string | null
          filing_type_id: string | null
          frequency: string
          id: string
          jurisdiction: string | null
          notes: string | null
          reminder_days: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          confirmation_number?: string | null
          created_at?: string
          due_date: string
          due_day?: number | null
          entity_id: string
          filed_by?: string | null
          filing_date?: string | null
          filing_type_id?: string | null
          frequency?: string
          id?: string
          jurisdiction?: string | null
          notes?: string | null
          reminder_days?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          confirmation_number?: string | null
          created_at?: string
          due_date?: string
          due_day?: number | null
          entity_id?: string
          filed_by?: string | null
          filing_date?: string | null
          filing_type_id?: string | null
          frequency?: string
          id?: string
          jurisdiction?: string | null
          notes?: string | null
          reminder_days?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_filings_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_filings_filing_type_id_fkey"
            columns: ["filing_type_id"]
            isOneToOne: false
            referencedRelation: "filing_types"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_provider_contracts: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          provider_id: string
          provider_type: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          provider_id: string
          provider_type: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          provider_id?: string
          provider_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_provider_contracts_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_software: {
        Row: {
          account_email: string | null
          category: string
          created_at: string
          custom_name: string | null
          entity_id: string
          id: string
          is_active: boolean | null
          license_expiry_date: string | null
          license_type: string | null
          login_url: string | null
          notes: string | null
          software_id: string | null
          updated_at: string
        }
        Insert: {
          account_email?: string | null
          category?: string
          created_at?: string
          custom_name?: string | null
          entity_id: string
          id?: string
          is_active?: boolean | null
          license_expiry_date?: string | null
          license_type?: string | null
          login_url?: string | null
          notes?: string | null
          software_id?: string | null
          updated_at?: string
        }
        Update: {
          account_email?: string | null
          category?: string
          created_at?: string
          custom_name?: string | null
          entity_id?: string
          id?: string
          is_active?: boolean | null
          license_expiry_date?: string | null
          license_type?: string | null
          login_url?: string | null
          notes?: string | null
          software_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_software_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_software_software_id_fkey"
            columns: ["software_id"]
            isOneToOne: false
            referencedRelation: "software_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_websites: {
        Row: {
          created_at: string
          domain_expiry_date: string | null
          entity_id: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          name: string
          notes: string | null
          platform: string | null
          ssl_expiry_date: string | null
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          domain_expiry_date?: string | null
          entity_id: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name: string
          notes?: string | null
          platform?: string | null
          ssl_expiry_date?: string | null
          type?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          domain_expiry_date?: string | null
          entity_id?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          platform?: string | null
          ssl_expiry_date?: string | null
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_websites_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      equity_transactions: {
        Row: {
          board_approval_date: string | null
          certificate_number: string | null
          created_at: string
          entity_id: string
          from_shareholder_id: string | null
          id: string
          notes: string | null
          price_per_share: number
          share_class_id: string
          shareholder_id: string
          shares: number
          total_amount: number | null
          transaction_date: string
          transaction_type: string
          updated_at: string
          vesting_cliff_months: number | null
          vesting_end_date: string | null
          vesting_period_months: number | null
          vesting_start_date: string | null
        }
        Insert: {
          board_approval_date?: string | null
          certificate_number?: string | null
          created_at?: string
          entity_id: string
          from_shareholder_id?: string | null
          id?: string
          notes?: string | null
          price_per_share?: number
          share_class_id: string
          shareholder_id: string
          shares: number
          total_amount?: number | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
          vesting_cliff_months?: number | null
          vesting_end_date?: string | null
          vesting_period_months?: number | null
          vesting_start_date?: string | null
        }
        Update: {
          board_approval_date?: string | null
          certificate_number?: string | null
          created_at?: string
          entity_id?: string
          from_shareholder_id?: string | null
          id?: string
          notes?: string | null
          price_per_share?: number
          share_class_id?: string
          shareholder_id?: string
          shares?: number
          total_amount?: number | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
          vesting_cliff_months?: number | null
          vesting_end_date?: string | null
          vesting_period_months?: number | null
          vesting_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equity_transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equity_transactions_from_shareholder_id_fkey"
            columns: ["from_shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equity_transactions_share_class_id_fkey"
            columns: ["share_class_id"]
            isOneToOne: false
            referencedRelation: "share_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equity_transactions_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_documents: {
        Row: {
          created_at: string
          document_id: string
          filing_id: string
          id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          filing_id: string
          id?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          filing_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "filing_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "entity_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_documents_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "entity_filings"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          entity_id: string
          filing_id: string | null
          id: string
          is_auto_generated: boolean
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          entity_id: string
          filing_id?: string | null
          id?: string
          is_auto_generated?: boolean
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          entity_id?: string
          filing_id?: string | null
          id?: string
          is_auto_generated?: boolean
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filing_tasks_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_tasks_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "entity_filings"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_types: {
        Row: {
          category: string
          code: string
          created_at: string
          default_frequency: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          default_frequency?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          default_frequency?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
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
          province_state: string | null
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          province_state?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          province_state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      law_firms: {
        Row: {
          address: string | null
          bar_number: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          engagement_end_date: string | null
          engagement_start_date: string | null
          entity_id: string
          fee_structure: string | null
          id: string
          is_active: boolean
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          practice_areas: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bar_number?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          practice_areas?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bar_number?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id?: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          practice_areas?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "law_firms_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_servers: {
        Row: {
          configuration: Json | null
          created_at: string
          domain: string | null
          id: string
          imap_host: string | null
          imap_port: number | null
          is_active: boolean
          is_verified: boolean
          name: string
          provider: string
          smtp_host: string | null
          smtp_port: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          domain?: string | null
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          is_active?: boolean
          is_verified?: boolean
          name: string
          provider: string
          smtp_host?: string | null
          smtp_port?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          domain?: string | null
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          is_active?: boolean
          is_verified?: boolean
          name?: string
          provider?: string
          smtp_host?: string | null
          smtp_port?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      option_grants: {
        Row: {
          acceleration_double_trigger: boolean | null
          acceleration_single_trigger: boolean | null
          created_at: string
          early_exercise_allowed: boolean | null
          entity_id: string
          exercise_price: number
          expiration_date: string | null
          grant_date: string
          grant_type: string
          id: string
          notes: string | null
          share_class_id: string
          shareholder_id: string
          shares_exercised: number
          shares_granted: number
          shares_vested: number
          status: string
          updated_at: string
          vesting_cliff_months: number | null
          vesting_period_months: number | null
          vesting_start_date: string | null
        }
        Insert: {
          acceleration_double_trigger?: boolean | null
          acceleration_single_trigger?: boolean | null
          created_at?: string
          early_exercise_allowed?: boolean | null
          entity_id: string
          exercise_price: number
          expiration_date?: string | null
          grant_date: string
          grant_type?: string
          id?: string
          notes?: string | null
          share_class_id: string
          shareholder_id: string
          shares_exercised?: number
          shares_granted: number
          shares_vested?: number
          status?: string
          updated_at?: string
          vesting_cliff_months?: number | null
          vesting_period_months?: number | null
          vesting_start_date?: string | null
        }
        Update: {
          acceleration_double_trigger?: boolean | null
          acceleration_single_trigger?: boolean | null
          created_at?: string
          early_exercise_allowed?: boolean | null
          entity_id?: string
          exercise_price?: number
          expiration_date?: string | null
          grant_date?: string
          grant_type?: string
          id?: string
          notes?: string | null
          share_class_id?: string
          shareholder_id?: string
          shares_exercised?: number
          shares_granted?: number
          shares_vested?: number
          status?: string
          updated_at?: string
          vesting_cliff_months?: number | null
          vesting_period_months?: number | null
          vesting_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "option_grants_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "option_grants_share_class_id_fkey"
            columns: ["share_class_id"]
            isOneToOne: false
            referencedRelation: "share_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "option_grants_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
        ]
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
      registration_agents: {
        Row: {
          address: string | null
          agent_type: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          engagement_end_date: string | null
          engagement_start_date: string | null
          entity_id: string
          fee_structure: string | null
          id: string
          is_active: boolean
          jurisdictions_covered: string[] | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          agent_type?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          jurisdictions_covered?: string[] | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          agent_type?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          engagement_end_date?: string | null
          engagement_start_date?: string | null
          entity_id?: string
          fee_structure?: string | null
          id?: string
          is_active?: boolean
          jurisdictions_covered?: string[] | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_agents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      share_classes: {
        Row: {
          anti_dilution: string | null
          authorized_shares: number
          class_type: string
          conversion_ratio: number | null
          created_at: string
          dividend_rate: number | null
          entity_id: string
          id: string
          liquidation_preference: number | null
          name: string
          notes: string | null
          par_value: number | null
          participation_cap: number | null
          seniority: number | null
          updated_at: string
          votes_per_share: number | null
          voting_rights: boolean | null
        }
        Insert: {
          anti_dilution?: string | null
          authorized_shares?: number
          class_type?: string
          conversion_ratio?: number | null
          created_at?: string
          dividend_rate?: number | null
          entity_id: string
          id?: string
          liquidation_preference?: number | null
          name: string
          notes?: string | null
          par_value?: number | null
          participation_cap?: number | null
          seniority?: number | null
          updated_at?: string
          votes_per_share?: number | null
          voting_rights?: boolean | null
        }
        Update: {
          anti_dilution?: string | null
          authorized_shares?: number
          class_type?: string
          conversion_ratio?: number | null
          created_at?: string
          dividend_rate?: number | null
          entity_id?: string
          id?: string
          liquidation_preference?: number | null
          name?: string
          notes?: string | null
          par_value?: number | null
          participation_cap?: number | null
          seniority?: number | null
          updated_at?: string
          votes_per_share?: number | null
          voting_rights?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "share_classes_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      shareholders: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          entity_id: string
          id: string
          is_board_member: boolean | null
          is_founder: boolean | null
          name: string
          notes: string | null
          phone: string | null
          shareholder_type: string
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          entity_id: string
          id?: string
          is_board_member?: boolean | null
          is_founder?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          shareholder_type?: string
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          entity_id?: string
          id?: string
          is_board_member?: boolean | null
          is_founder?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          shareholder_type?: string
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shareholders_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_accounts: {
        Row: {
          avatar_url: string | null
          color: string
          created_at: string
          entity_id: string | null
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
          avatar_url?: string | null
          color?: string
          created_at?: string
          entity_id?: string | null
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
          avatar_url?: string | null
          color?: string
          created_at?: string
          entity_id?: string | null
          followers?: string | null
          icon?: string | null
          id?: string
          is_verified?: boolean
          platform?: string
          profile_url?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_accounts_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      software_catalog: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          vendor: string | null
          website: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          vendor?: string | null
          website?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          vendor?: string | null
          website?: string | null
        }
        Relationships: []
      }
      tax_id_types: {
        Row: {
          authority_id: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          authority_id?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          label: string
          updated_at?: string
        }
        Update: {
          authority_id?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_id_types_authority_id_fkey"
            columns: ["authority_id"]
            isOneToOne: false
            referencedRelation: "issuing_authorities"
            referencedColumns: ["id"]
          },
        ]
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
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          last_login: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          last_login?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          last_login?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write: { Args: never; Returns: boolean }
      cleanup_expired_2fa_codes: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "viewer"
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
      app_role: ["admin", "viewer"],
    },
  },
} as const
