import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'

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

// GET /api/tratamientos/[id]/disponibilidad
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readJsonFile('disponibilidad.json')
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar la disponibilidad' }, { status: 500 })
    }

    const disponibilidad = data.disponibilidad.find((d: any) => d.tratamiento_id === id)
    if (!disponibilidad) {
      return NextResponse.json({ error: 'No hay disponibilidad para este tratamiento' }, { status: 404 })
    }

    // Transformar los datos al formato esperado
    const diasDisponibles = disponibilidad.horarios
      ?.reduce((dias: string[], horario: any) => {
        if (horario.dias_semana) {
          // Convertir números de día a nombres
          const diasSemana = horario.dias_semana.map((dia: number) => {
            const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
            return dias[dia - 1] // Restamos 1 porque los días en la base van de 1-7
          })
          // Agregar días únicos
          diasSemana.forEach((dia: string) => {
            if (!dias.includes(dia)) {
              dias.push(dia)
            }
          })
        }
        return dias
      }, []) || []

    return NextResponse.json({
      fecha_inicio: disponibilidad.fecha_inicio,
      fecha_fin: disponibilidad.fecha_fin,
      dias_disponibles: diasDisponibles,
      horarios: disponibilidad.horarios || []
    })
  } catch (error) {
    console.error('Error en GET /api/tratamientos/[id]/disponibilidad:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/tratamientos/[id]/disponibilidad
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const disponibilidad = await request.json()
    
    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    const fechaInicio = new Date(disponibilidad.fecha_inicio)
    const fechaFin = new Date(disponibilidad.fecha_fin)
    if (fechaInicio > fechaFin) {
      return NextResponse.json({ 
        error: 'La fecha de inicio no puede ser posterior a la fecha de fin' 
      }, { status: 400 })
    }

    // Validar que la hora de inicio sea anterior a la hora de fin
    if (disponibilidad.cantidad_clientes > 1) {
      // Para turnos compartidos, la hora de fin debe ser igual a la hora de inicio
      if (disponibilidad.hora_inicio !== disponibilidad.hora_fin) {
        return NextResponse.json({ 
          error: 'Para turnos compartidos, la hora de fin debe ser igual a la hora de inicio' 
        }, { status: 400 })
      }
    } else {
      // Para turnos individuales, validar que la hora de inicio sea anterior a la hora de fin
      const [horaInicioHora, horaInicioMinuto] = disponibilidad.hora_inicio.split(':').map(Number)
      const [horaFinHora, horaFinMinuto] = disponibilidad.hora_fin.split(':').map(Number)
      const horaInicioMinutos = horaInicioHora * 60 + horaInicioMinuto
      const horaFinMinutos = horaFinHora * 60 + horaFinMinuto
      if (horaInicioMinutos >= horaFinMinutos) {
        return NextResponse.json({ 
          error: 'La hora de inicio debe ser anterior a la hora de fin' 
        }, { status: 400 })
      }
    }

    // Validar que la cantidad de clientes sea positiva
    if (disponibilidad.cantidad_clientes <= 0) {
      return NextResponse.json({ 
        error: 'La cantidad de clientes debe ser mayor a 0' 
      }, { status: 400 })
    }

    // Validar que boxes_disponibles sea un array válido
    if (!Array.isArray(disponibilidad.boxes_disponibles)) {
      return NextResponse.json({ 
        error: 'boxes_disponibles debe ser un array' 
      }, { status: 400 })
    }

    if (disponibilidad.boxes_disponibles.length === 0) {
      return NextResponse.json({ 
        error: 'Debe seleccionar al menos un box disponible' 
      }, { status: 400 })
    }

    // Validar que no haya valores null en boxes_disponibles
    if (disponibilidad.boxes_disponibles.some((box: number) => box === null || box === undefined)) {
      return NextResponse.json({ 
        error: 'Los boxes disponibles no pueden contener valores nulos' 
      }, { status: 400 })
    }

    // Validar que todos los boxes sean números positivos
    if (disponibilidad.boxes_disponibles.some((box: number) => typeof box !== 'number' || box <= 0)) {
      return NextResponse.json({ 
        error: 'Los boxes disponibles deben ser números positivos' 
      }, { status: 400 })
    }

    // Verificar si ya existe un turno con los mismos datos
    const { data: turnosExistentes, error: errorVerificacion } = await supabase
      .from('fechas_disponibles')
      .select('*')
      .eq('tratamiento_id', id)
      .eq('fecha_inicio', disponibilidad.fecha_inicio)
      .eq('fecha_fin', disponibilidad.fecha_fin)
      .eq('hora_inicio', disponibilidad.hora_inicio)
      .eq('hora_fin', disponibilidad.hora_fin)
      .eq('cantidad_clientes', disponibilidad.cantidad_clientes)

    if (errorVerificacion) {
      console.error('Error al verificar turnos existentes:', errorVerificacion)
      return NextResponse.json({ 
        error: 'Error al verificar turnos existentes' 
      }, { status: 500 })
    }

    if (turnosExistentes && turnosExistentes.length > 0) {
      // Verificar si alguno de los turnos existentes tiene los mismos boxes
      const turnoDuplicado = turnosExistentes.find(turno => {
        if (!Array.isArray(turno.boxes_disponibles)) return false
        
        const boxesIguales = turno.boxes_disponibles.length === disponibilidad.boxes_disponibles.length &&
          turno.boxes_disponibles.every((box: number) => disponibilidad.boxes_disponibles.includes(box))
        
        return boxesIguales
      })

      if (turnoDuplicado) {
        return NextResponse.json({ 
          error: 'Ya existe un turno con exactamente los mismos datos (fecha, hora y boxes)' 
        }, { status: 400 })
      }
    }

    // Intentar la inserción
    const { data, error } = await supabase
      .from('fechas_disponibles')
      .insert([{
        tratamiento_id: id,
        fecha_inicio: disponibilidad.fecha_inicio,
        fecha_fin: disponibilidad.fecha_fin,
        hora_inicio: disponibilidad.hora_inicio,
        hora_fin: disponibilidad.hora_fin,
        boxes_disponibles: disponibilidad.boxes_disponibles,
        cantidad_clientes: disponibilidad.cantidad_clientes
      }])
      .select()
      .single()

    if (error) {
      console.error('Error al crear fecha disponible:', error)
      return NextResponse.json({ 
        error: 'Error al crear la fecha disponible' 
      }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en POST /api/tratamientos/[id]/disponibilidad:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

// PUT /api/tratamientos/[id]/disponibilidad
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const disponibilidad = await request.json()
    const data = await readJsonFile('disponibilidad.json')
    
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar la disponibilidad' }, { status: 500 })
    }

    const index = data.disponibilidad.findIndex((d: any) => d.tratamiento_id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'No hay disponibilidad para este tratamiento' }, { status: 404 })
    }

    data.disponibilidad[index] = {
      ...data.disponibilidad[index],
      ...disponibilidad,
      tratamiento_id: id
    }

    const success = await writeJsonFile('disponibilidad.json', data)
    if (!success) {
      return NextResponse.json({ error: 'Error al guardar los cambios' }, { status: 500 })
    }

    return NextResponse.json(data.disponibilidad[index])
  } catch (error) {
    console.error('Error en PUT /api/tratamientos/[id]/disponibilidad:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/tratamientos/[id]/disponibilidad
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readJsonFile('disponibilidad.json')
    if (!data) {
      return NextResponse.json({ error: 'No se pudieron cargar la disponibilidad' }, { status: 500 })
    }

    const index = data.disponibilidad.findIndex((d: any) => d.tratamiento_id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'No hay disponibilidad para este tratamiento' }, { status: 404 })
    }

    data.disponibilidad.splice(index, 1)
    const success = await writeJsonFile('disponibilidad.json', data)
    if (!success) {
      return NextResponse.json({ error: 'Error al guardar los cambios' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/tratamientos/[id]/disponibilidad:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 