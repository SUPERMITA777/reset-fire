import { NextResponse } from 'next/server'
import { getTratamientos } from '../../../lib/supabase'

// GET /api/tratamientos
export async function GET() {
  try {
    const tratamientos = await getTratamientos()
    return NextResponse.json(tratamientos)
  } catch (error) {
    console.error('Error al obtener tratamientos:', error)
    return NextResponse.json([])
  }
}

// GET /api/tratamientos/[id]/horarios
export async function POST(request: Request) {
  // El POST se puede implementar luego usando Supabase si lo necesitas
  return NextResponse.json(
    { error: 'El POST no está implementado' },
    { status: 501 }
  )
} 