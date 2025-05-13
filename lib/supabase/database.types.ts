// Este archivo contendrá los tipos de tu base de datos
// Puedes generarlos automáticamente con el CLI de Supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          is_verified: boolean
          commission_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          is_verified?: boolean
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          is_verified?: boolean
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          original_price: number | null
          category: string
          images: Json
          stock: number
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price: number
          original_price?: number | null
          category: string
          images?: Json
          stock?: number
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: number
          original_price?: number | null
          category?: string
          images?: Json
          stock?: number
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Añade más tablas según sea necesario
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
  }
}
