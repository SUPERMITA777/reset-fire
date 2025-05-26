import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@/lib/generated/prisma'

let prisma: PrismaClient

try {
  prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
  console.log('PrismaClient inicializado correctamente')
} catch (error) {
  console.error('Error al inicializar PrismaClient:', {
    error,
    message: error instanceof Error ? error.message : 'Error desconocido',
    stack: error instanceof Error ? error.stack : undefined
  })
  throw new Error('No se pudo inicializar la conexión a la base de datos')
}

type TableExists = {
  exists: boolean
}

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

export async function GET() {
  console.log('Iniciando endpoint GET /api/clientes')
  
  if (!prisma) {
    const error = new Error('PrismaClient no está inicializado')
    console.error('Error de inicialización:', {
      error,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      prismaState: typeof prisma
    })
    return NextResponse.json(
      { 
        error: 'Error de conexión a la base de datos',
        details: 'PrismaClient no inicializado',
        type: error.constructor.name
      },
      { status: 500 }
    )
  }

  try {
    // Verificar la conexión a la base de datos
    console.log('Intentando conectar a la base de datos...')
    await prisma.$connect()
    console.log('Conexión a la base de datos establecida exitosamente')
    
    // Verificar el estado de la conexión y el esquema
    console.log('Verificando esquema de la base de datos...')
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clientes'
      ORDER BY ordinal_position;
    `
    console.log('Esquema de la tabla clientes:', tableInfo)

    // Verificar la conexión con una consulta simple
    const dbStatus = await prisma.$queryRaw`SELECT 1 as status`
    console.log('Estado de la conexión a la base de datos:', { dbStatus })

    // Verificar si la tabla existe
    const tableExists = await prisma.$queryRaw<TableExists[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clientes'
      );
    `

    if (!tableExists[0].exists) {
      console.error('La tabla clientes no existe en la base de datos')
      return NextResponse.json(
        { error: 'La tabla de clientes no está configurada correctamente' },
        { status: 500 }
      )
    }

    // Obtenemos los clientes usando el cliente Prisma
    const clientes = await prisma.$queryRaw<Cliente[]>`
      WITH citas_info AS (
        SELECT 
          cliente_id,
          COUNT(*) as total_citas,
          MAX(fecha) as ultima_cita
        FROM citas
        GROUP BY cliente_id
      )
      SELECT 
        c.id,
        c.nombre_completo,
        c.dni,
        c.telefono,
        c.email,
        c.fecha_nacimiento,
        c.direccion,
        c.historia_clinica,
        c.created_at,
        c.updated_at,
        COALESCE(ci.total_citas, 0) as total_citas,
        ci.ultima_cita
      FROM clientes c
      LEFT JOIN citas_info ci ON c.id = ci.cliente_id
      ORDER BY c.nombre_completo ASC;
    `

    console.log('Clientes obtenidos:', {
      total: clientes.length,
      primerCliente: clientes.length > 0 ? {
        id: clientes[0].id,
        nombre: clientes[0].nombre_completo,
        dni: clientes[0].dni,
        totalCitas: clientes[0].total_citas
      } : null
    })

    // Cerrar la conexión después de usar
    await prisma.$disconnect()
    console.log('Conexión a la base de datos cerrada')

    return NextResponse.json(clientes)
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error('Error desconocido')
    console.error('Error detallado al obtener clientes:', {
      error: finalError,
      message: finalError.message,
      stack: finalError.stack,
      type: finalError.constructor.name,
      code: finalError instanceof Prisma.PrismaClientKnownRequestError ? finalError.code : undefined,
      meta: finalError instanceof Prisma.PrismaClientKnownRequestError ? finalError.meta : undefined
    })

    // Intentar cerrar la conexión en caso de error
    try {
      await prisma.$disconnect()
      console.log('Conexión a la base de datos cerrada después del error')
    } catch (disconnectError) {
      console.error('Error al cerrar la conexión después del error:', disconnectError)
    }

    return NextResponse.json(
      { 
        error: 'Error al obtener la lista de clientes',
        details: finalError.message,
        type: finalError.constructor.name,
        code: finalError instanceof Prisma.PrismaClientKnownRequestError ? finalError.code : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log('Iniciando endpoint POST /api/clientes')
  
  if (!prisma) {
    const error = new Error('PrismaClient no está inicializado')
    console.error('Error de inicialización:', {
      error,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      prismaState: typeof prisma
    })
    return NextResponse.json(
      { 
        error: 'Error de conexión a la base de datos',
        details: 'PrismaClient no inicializado',
        type: error.constructor.name
      },
      { status: 500 }
    )
  }

  try {
    // Verificar la conexión a la base de datos
    try {
      console.log('Intentando conectar a la base de datos...')
      await prisma.$connect()
      console.log('Conexión a la base de datos establecida exitosamente')
    } catch (connectError) {
      const error = connectError instanceof Error ? connectError : new Error('Error desconocido al conectar')
      console.error('Error al conectar con la base de datos:', {
        error,
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        meta: error instanceof Prisma.PrismaClientKnownRequestError ? error.meta : undefined
      })
      return NextResponse.json(
        { 
          error: 'Error de conexión a la base de datos',
          details: error.message,
          type: error.constructor.name,
          code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
        },
        { status: 500 }
      )
    }

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
    const dniExistente = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM clientes WHERE dni = ${dni}
    `

    if (dniExistente.length > 0) {
      console.error('Validación fallida: DNI duplicado', { dni })
      return NextResponse.json(
        { error: 'Ya existe un cliente con este DNI' },
        { status: 400 }
      )
    }

    const cliente = await prisma.$queryRaw<Cliente[]>`
      INSERT INTO clientes (
        nombre_completo,
        dni,
        telefono,
        email,
        fecha_nacimiento,
        direccion,
        historia_clinica
      ) VALUES (
        ${nombre_completo},
        ${dni},
        ${telefono || null},
        ${email || null},
        ${fecha_nacimiento ? new Date(fecha_nacimiento) : null},
        ${direccion || null},
        ${historia_clinica ? JSON.stringify(historia_clinica) : '{}'}
      )
      RETURNING *;
    `

    console.log('Cliente creado exitosamente:', {
      id: cliente[0].id,
      nombre: cliente[0].nombre_completo,
      dni: cliente[0].dni
    })

    // Cerrar la conexión después de usar
    await prisma.$disconnect()
    console.log('Conexión a la base de datos cerrada')

    return NextResponse.json(cliente[0])
  } catch (error) {
    const finalError = error instanceof Error ? error : new Error('Error desconocido')
    console.error('Error al crear cliente:', {
      error: finalError,
      message: finalError.message,
      stack: finalError.stack,
      type: finalError.constructor.name,
      code: finalError instanceof Prisma.PrismaClientKnownRequestError ? finalError.code : undefined,
      meta: finalError instanceof Prisma.PrismaClientKnownRequestError ? finalError.meta : undefined
    })

    // Intentar cerrar la conexión en caso de error
    try {
      await prisma.$disconnect()
      console.log('Conexión a la base de datos cerrada después del error')
    } catch (disconnectError) {
      console.error('Error al cerrar la conexión después del error:', disconnectError)
    }

    return NextResponse.json(
      { 
        error: 'Error al crear el cliente',
        details: finalError.message,
        type: finalError.constructor.name,
        code: finalError instanceof Prisma.PrismaClientKnownRequestError ? finalError.code : undefined
      },
      { status: 500 }
    )
  }
} 