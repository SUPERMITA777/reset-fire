import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('Iniciando endpoint GET /api/clientes/[id]', { id })
  
  try {
    // Obtener el cliente con todas sus citas
    const { data: cliente, error: clienteError } = await supabase
      .from('rf_clientes')
      .select(`
        *,
        rf_citas (
          id,
          fecha,
          hora,
          estado,
          notas,
          precio,
          sena,
          box,
          rf_subtratamientos (
            id,
            nombre_subtratamiento,
            duracion,
            precio,
            rf_tratamientos (
              id,
              nombre_tratamiento
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (clienteError) {
      return NextResponse.json({ error: clienteError.message }, { status: 500 })
    }

    // Procesar las citas para incluir información adicional
    const citasProcesadas = (cliente.rf_citas || []).map((cita: any) => ({
      ...cita,
      tratamiento_nombre: cita.rf_subtratamientos?.rf_tratamientos?.nombre_tratamiento || 'Sin tratamiento',
      subtratamiento_nombre: cita.rf_subtratamientos?.nombre_subtratamiento || 'Sin subtratamiento',
      duracion: cita.rf_subtratamientos?.duracion || 0,
      fecha_formateada: new Date(cita.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }))

    // Calcular estadísticas
    const totalCitas = citasProcesadas.length
    const citasConfirmadas = citasProcesadas.filter((c: any) => c.estado === 'confirmado').length
    const citasCompletadas = citasProcesadas.filter((c: any) => c.estado === 'completado').length
    const citasCanceladas = citasProcesadas.filter((c: any) => c.estado === 'cancelado').length
    const totalGastado = citasProcesadas.reduce((acc: number, c: any) => acc + (c.precio || 0), 0)
    const totalSeniado = citasProcesadas.reduce((acc: number, c: any) => acc + (c.sena || 0), 0)
    const saldoPendiente = totalGastado - totalSeniado

    const clienteDetalle = {
      ...cliente,
      rf_citas: citasProcesadas,
      estadisticas: {
        total_citas: totalCitas,
        citas_confirmadas: citasConfirmadas,
        citas_completadas: citasCompletadas,
        citas_canceladas: citasCanceladas,
        total_gastado: totalGastado,
        total_seniado: totalSeniado,
        saldo_pendiente: saldoPendiente
      }
    }

    return NextResponse.json(clienteDetalle)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('Iniciando endpoint PUT /api/clientes/[id]', { id })
  
  try {
    const body = await request.json()
    const { nombre_completo, dni, whatsapp } = body

    // Validaciones básicas
    if (!nombre_completo || !dni) {
      return NextResponse.json(
        { error: 'Nombre completo y DNI son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si el DNI ya existe en otro cliente
    const { data: dniExistente, error: dniError } = await supabase
      .from('rf_clientes')
      .select('id')
      .eq('dni', dni)
      .neq('id', id)
      .single()

    if (dniError && dniError.code !== 'PGRST116') {
      console.error('Error al verificar DNI:', dniError)
      return NextResponse.json(
        { error: 'Error al verificar DNI existente' },
        { status: 500 }
      )
    }

    if (dniExistente) {
      return NextResponse.json(
        { error: 'Ya existe otro cliente con este DNI' },
        { status: 400 }
      )
    }

    // Actualizar el cliente
    const { data: cliente, error: updateError } = await supabase
      .from('rf_clientes')
      .update({
        nombre_completo,
        dni,
        whatsapp: whatsapp || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error al actualizar cliente:', updateError)
      return NextResponse.json(
        { 
          error: 'Error al actualizar el cliente',
          details: updateError.message
        },
        { status: 500 }
      )
    }

    console.log('Cliente actualizado exitosamente:', {
      id: cliente.id,
      nombre: cliente.nombre_completo,
      dni: cliente.dni
    })

    return NextResponse.json(cliente)
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error('Error desconocido')
    console.error('Error detallado al actualizar cliente:', {
      error: finalError,
      message: finalError.message,
      stack: finalError.stack,
      type: finalError.constructor.name
    })

    return NextResponse.json(
      { 
        error: 'Error al actualizar el cliente',
        details: finalError.message,
        type: finalError.constructor.name
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('Iniciando endpoint DELETE /api/clientes/[id]', { id })
  
  try {
    // Verificar si el cliente tiene citas
    const { data: citas, error: citasError } = await supabase
      .from('rf_citas')
      .select('id')
      .eq('cliente_id', id)

    if (citasError) {
      console.error('Error al verificar citas del cliente:', citasError)
      return NextResponse.json(
        { error: 'Error al verificar citas del cliente' },
        { status: 500 }
      )
    }

    if (citas && citas.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un cliente que tiene citas registradas' },
        { status: 400 }
      )
    }

    // Eliminar el cliente
    const { error: deleteError } = await supabase
      .from('rf_clientes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error al eliminar cliente:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar el cliente' },
        { status: 500 }
      )
    }

    console.log('Cliente eliminado exitosamente:', { id })

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el cliente' },
      { status: 500 }
    )
  }
} 