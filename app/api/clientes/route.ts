import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type Cliente = {
  id: string
  nombre_completo: string
  dni: string
  whatsapp: string | null
  created_at: Date
  updated_at: Date
  total_citas: number
  ultima_cita: Date | null
}

type Cita = {
  id: string
  fecha: string
  hora: string
  estado: string
  rf_subtratamientos: {
    nombre_subtratamiento: string
    precio: number
  } | null
}

type ClienteConCitas = Cliente & {
  rf_citas: Cita[]
}

export async function GET(request: Request) {
  console.log('Iniciando endpoint GET /api/clientes')
  
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    console.log('Parámetros de búsqueda:', { search })
    
    // Construir la consulta base
    let query = supabase
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
            nombre_subtratamiento,
            precio
          )
        )
      `)
      .order('nombre_completo', { ascending: true })

    // Aplicar filtro de búsqueda si se proporciona
    if (search && search.trim()) {
      const searchTerm = search.trim()
      
      // Búsqueda más completa que incluye todos los campos relevantes
      query = query.or(`
        dni.ilike.%${searchTerm}%,
        nombre_completo.ilike.%${searchTerm}%,
        whatsapp.ilike.%${searchTerm}%,
        id.ilike.%${searchTerm}%,
        created_at::text.ilike.%${searchTerm}%,
        updated_at::text.ilike.%${searchTerm}%
      `)
      
      // También buscar en las citas relacionadas
      query = query.or(`
        rf_citas.fecha::text.ilike.%${searchTerm}%,
        rf_citas.hora.ilike.%${searchTerm}%,
        rf_citas.estado.ilike.%${searchTerm}%,
        rf_citas.notas.ilike.%${searchTerm}%,
        rf_citas.precio::text.ilike.%${searchTerm}%,
        rf_citas.sena::text.ilike.%${searchTerm}%,
        rf_citas.box::text.ilike.%${searchTerm}%,
        rf_citas.rf_subtratamientos.nombre_subtratamiento.ilike.%${searchTerm}%,
        rf_citas.rf_subtratamientos.precio::text.ilike.%${searchTerm}%
      `)
      
      // Búsqueda adicional para términos específicos
      if (searchTerm.toLowerCase().includes('confirmado') || searchTerm.toLowerCase().includes('completado') || 
          searchTerm.toLowerCase().includes('cancelado') || searchTerm.toLowerCase().includes('reservado')) {
        query = query.or(`rf_citas.estado.ilike.%${searchTerm}%`)
      }
      
      // Búsqueda por números (precio, box, etc.)
      if (/^\d+$/.test(searchTerm)) {
        query = query.or(`
          rf_citas.precio.eq.${searchTerm},
          rf_citas.sena.eq.${searchTerm},
          rf_citas.box.eq.${searchTerm},
          rf_citas.rf_subtratamientos.precio.eq.${searchTerm}
        `)
      }
      
      // Búsqueda por patrones de fecha (dd/mm/yyyy, yyyy-mm-dd, etc.)
      const datePatterns = [
        /^\d{2}\/\d{2}\/\d{4}$/, // dd/mm/yyyy
        /^\d{4}-\d{2}-\d{2}$/,   // yyyy-mm-dd
        /^\d{2}-\d{2}-\d{4}$/,   // dd-mm-yyyy
        /^\d{1,2}\/\d{1,2}\/\d{4}$/ // d/m/yyyy
      ]
      
      if (datePatterns.some(pattern => pattern.test(searchTerm))) {
        // Convertir diferentes formatos de fecha a formato ISO
        let isoDate = searchTerm
        if (searchTerm.includes('/')) {
          const parts = searchTerm.split('/')
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              // yyyy/mm/dd
              isoDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
            } else {
              // dd/mm/yyyy
              isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
            }
          }
        } else if (searchTerm.includes('-')) {
          const parts = searchTerm.split('-')
          if (parts.length === 3 && parts[0].length === 2) {
            // dd-mm-yyyy
            isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
          }
        }
        
        query = query.or(`
          rf_citas.fecha.eq.${isoDate},
          created_at::date.eq.${isoDate}
        `)
      }
    }

    const { data: clientes, error: clientesError } = await query

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
    const clientesProcesados = (clientes || []).map((cliente: ClienteConCitas) => {
      const citas = cliente.rf_citas || []
      const total_citas = citas.length
      const ultima_cita = citas.length > 0 
        ? new Date(Math.max(...citas.map((c: Cita) => new Date(c.fecha).getTime())))
        : null

      return {
        ...cliente,
        total_citas,
        ultima_cita,
        rf_citas: undefined // Eliminar el array de citas del resultado
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

    const { nombre_completo, dni, whatsapp } = body

    // Validaciones básicas
    if (!nombre_completo || !whatsapp) {
      console.error('Validación fallida: campos obligatorios faltantes', {
        nombre_completo: !!nombre_completo,
        whatsapp: !!whatsapp
      })
      return NextResponse.json(
        { error: 'Nombre completo y WhatsApp son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar si el WhatsApp ya existe
    const { data: whatsappExistente, error: whatsappError } = await supabase
      .from('rf_clientes')
      .select('id')
      .eq('whatsapp', whatsapp)
      .single()

    if (whatsappError && whatsappError.code !== 'PGRST116') { // PGRST116 es el código cuando no se encuentra ningún registro
      console.error('Error al verificar WhatsApp:', whatsappError)
      return NextResponse.json(
        { error: 'Error al verificar WhatsApp existente' },
        { status: 500 }
      )
    }

    if (whatsappExistente) {
      console.error('Validación fallida: WhatsApp duplicado', { whatsapp })
      return NextResponse.json(
        { error: 'Ya existe un cliente con este WhatsApp' },
        { status: 400 }
      )
    }

    // Si se proporciona DNI, verificar que no esté duplicado
    if (dni) {
      const { data: dniExistente, error: dniError } = await supabase
        .from('rf_clientes')
        .select('id')
        .eq('dni', dni)
        .single()

      if (dniError && dniError.code !== 'PGRST116') {
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
    }

    // Crear el nuevo cliente
    const { data: cliente, error: createError } = await supabase
      .from('rf_clientes')
      .insert([{
        nombre_completo,
        dni: dni || null,
        whatsapp: whatsapp
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

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error('Error desconocido')
    console.error('Error detallado al crear cliente:', {
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