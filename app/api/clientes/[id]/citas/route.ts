import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import type { NextRequest } from 'next/server'

type Cita = {
  id: string
  fecha: Date
  hora: string
  box: number
  color: string
  notas: string | null
  created_at: Date
  updated_at: Date
  tratamiento_nombre: string
  subtratamiento_nombre: string
  duracion: number
  precio: number
  sena: number
  estado: 'completada' | 'pendiente'
}

type CitaRaw = {
  id: string
  fecha: string
  hora: string
  box: number
  notas: string | null
  created_at: string
  updated_at: string
  sena: number
  precio: number
  estado: string
  rf_tratamientos: {
    nombre_tratamiento: string
  }[]
  rf_subtratamientos: {
    nombre_subtratamiento: string
    duracion: number
    precio: number
  }[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: citas, error: citasError } = await supabase
      .from('rf_citas')
      .select(`
        id,
        fecha,
        hora,
        box,
        notas,
        created_at,
        updated_at,
        precio,
        sena,
        estado,
        rf_tratamientos!inner (
          nombre_tratamiento
        ),
        rf_subtratamientos!inner (
          nombre_subtratamiento,
          duracion,
          precio
        )
      `)
      .eq('paciente_id', id)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })

    if (citasError) {
      console.error('Error al obtener citas del cliente:', citasError)
      return NextResponse.json(
        { error: 'Error al obtener las citas del cliente' },
        { status: 500 }
      )
    }

    // Formatear las citas para el frontend
    const citasFormateadas = citas.map((cita: CitaRaw) => {
      const fecha = new Date(cita.fecha)
      const ahora = new Date()
      const estado = fecha < ahora ? 'completada' : 'pendiente'

      return {
        ...cita,
        fecha: format(fecha, 'yyyy-MM-dd'),
        hora: format(new Date(`2000-01-01T${cita.hora}`), 'HH:mm'),
        created_at: format(new Date(cita.created_at), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        updated_at: format(new Date(cita.updated_at), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        tratamiento_nombre: cita.rf_tratamientos[0]?.nombre_tratamiento || '',
        subtratamiento_nombre: cita.rf_subtratamientos[0]?.nombre_subtratamiento || '',
        duracion: cita.rf_subtratamientos[0]?.duracion || 0,
        precio: cita.rf_subtratamientos[0]?.precio || 0,
        estado,
        rf_tratamientos: undefined, // Eliminar objetos anidados
        rf_subtratamientos: undefined
      }
    })

    return NextResponse.json(citasFormateadas)
  } catch (error) {
    console.error('Error al obtener citas del cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener las citas del cliente' },
      { status: 500 }
    )
  }
} 