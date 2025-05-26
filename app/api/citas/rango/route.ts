import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// Interfaces para tipar la respuesta de Supabase
interface Tratamiento {
  nombre: string
}

interface SubTratamiento {
  nombre: string
}

interface CitaSupabase {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  box_id: number
  color: string
  nombre_completo: string
  tratamiento_id: string
  sub_tratamiento_id: string
  observaciones: string | null
  created_at: string
  updated_at: string
  tratamiento: Tratamiento
  sub_tratamiento: SubTratamiento
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vista = searchParams.get('vista')
    const inicio = searchParams.get('inicio')
    const fin = searchParams.get('fin')

    if (!vista || !inicio || !fin || !['dia', 'semana', 'mes'].includes(vista)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }

    // Procesar las fechas para el rango de búsqueda
    let fechaInicio = parseISO(inicio)
    let fechaFin = parseISO(fin)

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return NextResponse.json({ error: 'Formato de fecha inválido' }, { status: 400 })
    }

    // Ajustar el rango según la vista
    switch (vista) {
      case 'dia':
        fechaInicio = startOfDay(fechaInicio)
        fechaFin = endOfDay(fechaFin)
        break
      case 'semana':
        fechaInicio = startOfWeek(fechaInicio, { weekStartsOn: 1 })
        fechaFin = endOfWeek(fechaFin, { weekStartsOn: 1 })
        break
      case 'mes':
        fechaInicio = startOfMonth(fechaInicio)
        fechaFin = endOfMonth(fechaFin)
        break
    }

    console.log('Consultando citas con fechas:', {
      vista,
      fechaInicio: format(fechaInicio, 'yyyy-MM-dd'),
      fechaFin: format(fechaFin, 'yyyy-MM-dd')
    })

    // Consultar las citas
    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        box_id,
        color,
        nombre_completo,
        tratamiento_id,
        sub_tratamiento_id,
        observaciones,
        created_at,
        updated_at,
        tratamiento:tratamientos!inner (
          nombre
        ),
        sub_tratamiento:sub_tratamientos!inner (
          nombre
        )
      `)
      .gte('fecha', format(fechaInicio, 'yyyy-MM-dd'))
      .lte('fecha', format(fechaFin, 'yyyy-MM-dd'))
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true }) as { data: CitaSupabase[] | null, error: any }

    if (citasError) {
      console.error('Error al obtener citas:', citasError)
      return NextResponse.json({ error: 'Error al obtener citas' }, { status: 500 })
    }

    if (!citas) {
      return NextResponse.json({ citas: [] })
    }

    // Transformar las citas al formato esperado por el frontend
    const citasFormateadas = citas.map(cita => ({
      id: cita.id,
      fecha: cita.fecha, // Mantener la fecha como string en formato YYYY-MM-DD
      horaInicio: cita.hora_inicio,
      horaFin: cita.hora_fin,
      box: `Box ${cita.box_id}`,
      box_id: cita.box_id,
      nombreTratamiento: cita.tratamiento.nombre,
      nombreSubTratamiento: cita.sub_tratamiento.nombre,
      nombreCompleto: cita.nombre_completo,
      tratamiento: cita.tratamiento_id,
      subTratamiento: cita.sub_tratamiento_id,
      notas: cita.observaciones || undefined,
      estado: 'reservado' as const,
      color: cita.color || '#808080',
      created_at: cita.created_at,
      updated_at: cita.updated_at
    }))

    return NextResponse.json(citasFormateadas)
  } catch (error) {
    console.error('Error en el endpoint:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}