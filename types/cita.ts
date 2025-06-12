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
  cliente_id?: string
  tratamiento_id: string
  subtratamiento_id: string
  precio: number
  sena: number
  fecha: string
  hora: string
  box: number
  estado: "reservado" | "confirmado" | "cancelado" | "completado"
  notas: string | null
  created_at: string
  updated_at: string
  duracion?: number
  es_multiple?: boolean
  rf_clientes?: {
    id: string
    dni: string
    nombre_completo: string
    whatsapp: string
  } | null
  rf_subtratamientos?: {
    id: string
    nombre_subtratamiento: string
    duracion: number
    precio: number
  } | null
  rf_citas_clientes?: {
    cita_id: string
    count: number
  }[] | null
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
  nombre_tratamiento: string
  box: number
  created_at: string
  updated_at: string
  rf_subtratamientos?: SubTratamiento[]
}

export interface SubTratamiento {
  id: string
  tratamiento_id: string
  nombre_subtratamiento: string
  precio: number
  duracion: number
  created_at?: string
  updated_at?: string
}

export interface HorarioDisponible {
  hora_inicio: string
  disponibles: number
}

// Extender el tipo Cita para incluir las relaciones
export type CitaWithRelations = Cita & {
  rf_clientes: {
    id: string;
    dni: string;
    nombre_completo: string;
    whatsapp: string;
  } | null;
  rf_subtratamientos: {
    id: string;
    nombre_subtratamiento: string;
    duracion: number;
    precio: number;
    rf_tratamientos: {
      id: string;
      nombre_tratamiento: string;
    } | null;
  } | null;
};
