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

// Función auxiliar para escribir archivos JSON
async function writeJsonFile(filename: string, data: any) {
  try {
    const filePath = path.join(DB_PATH, filename)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    return false
  }
}

// GET /api/tratamientos/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await readJsonFile('tratamientos.json')
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar los tratamientos' }, { status: 500 })
    }

    const tratamiento = data.tratamientos.find((t: any) => t.id === params.id)
    if (!tratamiento) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
    }

    return NextResponse.json(tratamiento)
  } catch (error) {
    console.error('Error en GET /api/tratamientos/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/tratamientos/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tratamiento = await request.json()
    const data = await readJsonFile('tratamientos.json')
    
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar los tratamientos' }, { status: 500 })
    }

    const index = data.tratamientos.findIndex((t: any) => t.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
    }

    data.tratamientos[index] = {
      ...data.tratamientos[index],
      ...tratamiento,
      id: params.id // Asegurarnos de mantener el ID original
    }

    const success = await writeJsonFile('tratamientos.json', data)
    if (!success) {
      return NextResponse.json({ error: 'Error al guardar los cambios' }, { status: 500 })
    }

    return NextResponse.json(data.tratamientos[index])
  } catch (error) {
    console.error('Error en PUT /api/tratamientos/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/tratamientos/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await readJsonFile('tratamientos.json')
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar los tratamientos' }, { status: 500 })
    }

    const index = data.tratamientos.findIndex((t: any) => t.id === params.id)
    if (index === -1) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
    }

    data.tratamientos.splice(index, 1)
    const success = await writeJsonFile('tratamientos.json', data)
    if (!success) {
      return NextResponse.json({ error: 'Error al guardar los cambios' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/tratamientos/[id]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 