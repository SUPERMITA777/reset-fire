export interface Cita {
  id: string
  dni?: string
  nombreCompleto: string
  whatsapp?: string
  fecha: Date
  horaInicio: string
  horaFin: string
  tratamiento?: string
  subTratamiento?: string
  nombreTratamiento?: string
  nombreSubTratamiento?: string
  color: string
  duracion?: number | null
  precio?: number | null
  senia?: number
  notas?: string
  box_id: number
  box: string
  estado?: "reservado" | "seniado" | "confirmado" | "cancelado"
  created_at?: string
  updated_at?: string
}
