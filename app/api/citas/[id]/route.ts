import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { format } from 'date-fns'

const DB_PATH = path.join(process.cwd(), 'data')

// Funciones de utilidad para leer/escribir archivos JSON
async function readJsonFile(filename: string) {
  const filePath = path.join(DB_PATH, filename)
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
}

async function writeJsonFile(filename: string, data: any) {
  const filePath = path.join(DB_PATH, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// PUT /api/citas/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cambios = await request.json()
    const data = await readJsonFile('citas.json')
    const index = data.citas.findIndex((c: any) => c.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    const citaActual = data.citas[index]
    const citaActualizada = {
      ...citaActual,
      tratamiento_id: cambios.tratamiento || citaActual.tratamiento_id,
      sub_tratamiento_id: cambios.subTratamiento || citaActual.sub_tratamiento_id,
      fecha: cambios.fecha ? format(new Date(cambios.fecha), 'yyyy-MM-dd') : citaActual.fecha,
      hora_inicio: cambios.horaInicio || citaActual.hora_inicio,
      box_id: cambios.box_id || citaActual.box_id,
      cliente: {
        dni: cambios.dni || citaActual.cliente.dni,
        nombre_completo: cambios.nombreCompleto || citaActual.cliente.nombre_completo,
        whatsapp: cambios.whatsapp || citaActual.cliente.whatsapp
      },
      senia: cambios.senia || citaActual.senia,
      estado: cambios.estado || citaActual.estado,
      observaciones: cambios.observaciones || citaActual.observaciones,
      updated_at: new Date().toISOString()
    }

    data.citas[index] = citaActualizada
    await writeJsonFile('citas.json', data)

    return NextResponse.json({
      id: citaActualizada.id,
      fecha: new Date(citaActualizada.fecha),
      horaInicio: citaActualizada.hora_inicio,
      horaFin: citaActualizada.hora_fin || null,
      box: `Box ${citaActualizada.box_id}`,
      box_id: citaActualizada.box_id,
      nombreCompleto: citaActualizada.cliente.nombre_completo,
      dni: citaActualizada.cliente.dni,
      whatsapp: citaActualizada.cliente.whatsapp,
      tratamiento: citaActualizada.tratamiento_id,
      subTratamiento: citaActualizada.sub_tratamiento_id,
      nombreTratamiento: citaActualizada.tratamiento?.nombre,
      nombreSubTratamiento: citaActualizada.sub_tratamiento?.nombre,
      color: citaActualizada.color || "#4f46e5",
      duracion: citaActualizada.sub_tratamiento?.duracion || null,
      precio: citaActualizada.sub_tratamiento?.precio || null,
      senia: citaActualizada.senia || 0,
      notas: citaActualizada.observaciones,
      estado: citaActualizada.estado || "pendiente",
      observaciones: citaActualizada.observaciones,
      created_at: citaActualizada.created_at,
      updated_at: citaActualizada.updated_at
    })
  } catch (error) {
    console.error('Error al actualizar cita:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cita' },
      { status: 500 }
    )
  }
}

// DELETE /api/citas/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readJsonFile('citas.json')
    const index = data.citas.findIndex((c: any) => c.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    data.citas.splice(index, 1)
    await writeJsonFile('citas.json', data)

    return NextResponse.json({ message: 'Cita eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar cita:', error)
    return NextResponse.json(
      { error: 'Error al eliminar cita' },
      { status: 500 }
    )
  }
} 