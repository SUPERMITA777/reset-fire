// Tipos globales para el proyecto

declare global {
  // Tipos para el entorno
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      DATABASE_URL?: string
      NEXTAUTH_SECRET?: string
      NEXTAUTH_URL?: string
      VERCEL_URL?: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }

  // Tipos para las tablas de Supabase
  interface Database {
    public: {
      Tables: {
        rf_tratamientos: {
          Row: {
            id: string
            nombre_tratamiento: string
            descripcion: string | null
            max_clientes_por_turno: number
            es_compartido: boolean
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            nombre_tratamiento: string
            descripcion?: string | null
            max_clientes_por_turno: number
            es_compartido: boolean
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            nombre_tratamiento?: string
            descripcion?: string | null
            max_clientes_por_turno?: number
            es_compartido?: boolean
            created_at?: string
            updated_at?: string
          }
        }
        rf_subtratamientos: {
          Row: {
            id: string
            tratamiento_id: string
            nombre: string
            duracion: number
            precio: number
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            tratamiento_id: string
            nombre: string
            duracion: number
            precio: number
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            tratamiento_id?: string
            nombre?: string
            duracion?: number
            precio?: number
            created_at?: string
            updated_at?: string
          }
        }
        rf_clientes: {
          Row: {
            id: string
            nombre_completo: string
            fecha_nacimiento: string | null
            telefono: string | null
            email: string | null
            direccion: string | null
            historia_clinica: Record<string, any> | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            nombre_completo: string
            fecha_nacimiento?: string | null
            telefono?: string | null
            email?: string | null
            direccion?: string | null
            historia_clinica?: Record<string, any> | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            nombre_completo?: string
            fecha_nacimiento?: string | null
            telefono?: string | null
            email?: string | null
            direccion?: string | null
            historia_clinica?: Record<string, any> | null
            created_at?: string
            updated_at?: string
          }
        }
        rf_citas: {
          Row: {
            id: string
            cliente_id: string
            tratamiento_id: string
            sub_tratamiento_id: string
            fecha: string
            hora_inicio: string
            hora_fin: string
            box: number
            observaciones: string | null
            precio: number
            estado: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            cliente_id: string
            tratamiento_id: string
            sub_tratamiento_id: string
            fecha: string
            hora_inicio: string
            hora_fin: string
            box: number
            observaciones?: string | null
            precio: number
            estado?: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            cliente_id?: string
            tratamiento_id?: string
            sub_tratamiento_id?: string
            fecha?: string
            hora_inicio?: string
            hora_fin?: string
            box?: number
            observaciones?: string | null
            precio?: number
            estado?: string
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
        [_ in never]: never
      }
      Enums: {
        [_ in never]: never
      }
    }
  }

  // Tipos para las funciones de Supabase
  interface SupabaseFunctions {
    verificar_disponibilidad: {
      Args: {
        p_fecha: string
        p_hora_inicio: string
        p_hora_fin: string
        p_box: number
        p_tratamiento_id?: string
      }
      Returns: boolean
    }
    obtener_horarios_disponibles: {
      Args: {
        p_fecha: string
        p_tratamiento_id: string
      }
      Returns: {
        hora_inicio: string
        hora_fin: string
        boxes_disponibles: number[]
      }[]
    }
  }
}

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Tipos para las respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Tipos para los filtros
export interface FilterOptions {
  search?: string
  dateFrom?: string
  dateTo?: string
  status?: string
  treatmentId?: string
  clientId?: string
  box?: number
}

// Tipos para las opciones de ordenamiento
export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Tipos para las opciones de paginación
export interface PaginationOptions {
  page: number
  limit: number
}

export {} 