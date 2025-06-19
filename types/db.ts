export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rf_citas: {
        Row: {
          id: string
          cliente_id: string
          tratamiento_id: string
          subtratamiento_id: string
          fecha: string
          hora: string
          box: number
          estado: 'reservado' | 'confirmado' | 'completado' | 'cancelado'
          es_multiple: boolean
          precio: number
          sena: number
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          tratamiento_id: string
          subtratamiento_id: string
          fecha: string
          hora: string
          box: number
          estado?: 'reservado' | 'confirmado' | 'completado' | 'cancelado'
          es_multiple?: boolean
          precio: number
          sena?: number
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          tratamiento_id?: string
          subtratamiento_id?: string
          fecha?: string
          hora?: string
          box?: number
          estado?: 'reservado' | 'confirmado' | 'completado' | 'cancelado'
          es_multiple?: boolean
          precio?: number
          sena?: number
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rf_clientes: {
        Row: {
          id: string
          dni: string
          nombre_completo: string
          whatsapp: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dni: string
          nombre_completo: string
          whatsapp?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dni?: string
          nombre_completo?: string
          whatsapp?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rf_tratamientos: {
        Row: {
          id: string
          nombre_tratamiento: string
          box: number
          foto_url: string | null
          descripcion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_tratamiento: string
          box: number
          foto_url?: string | null
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_tratamiento?: string
          box?: number
          foto_url?: string | null
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rf_subtratamientos: {
        Row: {
          id: string
          tratamiento_id: string
          nombre_subtratamiento: string
          duracion: number
          precio: number
          foto_url: string | null
          descripcion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tratamiento_id: string
          nombre_subtratamiento: string
          duracion: number
          precio: number
          foto_url?: string | null
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tratamiento_id?: string
          nombre_subtratamiento?: string
          duracion?: number
          precio?: number
          foto_url?: string | null
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
} 