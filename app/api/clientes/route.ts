import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type Cliente = {
  id: string
  nombre_completo: string
  dni: string
  telefono: string | null
  email: string | null
  fecha_nacimiento: Date | null
  direccion: string | null
  historia_clinica: Record<string, any>
  created_at: Date
  updated_at: Date
  total_citas: number
  ultima_cita: Date | null
}

type Cita = {
  id: string
  fecha: string
}

type ClienteConCitas = Cliente & {
  citas: Cita[]
}

export async function GET() {
  console.log('Iniciando endpoint GET /api/clientes')
  
  try {
    // Verificar la conexión a la base de datos
    console.log('Intentando conectar a la base de datos...')
    
    // Obtener los clientes usando Supabase
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select(`
        *,
        citas:clientes_citas_fkey (
          id,
          fecha
        )
      `)
      .order('nombre_completo', { ascending: true })

    if (clientesError) {
      console.error('Error al obtener clientes:', clientesError)
      return NextResponse.json(
        { 
          error: 'Error al obtener la lista de clientes',
          details: clientesError.message
        },
        { status: 500 }
      )
    }

    // Procesar los datos para incluir el total de citas y la última cita
    const clientesProcesados = clientes.map((cliente: ClienteConCitas) => {
      const citas = cliente.citas || []
      const total_citas = citas.length
      const ultima_cita = citas.length > 0 
        ? new Date(Math.max(...citas.map((c: Cita) => new Date(c.fecha).getTime())))
        : null

      return {
        ...cliente,
        total_citas,
        ultima_cita,
        citas: undefined // Eliminar el array de citas del resultado
      }
    })

    console.log('Clientes obtenidos:', {
      total: clientesProcesados.length,
      primerCliente: clientesProcesados.length > 0 ? {
        id: clientesProcesados[0].id,
        nombre: clientesProcesados[0].nombre_completo,
        dni: clientesProcesados[0].dni,
        totalCitas: clientesProcesados[0].total_citas
      } : null
    })

    return NextResponse.json(clientesProcesados)
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error('Error desconocido')
    console.error('Error detallado al obtener clientes:', {
      error: finalError,
      message: finalError.message,
      stack: finalError.stack,
      type: finalError.constructor.name
    })

    return NextResponse.json(
      { 
        error: 'Error al obtener la lista de clientes',
        details: finalError.message,
        type: finalError.constructor.name
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log('Iniciando endpoint POST /api/clientes')
  
  try {
    let body;
    try {
      console.log('Intentando parsear el cuerpo de la solicitud...')
      body = await request.json()
      console.log('Cuerpo de la solicitud recibido:', {
        body,
        headers: Object.fromEntries(request.headers.entries())
      })
    } catch (parseError) {
      const error = parseError instanceof Error ? parseError : new Error('Error desconocido al parsear JSON')
      console.error('Error al parsear el cuerpo de la solicitud:', {
        error,
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
        rawBody: await request.text().catch(() => 'No se pudo leer el cuerpo de la solicitud')
      })
      return NextResponse.json(
        { 
          error: 'Error al procesar la solicitud',
          details: 'El cuerpo de la solicitud no es un JSON válido',
          type: error.constructor.name
        },
        { status: 400 }
      )
    }

    const { nombre_completo, dni, telefono, email, fecha_nacimiento, direccion, historia_clinica } = body

    // Validaciones básicas
    if (!nombre_completo || !dni) {
      console.error('Validación fallida: campos obligatorios faltantes', {
        nombre_completo: !!nombre_completo,
        dni: !!dni
      })
      return NextResponse.json(
        { error: 'Nombre completo y DNI son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si el DNI ya existe
    const { data: dniExistente, error: dniError } = await supabase
      .from('clientes')
      .select('id')
      .eq('dni', dni)
      .single()

    if (dniError && dniError.code !== 'PGRST116') { // PGRST116 es el código cuando no se encuentra ningún registro
      console.error('Error al verificar DNI:', dniError)
      return NextResponse.json(
        { error: 'Error al verificar DNI existente' },
        { status: 500 }
      )
    }

    if (dniExistente) {
      console.error('Validación fallida: DNI duplicado', { dni })
      return NextResponse.json(
        { error: 'Ya existe un cliente con este DNI' },
        { status: 400 }
      )
    }

    // Crear el nuevo cliente
    const { data: cliente, error: createError } = await supabase
      .from('clientes')
      .insert([{
        nombre_completo,
        dni,
        telefono: telefono || null,
        email: email || null,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        direccion: direccion || null,
        historia_clinica: historia_clinica || {}
      }])
      .select()
      .single()

    if (createError) {
      console.error('Error al crear cliente:', createError)
      return NextResponse.json(
        { 
          error: 'Error al crear el cliente',
          details: createError.message
        },
        { status: 500 }
      )
    }

    console.log('Cliente creado exitosamente:', {
      id: cliente.id,
      nombre: cliente.nombre_completo,
      dni: cliente.dni
    })

    return NextResponse.json(cliente)
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error('Error desconocido')
    console.error('Error al crear cliente:', {
      error: finalError,
      message: finalError.message,
      stack: finalError.stack,
      type: finalError.constructor.name
    })

    return NextResponse.json(
      { 
        error: 'Error al crear el cliente',
        details: finalError.message,
        type: finalError.constructor.name
      },
      { status: 500 }
    )
  }
} 