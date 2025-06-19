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
          paciente_id: string
          tratamiento_id: string
          subtratamiento_id: string
          fecha: string
          hora: string
          box: number
          estado: string
          es_multiple: boolean
          precio: number
          sena: number
          duracion: number
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          tratamiento_id: string
          subtratamiento_id: string
          fecha: string
          hora: string
          box: number
          estado?: string
          es_multiple?: boolean
          precio: number
          sena?: number
          duracion: number
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          tratamiento_id?: string
          subtratamiento_id?: string
          fecha?: string
          hora?: string
          box?: number
          estado?: string
          es_multiple?: boolean
          precio?: number
          sena?: number
          duracion?: number
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
          descripcion: string | null
          foto_url: string | null
          box: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_tratamiento: string
          descripcion?: string | null
          foto_url?: string | null
          box: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_tratamiento?: string
          descripcion?: string | null
          foto_url?: string | null
          box?: number
          created_at?: string
          updated_at?: string
        }
      }
      rf_subtratamientos: {
        Row: {
          id: string
          nombre_subtratamiento: string
          descripcion: string | null
          foto_url: string | null
          duracion: number
          precio: number
          tratamiento_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_subtratamiento: string
          descripcion?: string | null
          foto_url?: string | null
          duracion: number
          precio: number
          tratamiento_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_subtratamiento?: string
          descripcion?: string | null
          foto_url?: string | null
          duracion?: number
          precio?: number
          tratamiento_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      rf_disponibilidad: {
        Row: {
          id: string
          tratamiento_id: string
          fecha_inicio: string
          fecha_fin: string
          hora_inicio: string
          hora_fin: string
          boxes_disponibles: number[]
          cantidad_clientes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tratamiento_id: string
          fecha_inicio: string
          fecha_fin: string
          hora_inicio: string
          hora_fin: string
          boxes_disponibles: number[]
          cantidad_clientes: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tratamiento_id?: string
          fecha_inicio?: string
          fecha_fin?: string
          hora_inicio?: string
          hora_fin?: string
          boxes_disponibles?: number[]
          cantidad_clientes?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      obtener_horarios_disponibles_fecha: {
        Args: {
          p_tratamiento_id: string
          p_fecha: string
          p_box_id: number
        }
        Returns: {
          hora_inicio: string
          hora_fin: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 