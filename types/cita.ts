export interface CitaRaw {
  id: string
  nombre_completo: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  box_id: number
  tratamiento_id: string
  sub_tratamiento_id: string | null
  color: string
  observaciones: string | null
  created_at: string
  updated_at: string | null
  estado: string
  tratamiento: {
    id: string
    nombre: string
  }
  sub_tratamiento: {
    id: string
    nombre: string
  } | null
}

export interface Cita {
  id: string
  fecha: Date
  horaInicio: string
  horaFin: string
  box: string
  box_id: number
  nombreCompleto: string
  dni: string | null
  whatsapp: string | null
  tratamiento: string | undefined
  subTratamiento: string | undefined
  nombreTratamiento: string | undefined
  nombreSubTratamiento: string | undefined
  color: string
  duracion: number | null
  precio: number | null
  senia: number
  notas: string | undefined
  estado: "reservado" | "seniado" | "confirmado" | "cancelado"
  observaciones: string | null
  created_at: string | undefined
  updated_at: string | undefined
}

export interface FechaDisponible {
  id: string
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  boxes_disponibles: number[]
  hora_inicio: string
  hora_fin: string
  cantidad_clientes: number
  created_at?: string
  updated_at?: string
}

export interface Tratamiento {
  id: string
  nombre: string
  descripcion?: string
  imagen?: string
  es_compartido: boolean
  max_clientes_por_turno: number
  boxes_disponibles?: number[]
  sub_tratamientos: SubTratamiento[]
  fechas_disponibles?: FechaDisponible[]
  created_at?: string
  updated_at?: string
}

export interface SubTratamiento {
  id: string
  tratamiento_id: string
  nombre: string
  duracion: number
  precio: number
  box: number
  created_at?: string
  updated_at?: string
}

export interface HorarioDisponible {
  hora_inicio: string
  disponibles: number
}
