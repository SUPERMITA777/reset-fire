import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import type { NextRequest } from 'next/server'

type Cita = {
  id: string
  fecha: Date
  hora_inicio: string
  hora_fin: string
  box_id: number
  color: string
  observaciones: string | null
  created_at: Date
  updated_at: Date
  tratamiento_nombre: string
  subtratamiento_nombre: string
  duracion: number
  precio: number
  senia: number
  estado: 'completada' | 'pendiente'
}

type CitaRaw = {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  box_id: number
  color: string
  observaciones: string | null
  created_at: string
  updated_at: string
  senia: number
  tratamiento: {
    nombre: string
  }[]
  sub_tratamiento: {
    nombre: string
    duracion: number
    precio: number
  }[]
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        box_id,
        color,
        observaciones,
        created_at,
        updated_at,
        tratamiento:tratamientos!inner (
          nombre
        ),
        sub_tratamiento:sub_tratamientos!inner (
          nombre,
          duracion,
          precio
        ),
        senia
      `)
      .eq('cliente_id', id)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false })

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
        hora_inicio: format(new Date(`2000-01-01T${cita.hora_inicio}`), 'HH:mm'),
        hora_fin: format(new Date(`2000-01-01T${cita.hora_fin}`), 'HH:mm'),
        created_at: format(new Date(cita.created_at), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        updated_at: format(new Date(cita.updated_at), "yyyy-MM-dd'T'HH:mm:ssXXX"),
        tratamiento_nombre: cita.tratamiento[0]?.nombre || '',
        subtratamiento_nombre: cita.sub_tratamiento[0]?.nombre || '',
        duracion: cita.sub_tratamiento[0]?.duracion || 0,
        precio: cita.sub_tratamiento[0]?.precio || 0,
        estado,
        tratamiento: undefined, // Eliminar objetos anidados
        sub_tratamiento: undefined
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