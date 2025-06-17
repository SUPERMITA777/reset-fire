import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

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

// GET /api/tratamientos/[id]/subtratamientos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readJsonFile('tratamientos.json')
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar los tratamientos' }, { status: 500 })
    }

    const tratamiento = data.tratamientos.find((t: any) => t.id === id)
    if (!tratamiento) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
    }

    return NextResponse.json(tratamiento.sub_tratamientos)
  } catch (error) {
    console.error('Error en GET /api/tratamientos/[id]/subtratamientos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/tratamientos/[id]/subtratamientos
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subTratamiento = await request.json()
    const data = await readJsonFile('tratamientos.json')
    
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar los tratamientos' }, { status: 500 })
    }

    const tratamientoIndex = data.tratamientos.findIndex((t: any) => t.id === id)
    if (tratamientoIndex === -1) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
    }

    const nuevoSubTratamiento = {
      ...subTratamiento,
      id: uuidv4(),
      tratamiento_id: id,
      created_at: new Date().toISOString()
    }

    data.tratamientos[tratamientoIndex].sub_tratamientos.push(nuevoSubTratamiento)
    const success = await writeJsonFile('tratamientos.json', data)
    if (!success) {
      return NextResponse.json({ error: 'Error al guardar los cambios' }, { status: 500 })
    }

    return NextResponse.json(nuevoSubTratamiento)
  } catch (error) {
    console.error('Error en POST /api/tratamientos/[id]/subtratamientos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/tratamientos/[id]/subtratamientos/[subId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const { id, subId } = await params
    const subTratamiento = await request.json()
    const data = await readJsonFile('tratamientos.json')
    
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar los tratamientos' }, { status: 500 })
    }

    const tratamientoIndex = data.tratamientos.findIndex((t: any) => t.id === id)
    if (tratamientoIndex === -1) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
    }

    const subTratamientoIndex = data.tratamientos[tratamientoIndex].sub_tratamientos.findIndex(
      (st: any) => st.id === subId
    )
    if (subTratamientoIndex === -1) {
      return NextResponse.json({ error: 'Sub-tratamiento no encontrado' }, { status: 404 })
    }

    data.tratamientos[tratamientoIndex].sub_tratamientos[subTratamientoIndex] = {
      ...data.tratamientos[tratamientoIndex].sub_tratamientos[subTratamientoIndex],
      ...subTratamiento,
      id: subId,
      tratamiento_id: id,
      updated_at: new Date().toISOString()
    }

    const success = await writeJsonFile('tratamientos.json', data)
    if (!success) {
      return NextResponse.json({ error: 'Error al guardar los cambios' }, { status: 500 })
    }

    return NextResponse.json(data.tratamientos[tratamientoIndex].sub_tratamientos[subTratamientoIndex])
  } catch (error) {
    console.error('Error en PUT /api/tratamientos/[id]/subtratamientos/[subId]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/tratamientos/[id]/subtratamientos/[subId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const { id, subId } = await params
    const data = await readJsonFile('tratamientos.json')
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar los tratamientos' }, { status: 500 })
    }

    const tratamientoIndex = data.tratamientos.findIndex((t: any) => t.id === id)
    if (tratamientoIndex === -1) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 })
    }

    const subTratamientoIndex = data.tratamientos[tratamientoIndex].sub_tratamientos.findIndex(
      (st: any) => st.id === subId
    )
    if (subTratamientoIndex === -1) {
      return NextResponse.json({ error: 'Sub-tratamiento no encontrado' }, { status: 404 })
    }

    data.tratamientos[tratamientoIndex].sub_tratamientos.splice(subTratamientoIndex, 1)
    const success = await writeJsonFile('tratamientos.json', data)
    if (!success) {
      return NextResponse.json({ error: 'Error al guardar los cambios' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/tratamientos/[id]/subtratamientos/[subId]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 