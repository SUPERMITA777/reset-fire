import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data')

// Función auxiliar para leer archivos JSON
async function readJsonFile(filename: string) {
  try {
    const filePath = path.join(DB_PATH, filename)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return null
  }
}

// GET /api/tratamientos/fechas?tratamientoId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tratamientoId = searchParams.get('tratamientoId')

    if (!tratamientoId) {
      return NextResponse.json({ error: 'Falta el ID del tratamiento' }, { status: 400 })
    }

    const disponibilidad = await readJsonFile('disponibilidad.json')
    if (!disponibilidad) {
      return NextResponse.json({ error: 'Error al cargar la disponibilidad' }, { status: 500 })
    }

    const disp = disponibilidad.disponibilidad.find((d: any) => d.tratamiento_id === tratamientoId)
    if (!disp) {
      return NextResponse.json({ error: 'No hay disponibilidad para este tratamiento' }, { status: 404 })
    }

    // Devolver el rango de fechas disponible
    return NextResponse.json({
      fecha_inicio: disp.fecha_inicio,
      fecha_fin: disp.fecha_fin,
      dias_disponibles: disp.horarios.map((h: any) => h.dia_semana)
    })
  } catch (error) {
    console.error('Error en GET /api/tratamientos/fechas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 