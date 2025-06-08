import { supabase } from "@/lib/supabase"
import { Tratamiento } from "@/types/cita"

export async function getTratamientos(): Promise<Tratamiento[]> {
  const { data, error } = await supabase
    .from('tratamientos')
    .select(`
      *,
      sub_tratamientos (
        id,
        nombre,
        duracion,
        precio,
        box,
        created_at,
        updated_at
      ),
      fechas_disponibles (
        id,
        fecha_inicio,
        fecha_fin,
        hora_inicio,
        hora_fin,
        boxes_disponibles,
        cantidad_clientes
      )
    `)
    .order('nombre')

  if (error) {
    console.error('Error al obtener tratamientos:', error)
    throw error
  }

  return data || []
} 