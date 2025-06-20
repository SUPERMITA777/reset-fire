import { NextResponse } from 'next/server'
import { getTratamientos, crearTratamientoDB } from '../../../lib/supabase' // Importar crearTratamientoDB

// GET /api/tratamientos
export async function GET() {
  try {
    const tratamientos = await getTratamientos()
    return NextResponse.json(tratamientos)
  } catch (error) {
    console.error('Error al obtener tratamientos:', error)
    // Devolver un objeto de error en caso de fallo, en lugar de un array vacío, para ser más explícito.
    return NextResponse.json(
      { error: 'Error al obtener tratamientos', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST /api/tratamientos
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar que los datos necesarios están presentes
    // Según la función crearTratamientoDB en lib/supabase.ts, los parámetros son:
    // { nombre: string, max_clientes_por_turno: number, es_compartido: boolean, descripcion?: string, foto_url?: string }
    // Asumimos que box y otros campos como 'descripcion', 'foto_url' son opcionales o tienen defaults en la DB/función.
    // La función `crearTratamientoDB` parece esperar `nombre_tratamiento` en lugar de `nombre`.
    // Y no toma `max_clientes_por_turno` ni `es_compartido` directamente, estos parecen ser parte de `fechas_disponibles`
    // o de una lógica de negocio diferente.
    // Revisando `crearTratamientoDB` en el contexto previo, espera:
    // { nombre: string, descripcion?: string, foto_url?: string }
    // y rf_tratamientos tiene campos como `nombre_tratamiento`, `box`, `descripcion`, `foto_url`.
    // La función `crearTratamientoDB` mapea `params.nombre` a `nombre_tratamiento`.

    const { nombre, descripcion, foto_url, max_clientes_por_turno, es_compartido } = body

    if (!nombre) {
      return NextResponse.json(
        { error: 'El campo "nombre" es requerido para crear un tratamiento.' },
        { status: 400 }
      )
    }

    // Nota: `max_clientes_por_turno` y `es_compartido` no son parámetros directos de `crearTratamientoDB`
    // según la definición de la función en `lib/supabase.ts`.
    // `crearTratamientoDB` espera un objeto: { nombre: string, descripcion?: string, foto_url?: string }
    // Si estos campos son necesarios, `crearTratamientoDB` o la tabla deberían ser actualizadas.
    // Por ahora, solo pasaremos los campos que `crearTratamientoDB` espera.

    const nuevoTratamientoParams = {
      nombre,
      descripcion: descripcion || null,
      foto_url: foto_url || null,
      // Los campos `max_clientes_por_turno` y `es_compartido` no se pasan aquí
      // porque `crearTratamientoDB` no los acepta directamente.
      // Estos podrían ser manejados por otra lógica o función si es necesario.
    };

    const tratamientoCreado = await crearTratamientoDB(nuevoTratamientoParams)

    return NextResponse.json(tratamientoCreado, { status: 201 })
  } catch (error) {
    console.error('Error al crear tratamiento:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear el tratamiento'
    // Determinar el código de estado basado en el tipo de error si es posible
    let statusCode = 500
    if (errorMessage.includes("duplicate key value violates unique constraint")) {
        statusCode = 409 // Conflicto, por ejemplo, nombre de tratamiento duplicado
    } else if (errorMessage.includes("is required") || errorMessage.includes("invalid input")) {
        statusCode = 400 // Bad request
    }

    return NextResponse.json(
      { error: 'Error al crear el tratamiento', details: errorMessage },
      { status: statusCode }
    )
  }
}