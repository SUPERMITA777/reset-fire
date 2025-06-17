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

// GET /api/citas
export async function GET() {
  try {
    const data = await readJsonFile('citas.json')
    const citas = data.citas.map((cita: any) => ({
      id: cita.id,
      fecha: new Date(cita.fecha),
      horaInicio: cita.hora_inicio,
      horaFin: cita.hora_fin || null,
      box: `Box ${cita.box_id}`,
      box_id: cita.box_id,
      nombreCompleto: cita.cliente.nombre_completo,
      dni: cita.cliente.dni,
      whatsapp: cita.cliente.whatsapp,
      tratamiento: cita.tratamiento_id,
      subTratamiento: cita.sub_tratamiento_id,
      nombreTratamiento: cita.tratamiento?.nombre,
      nombreSubTratamiento: cita.sub_tratamiento?.nombre,
      color: cita.color || "#4f46e5",
      duracion: cita.sub_tratamiento?.duracion || null,
      precio: cita.sub_tratamiento?.precio || null,
      senia: cita.senia || 0,
      notas: cita.observaciones,
      estado: cita.estado || "pendiente",
      observaciones: cita.observaciones,
      created_at: cita.created_at,
      updated_at: cita.updated_at
    }))
    return NextResponse.json(citas)
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
    const cita = await request.json()
    const data = await readJsonFile('citas.json')
    
    const nuevaCita = {
      id: Date.now().toString(),
      tratamiento_id: cita.tratamiento,
      sub_tratamiento_id: cita.subTratamiento,
      fecha: format(new Date(cita.fecha), 'yyyy-MM-dd'),
      hora_inicio: cita.horaInicio,
      box_id: cita.box_id,
      cliente: {
        dni: cita.dni || null,
        nombre_completo: cita.nombreCompleto,
        whatsapp: cita.whatsapp || null
      },
      senia: cita.senia || 0,
      estado: cita.estado || "pendiente",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    data.citas.push(nuevaCita)
    await writeJsonFile('citas.json', data)

    return NextResponse.json(nuevaCita)
  } catch (error) {
    console.error('Error al crear cita:', error)
    return NextResponse.json(
      { error: 'Error al crear cita' },
      { status: 500 }
    )
  }
} 