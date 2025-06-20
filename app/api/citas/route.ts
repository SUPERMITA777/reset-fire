import { NextResponse } from 'next/server'
import {
  getCitasPorFecha,
  crearCita,
  actualizarCita,
  eliminarCita
} from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

// GET /api/citas
// Necesita un parámetro de fecha en la query string, ej: /api/citas?fecha=2023-10-27
// Opcionalmente puede recibir obtenerMesCompleto=true para traer todas las citas del mes
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fechaParam = searchParams.get('fecha')
  const obtenerMesCompletoParam = searchParams.get('obtenerMesCompleto')

  if (!fechaParam) {
    return NextResponse.json(
      { error: 'El parámetro fecha es requerido' },
      { status: 400 }
    )
  }

  try {
    const fecha = parseISO(fechaParam)
    const obtenerMesCompleto = obtenerMesCompletoParam === 'true'
    const citasPorFecha = await getCitasPorFecha(fecha, obtenerMesCompleto)

    // getCitasPorFecha devuelve un objeto con fechas como claves.
    // Para una API RESTful que devuelve una lista de citas,
    // podríamos querer aplanar esto, o devolverlo tal cual dependiendo de la necesidad del cliente.
    // Por ahora, lo devolveremos tal cual.
    return NextResponse.json(citasPorFecha)
  } catch (error) {
    console.error('Error al obtener citas:', error)
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    )
  }
}

// POST /api/citas
export async function POST(request: Request) {
  try {
    const citaData = await request.json()

    // Adaptar citaData a la estructura esperada por crearCita en supabase.ts
    // Esto es una suposición y podría necesitar ajustes basados en la definición exacta de Cita en supabase.ts
    const nuevaCitaSupabase = {
      // Asegúrate de que los campos coincidan con la tabla 'citas' de Supabase y el tipo Omit<Cita, ...>
      cliente_id: citaData.cliente_id, // Asumiendo que ahora se pasa un cliente_id
      tratamiento_id: citaData.tratamiento_id,
      subtratamiento_id: citaData.subtratamiento_id,
      precio: citaData.precio,
      sena: citaData.sena,
      fecha: format(parseISO(citaData.fecha), 'yyyy-MM-dd'), // Asegurar formato correcto
      hora: citaData.hora, // Asumiendo que 'hora' es el campo correcto, no horaInicio
      box: citaData.box, // Asumiendo que 'box' es el campo correcto
      estado: citaData.estado || 'reservado',
      notas: citaData.notas,
      duracion: citaData.duracion, // Este campo podría venir de subtratamientos
      es_multiple: citaData.es_multiple || false,
      // rf_clientes y rf_subtratamientos no se insertan directamente, son relaciones.
      // created_at y updated_at son manejados por Supabase
    }

    const citaCreada = await crearCita(nuevaCitaSupabase)
    return NextResponse.json(citaCreada)
  } catch (error) {
    console.error('Error al crear cita:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear cita'
    return NextResponse.json(
      { error: 'Error al crear cita: ' + errorMessage },
      { status: 500 }
    )
  }
}

// PUT /api/citas/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'ID de cita es requerido' }, { status: 400 })
  }

  try {
    const citaData = await request.json()
    // Adaptar citaData a la estructura esperada por actualizarCita
    // Los campos como created_at, updated_at usualmente son manejados por la DB
    // cliente_id, tratamiento_id, etc. deben ser pasados si se pueden actualizar
    const citaActualizada = await actualizarCita(id, citaData)
    return NextResponse.json(citaActualizada)
  } catch (error) {
    console.error(`Error al actualizar cita ${id}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar cita'
    return NextResponse.json(
      { error: `Error al actualizar cita: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// DELETE /api/citas/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'ID de cita es requerido' }, { status: 400 })
  }

  try {
    await eliminarCita(id)
    return NextResponse.json({ message: `Cita ${id} eliminada correctamente` })
  } catch (error) {
    console.error(`Error al eliminar cita ${id}:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar cita'
    return NextResponse.json(
      { error: `Error al eliminar cita: ${errorMessage}` },
      { status: 500 }
    )
  }
}