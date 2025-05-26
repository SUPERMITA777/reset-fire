import { NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { format } from 'date-fns'

let prisma: PrismaClient

try {
  prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
} catch (error) {
  console.error('Error al inicializar PrismaClient:', error)
  throw new Error('No se pudo inicializar la conexión a la base de datos')
}

type Cita = {
  id: string
  fecha: Date
  hora_inicio: string
  hora_fin: string
  box_id: number
  color: string
  observaciones: string | null
  created_at: Date
  updated_at: Date
  tratamiento_nombre: string
  subtratamiento_nombre: string
  duracion: number
  precio: number
  senia: number
  estado: 'completada' | 'pendiente'
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const citas = await prisma.$queryRaw<Cita[]>`
      SELECT 
        ci.id,
        ci.fecha,
        ci.hora_inicio,
        ci.hora_fin,
        ci.box_id,
        ci.color,
        ci.observaciones,
        ci.created_at,
        ci.updated_at,
        t.nombre as tratamiento_nombre,
        st.nombre as subtratamiento_nombre,
        st.duracion,
        st.precio,
        ci.senia,
        CASE 
          WHEN ci.fecha < CURRENT_DATE THEN 'completada'
          WHEN ci.fecha = CURRENT_DATE AND ci.hora_fin < CURRENT_TIME THEN 'completada'
          ELSE 'pendiente'
        END as estado
      FROM citas ci
      LEFT JOIN tratamientos t ON ci.tratamiento_id = t.id
      LEFT JOIN sub_tratamientos st ON ci.sub_tratamiento_id = st.id
      WHERE ci.cliente_id = ${params.id}
      ORDER BY ci.fecha DESC, ci.hora_inicio DESC
    `

    // Formatear las fechas y horas para el frontend
    const citasFormateadas = citas.map((cita) => ({
      ...cita,
      fecha: format(new Date(cita.fecha), 'yyyy-MM-dd'),
      hora_inicio: format(new Date(`2000-01-01T${cita.hora_inicio}`), 'HH:mm'),
      hora_fin: format(new Date(`2000-01-01T${cita.hora_fin}`), 'HH:mm'),
      created_at: format(new Date(cita.created_at), "yyyy-MM-dd'T'HH:mm:ssXXX"),
      updated_at: format(new Date(cita.updated_at), "yyyy-MM-dd'T'HH:mm:ssXXX")
    }))

    return NextResponse.json(citasFormateadas)
  } catch (error) {
    console.error('Error al obtener citas del cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener las citas del cliente' },
      { status: 500 }
    )
  }
} 