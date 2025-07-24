import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// Interfaces para tipar la respuesta de Supabase
interface Tratamiento {
  nombre_tratamiento: string
}

interface SubTratamiento {
  nombre_subtratamiento: string
}

interface CitaSupabase {
  id: string
  fecha: string
  hora: string
  box: number
  nombre_completo: string
  dni: string | null
  whatsapp: string | null
  tratamiento_id: string
  subtratamiento_id: string
  notas: string | null
  created_at: string | null
  updated_at: string | null
  rf_tratamientos: Tratamiento
  rf_subtratamientos: SubTratamiento
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

    // Consultar las citas
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
        rf_tratamientos!inner (
          id,
          nombre_tratamiento
        ),
        rf_subtratamientos!inner (
          id,
          nombre_subtratamiento,
          duracion,
          precio
        ),
        rf_clientes!inner (
          nombre_completo,
          dni,
          whatsapp
        )
      `)
      .gte('fecha', format(fechaInicio, 'yyyy-MM-dd'))
      .lte('fecha', format(fechaFin, 'yyyy-MM-dd'))
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })

    if (citasError) {
      return NextResponse.json({ error: 'Error al obtener citas' }, { status: 500 })
    }

    if (!citas) {
      return NextResponse.json([])
    }

    // Transformar las citas al formato esperado por el frontend
    interface CitaFormateada {
      id: string;
      fecha: string;
      horaInicio: string;
      horaFin: string;
      box: string;
      box_id: string;
      nombreTratamiento: string;
      nombreSubTratamiento: string;
      nombreCompleto: string;
      tratamiento: string;
      subTratamiento: string;
      notas?: string;
      estado: 'reservado';
      color: string;
      created_at: string;
      updated_at: string;
    }
    const citasFormateadas: CitaFormateada[] = citas.map((cita: any) => ({
      id: cita.id,
      fecha: cita.fecha,
      horaInicio: cita.hora,
      horaFin: cita.hora,
      box: `Box ${cita.box}`,
      box_id: cita.box,
      nombreTratamiento: cita.rf_tratamientos.nombre_tratamiento,
      nombreSubTratamiento: cita.rf_subtratamientos.nombre_subtratamiento,
      nombreCompleto: cita.rf_clientes.nombre_completo,
      tratamiento: cita.tratamiento_id,
      subTratamiento: cita.subtratamiento_id,
      notas: cita.notas || undefined,
      estado: 'reservado',
      color: '#808080',
      created_at: cita.created_at,
      updated_at: cita.updated_at
    }))

    return NextResponse.json(citasFormateadas)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}