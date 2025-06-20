import { NextResponse } from 'next/server'
import { actualizarCita, eliminarCita } from '@/lib/supabase'

// PUT /api/citas/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: 'ID de cita es requerido' }, { status: 400 })
  }

  try {
    const citaData = await request.json()
    const citaActualizada = await actualizarCita(id, citaData)
    return NextResponse.json(citaActualizada)
  } catch (error) {
    const typedError = error as Error
    console.error(`Error al actualizar cita ${id}:`, typedError.message)
    return NextResponse.json(
      { error: `Error al actualizar cita: ${typedError.message}` },
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
    const typedError = error as Error
    console.error(`Error al eliminar cita ${id}:`, typedError.message)
    return NextResponse.json(
      { error: `Error al eliminar cita: ${typedError.message}` },
      { status: 500 }
    )
  }
}
