import { createClient } from '@supabase/supabase-js'
import { toZonedTime, format } from 'date-fns-tz'
import { startOfMonth, endOfMonth } from 'date-fns'
import type { Cita } from "@/types/cita"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para las tablas de Supabase
export type Tratamiento = {
  id: string
  nombre: string
  created_at: string
  updated_at: string
}

export type FechaDisponible = {
  id: string
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  boxes_disponibles: number[]
  hora_inicio: string
  hora_fin: string
  created_at: string
  updated_at: string
}

export type SubTratamiento = {
  id: string
  tratamiento_id: string
  nombre: string
  duracion: number
  precio: number
  created_at: string
  updated_at: string
}

export type Cliente = {
  id: string
  nombre_completo: string
  fecha_nacimiento: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  historia_clinica: Record<string, any>
  created_at: string
  updated_at: string
}

export type FotoCliente = {
  id: string
  cliente_id: string
  url: string
  descripcion: string | null
  fecha_toma: string
  created_at: string
  updated_at: string
}

// Definir el tipo para el box
type Box = {
  id: number
  nombre: string
}

// Función para verificar la conexión y las tablas
export async function verificarBaseDatos() {
  try {
    // Verificar conexión intentando obtener un tratamiento
    const { error: connectionError } = await supabase
      .from('tratamientos')
      .select('id')
      .limit(1)
    
    if (connectionError) {
      // Si el error es que la tabla no existe, intentamos crearla
      if (connectionError.code === '42P01') {
        return { ok: false, error: 'Tabla tratamientos no existe', missingTables: ['tratamientos'] }
      }
      console.error('Error de conexión:', connectionError)
      return { ok: false, error: 'Error de conexión a la base de datos' }
    }

    // Verificar tabla sub_tratamientos
    const { error: subTratamientosError } = await supabase
      .from('sub_tratamientos')
      .select('id')
      .limit(1)
    
    if (subTratamientosError?.code === '42P01') {
      return { ok: false, error: 'Tabla sub_tratamientos no existe', missingTables: ['sub_tratamientos'] }
    }

    // Verificar tabla citas
    const { error: citasError } = await supabase
      .from('citas')
      .select('id')
      .limit(1)
    
    if (citasError?.code === '42P01') {
      return { ok: false, error: 'Tabla citas no existe', missingTables: ['citas'] }
    }

    return { ok: true }
  } catch (error) {
    console.error('Error al verificar base de datos:', error)
    return { ok: false, error: 'Error inesperado al verificar base de datos' }
  }
}

// Función para verificar si las funciones SQL existen
async function verificarFuncionesSQL() {
  try {
    // Intentar llamar a cada función
    const { error: errorTratamientos } = await supabase.rpc('crear_tabla_tratamientos')
    if (errorTratamientos?.code === '42883') {
      console.error('Función crear_tabla_tratamientos no existe')
      return false
    }

    const { error: errorSubTratamientos } = await supabase.rpc('crear_tabla_sub_tratamientos')
    if (errorSubTratamientos?.code === '42883') {
      console.error('Función crear_tabla_sub_tratamientos no existe')
      return false
    }

    const { error: errorCitas } = await supabase.rpc('crear_tabla_citas')
    if (errorCitas?.code === '42883') {
      console.error('Función crear_tabla_citas no existe')
      return false
    }

    return true
  } catch (error) {
    console.error('Error al verificar funciones SQL:', error)
    return false
  }
}

// Función para crear las tablas necesarias
export async function crearTablasNecesarias() {
  try {
    // Verificar si las funciones SQL existen
    const funcionesExisten = await verificarFuncionesSQL()
    if (!funcionesExisten) {
      return { 
        ok: false, 
        error: 'Las funciones SQL necesarias no están creadas. Por favor, ejecute el script SQL en Supabase.' 
      }
    }

    // Crear tabla tratamientos si no existe
    const { error: errorTratamientos } = await supabase.rpc('crear_tabla_tratamientos')
    if (errorTratamientos) {
      console.error('Error al crear tabla tratamientos:', errorTratamientos)
      return { ok: false, error: 'Error al crear tabla tratamientos' }
    }

    // Crear tabla sub_tratamientos si no existe
    const { error: errorSubTratamientos } = await supabase.rpc('crear_tabla_sub_tratamientos')
    if (errorSubTratamientos) {
      console.error('Error al crear tabla sub_tratamientos:', errorSubTratamientos)
      return { ok: false, error: 'Error al crear tabla sub_tratamientos' }
    }

    // Crear tabla citas si no existe
    const { error: errorCitas } = await supabase.rpc('crear_tabla_citas')
    if (errorCitas) {
      console.error('Error al crear tabla citas:', errorCitas)
      return { ok: false, error: 'Error al crear tabla citas' }
    }

    return { ok: true }
  } catch (error) {
    console.error('Error al crear tablas:', error)
    return { ok: false, error: 'Error inesperado al crear tablas' }
  }
}

// Función para obtener tratamientos con sus sub-tratamientos
export async function getTratamientos() {
  try {
    const { data: tratamientos, error: errorTratamientos } = await supabase
      .from('tratamientos')
      .select(`
        id,
        nombre,
        created_at,
        updated_at,
        sub_tratamientos (
          id,
          nombre,
          duracion,
          precio,
          created_at,
          updated_at
        )
      `)
      .order('nombre')

    if (errorTratamientos) throw errorTratamientos
    return tratamientos
  } catch (error) {
    console.error('Error al obtener tratamientos:', error)
    throw error
  }
}

// Función para verificar disponibilidad de box
export async function verificarDisponibilidadBox(
  fecha: string,
  horaInicio: string,
  horaFin: string,
  box: number,
  tratamientoId?: string
): Promise<boolean> {
  console.log('Verificando disponibilidad con parámetros:', {
    fecha,
    horaInicio,
    horaFin,
    box,
    tratamientoId
  })

  try {
    // Primero verificar si el tratamiento está disponible en esa fecha/hora/box
    if (tratamientoId) {
      // Verificar que el ID sea un UUID válido
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tratamientoId)) {
        console.error('ID de tratamiento inválido:', tratamientoId)
        return false
      }

      console.log('Llamando a verificar_disponibilidad_tratamiento con:', {
        p_tratamiento_id: tratamientoId,
        p_fecha: fecha,
        p_hora_inicio: horaInicio,
        p_hora_fin: horaFin,
        p_box_id: box
      })

      const { data: disponibleTratamiento, error: errorTratamiento } = await supabase
        .rpc('verificar_disponibilidad_tratamiento', {
          p_tratamiento_id: tratamientoId,
          p_fecha: fecha,
          p_hora_inicio: horaInicio,
          p_hora_fin: horaFin,
          p_box_id: box
        })

      if (errorTratamiento) {
        console.error('Error verificando disponibilidad del tratamiento:', {
          error: errorTratamiento,
          params: { tratamientoId, fecha, horaInicio, horaFin, box }
        })
        return false
      }

      console.log('Resultado de verificar_disponibilidad_tratamiento:', disponibleTratamiento)

      if (disponibleTratamiento === null || disponibleTratamiento === false) {
        console.log('El tratamiento no está disponible en este horario/box')
        return false
      }
    }

    // Luego verificar si hay citas existentes que se superponen
    console.log('Verificando citas existentes...')
    
    // Convertir las horas a minutos para una comparación más precisa
    const [horaInicioHora, horaInicioMinuto] = horaInicio.split(':').map(Number)
    const [horaFinHora, horaFinMinuto] = horaFin.split(':').map(Number)
    const minutosInicio = horaInicioHora * 60 + horaInicioMinuto
    const minutosFin = horaFinHora * 60 + horaFinMinuto

    // Buscar citas que se superpongan con el horario solicitado
    const { data: citasExistentes, error } = await supabase
      .from('citas')
      .select('id, hora_inicio, hora_fin')
      .eq('fecha', fecha)
      .eq('box_id', box)
      .or(`and(hora_inicio.lte.${horaFin},hora_fin.gt.${horaInicio}),and(hora_inicio.lt.${horaFin},hora_fin.gte.${horaInicio})`)

    if (error) {
      console.error('Error verificando disponibilidad:', error)
      return false
    }

    console.log('Citas existentes encontradas:', {
      total: citasExistentes?.length || 0,
      citas: citasExistentes?.map(c => ({
        id: c.id,
        horaInicio: c.hora_inicio,
        horaFin: c.hora_fin
      }))
    })

    // Si no hay citas existentes, el box está disponible
    const hayDisponibilidad = !citasExistentes || citasExistentes.length === 0
    console.log('¿Hay disponibilidad?:', hayDisponibilidad)

    return hayDisponibilidad
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error)
    return false
  }
}

// Función para crear un tratamiento
export async function crearTratamientoDB(nombre: string) {
  try {
    const { data, error } = await supabase
      .from('tratamientos')
      .insert({
        nombre: nombre.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('Error detallado al crear tratamiento:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(error.message || 'Error al crear tratamiento')
    }

    return data
  } catch (error) {
    console.error('Error al crear tratamiento:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error inesperado al crear tratamiento')
  }
}

// Función para crear un sub-tratamiento
export async function crearSubTratamientoDB(tratamiento_id: string, nombre: string, duracion: number, precio: number) {
  try {
    // Validar que el tratamiento existe
    const { data: tratamiento, error: errorTratamiento } = await supabase
      .from('tratamientos')
      .select('id')
      .eq('id', tratamiento_id)
      .single()

    if (errorTratamiento) {
      console.error('Error al verificar tratamiento:', errorTratamiento)
      throw new Error('El tratamiento seleccionado no existe')
    }

    if (!tratamiento) {
      throw new Error('El tratamiento seleccionado no existe')
    }

    // Crear el sub-tratamiento
    const { data, error } = await supabase
      .from('sub_tratamientos')
      .insert({
        tratamiento_id,
        nombre: nombre.trim(),
        duracion: Number(duracion),
        precio: Number(precio)
      })
      .select()
      .single()

    if (error) {
      console.error('Error detallado al crear sub-tratamiento:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })

      // Manejar errores específicos
      if (error.code === '23505') { // unique_violation
        throw new Error('Ya existe un sub-tratamiento con ese nombre para este tratamiento')
      }
      if (error.code === '23503') { // foreign_key_violation
        throw new Error('El tratamiento seleccionado no existe')
      }
      if (error.code === '23514') { // check_violation
        if (error.message?.includes('duracion')) {
          throw new Error('La duración debe ser mayor a 0')
        }
        if (error.message?.includes('precio')) {
          throw new Error('El precio debe ser mayor o igual a 0')
        }
      }

      throw new Error(error.message || 'Error al crear sub-tratamiento')
    }

    return data
  } catch (error) {
    console.error('Error al crear sub-tratamiento:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error inesperado al crear sub-tratamiento')
  }
}

// Función para eliminar un tratamiento
export async function eliminarTratamientoDB(id: string) {
  try {
    const { error } = await supabase
      .from('tratamientos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error al eliminar tratamiento:', error)
    throw error
  }
}

// Función para eliminar un sub-tratamiento
export async function eliminarSubTratamientoDB(id: string) {
  try {
    const { error } = await supabase
      .from('sub_tratamientos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error al eliminar sub-tratamiento:', error)
    throw error
  }
}

// Funciones de ayuda para las operaciones CRUD
export async function getCitasPorFecha(fecha: Date, obtenerMesCompleto: boolean = false): Promise<{ [key: string]: Cita[] }> {
  try {
    // Convertir la fecha a zona horaria de Argentina
    const fechaArgentina = toZonedTime(fecha, "America/Argentina/Buenos_Aires")
    
    // Determinar el rango de fechas basado en obtenerMesCompleto
    let fechaInicio: Date
    let fechaFin: Date
    
    if (obtenerMesCompleto) {
      // Si es mes completo, obtener del primer al último día del mes
      fechaInicio = startOfMonth(fechaArgentina)
      fechaFin = endOfMonth(fechaArgentina)
    } else {
      // Si es un día específico, usar ese día
      fechaInicio = fechaArgentina
      fechaFin = fechaArgentina
    }

    // Formatear las fechas para la consulta
    const fechaInicioStr = format(fechaInicio, "yyyy-MM-dd")
    const fechaFinStr = format(fechaFin, "yyyy-MM-dd")
    
    console.log('Consultando citas en rango:', {
      fechaInicio: fechaInicioStr,
      fechaFin: fechaFinStr,
      obtenerMesCompleto
    })

    const { data: citasRaw, error } = await supabase
      .from("citas")
      .select(`
        id,
        nombre_completo,
        fecha,
        hora_inicio,
        hora_fin,
        box_id,
        tratamiento_id,
        sub_tratamiento_id,
        color,
        observaciones,
        created_at,
        updated_at,
        tratamiento:tratamiento_id (
          id,
          nombre
        ),
        sub_tratamiento:sub_tratamiento_id (
          id,
          nombre,
          duracion,
          precio
        )
      `)
      .gte("fecha", fechaInicioStr)
      .lte("fecha", fechaFinStr)
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (error) {
      console.error('Error en consulta a Supabase:', error)
      throw new Error(`Error al obtener citas: ${error.message}`)
    }

    if (!citasRaw) {
      console.log('No se encontraron citas en el rango')
      return {}
    }

    console.log(`Se encontraron ${citasRaw.length} citas en el rango`)

    // Transformar los datos y asegurar que las fechas estén en zona horaria de Argentina
    interface CitaRaw {
      id: string
      nombre_completo: string
      fecha: string
      hora_inicio: string
      hora_fin: string
      box_id: number
      tratamiento_id: string
      sub_tratamiento_id: string
      color: string
      observaciones: string | null
      created_at: string | null
      updated_at: string | null
      tratamiento?: {
        id: string
        nombre: string
      }
      sub_tratamiento?: {
        id: string
        nombre: string
        duracion: number
        precio: number
      }
    }

    const citasTransformadas: Cita[] = citasRaw.map((cita: CitaRaw) => {
      // Crear una fecha completa con la fecha y hora en zona horaria de Argentina
      const fechaCitaStr = `${cita.fecha}T00:00:00-03:00` // Especificar explícitamente la zona horaria de Argentina
      const fechaCita = new Date(fechaCitaStr)
      
      // Validar que la fecha sea válida
      if (isNaN(fechaCita.getTime())) {
        throw new Error(`Fecha inválida: ${cita.fecha}`)
      }
      
      // Usar el box_id directamente para el nombre del box
      const boxNombre = `Box ${cita.box_id}`
      
      return {
        id: cita.id,
        fecha: fechaCita,
        horaInicio: cita.hora_inicio,
        horaFin: cita.hora_fin,
        box: boxNombre,
        box_id: cita.box_id,
        nombreCompleto: cita.nombre_completo || "Sin nombre",
        tratamiento: cita.tratamiento_id || undefined,
        subTratamiento: cita.sub_tratamiento_id || undefined,
        nombreTratamiento: cita.tratamiento?.nombre,
        nombreSubTratamiento: cita.sub_tratamiento?.nombre,
        color: cita.color || "#808080",
        duracion: cita.sub_tratamiento?.duracion || null,
        precio: cita.sub_tratamiento?.precio || null,
        senia: 0,
        notas: cita.observaciones || undefined,
        estado: "reservado",
        created_at: cita.created_at ? format(new Date(cita.created_at), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
        updated_at: cita.updated_at ? format(new Date(cita.updated_at), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined
      }
    })

    // Agrupar las citas por fecha
    const citasAgrupadas = citasTransformadas.reduce<{ [key: string]: Cita[] }>((acc, cita) => {
      const fechaStr = format(new Date(cita.fecha), "yyyy-MM-dd")
      if (!acc[fechaStr]) {
        acc[fechaStr] = []
      }
      acc[fechaStr].push(cita)
      return acc
    }, {})

    console.log('Citas agrupadas por fecha:', Object.keys(citasAgrupadas).length, 'días')

    return citasAgrupadas
  } catch (error) {
    console.error("Error en getCitasPorFecha:", error)
    return {}
  }
}

export async function crearCita(cita: Omit<Cita, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('citas')
    .insert(cita)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function actualizarCita(id: string, cita: Partial<Cita>) {
  const { data, error } = await supabase
    .from('citas')
    .update(cita)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function eliminarCita(id: string) {
  const { error } = await supabase
    .from('citas')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Suscripción en tiempo real para citas
export function suscribirACitas(fecha: Date, callback: (citas: Cita[]) => void) {
  const fechaStr = fecha.toISOString().split('T')[0]
  
  return supabase
    .channel('citas')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'citas',
        filter: `fecha=eq.${fechaStr}`
      },
      async () => {
        const citas = await getCitasPorFecha(fecha)
        callback(citas)
      }
    )
    .subscribe()
}

// Funciones para clientes
export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre_completo')
  
  if (error) throw error
  return data
}

export async function getCliente(id: string) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*, fotos_clientes(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function crearCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('clientes')
    .insert(cliente)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function actualizarCliente(id: string, cliente: Partial<Cliente>) {
  const { data, error } = await supabase
    .from('clientes')
    .update(cliente)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function eliminarCliente(id: string) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Funciones para fotos
export async function subirFotoCliente(
  clienteId: string,
  file: File,
  descripcion?: string
) {
  // 1. Subir el archivo al bucket
  const fileExt = file.name.split('.').pop()
  const fileName = `${clienteId}/${Date.now()}.${fileExt}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('fotos_clientes')
    .upload(fileName, file)
  
  if (uploadError) throw uploadError
  
  // 2. Obtener la URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('fotos_clientes')
    .getPublicUrl(fileName)
  
  // 3. Crear el registro en la tabla fotos_clientes
  const { data, error } = await supabase
    .from('fotos_clientes')
    .insert({
      cliente_id: clienteId,
      url: publicUrl,
      descripcion
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function eliminarFotoCliente(id: string) {
  // 1. Obtener la información de la foto
  const { data: foto, error: fetchError } = await supabase
    .from('fotos_clientes')
    .select('url')
    .eq('id', id)
    .single()
  
  if (fetchError) throw fetchError
  
  // 2. Eliminar el archivo del storage
  const fileName = foto.url.split('/').pop()
  if (fileName) {
    const { error: deleteError } = await supabase.storage
      .from('fotos_clientes')
      .remove([fileName])
    
    if (deleteError) throw deleteError
  }
  
  // 3. Eliminar el registro de la base de datos
  const { error } = await supabase
    .from('fotos_clientes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Función para actualizar un tratamiento
export async function actualizarTratamientoDB(
  id: string,
  data: {
    nombre?: string
    dias_disponibles?: string[]
    boxes_disponibles?: number[]
    hora_inicio?: string
    hora_fin?: string
  }
) {
  try {
    const { data: updatedData, error } = await supabase
      .from('tratamientos')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error detallado al actualizar tratamiento:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(error.message || 'Error al actualizar tratamiento')
    }

    return updatedData
  } catch (error) {
    console.error('Error al actualizar tratamiento:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error inesperado al actualizar tratamiento')
  }
}

// Función para actualizar un sub-tratamiento
export async function actualizarSubTratamientoDB(id: string, nombre: string, duracion: number, precio: number) {
  try {
    const { data, error } = await supabase
      .from('sub_tratamientos')
      .update({
        nombre: nombre.trim(),
        duracion: Number(duracion),
        precio: Number(precio)
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error detallado al actualizar sub-tratamiento:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })

      // Manejar errores específicos
      if (error.code === '23505') { // unique_violation
        throw new Error('Ya existe un sub-tratamiento con ese nombre para este tratamiento')
      }
      if (error.code === '23514') { // check_violation
        if (error.message?.includes('duracion')) {
          throw new Error('La duración debe ser mayor a 0')
        }
        if (error.message?.includes('precio')) {
          throw new Error('El precio debe ser mayor o igual a 0')
        }
      }

      throw new Error(error.message || 'Error al actualizar sub-tratamiento')
    }

    return data
  } catch (error) {
    console.error('Error al actualizar sub-tratamiento:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error inesperado al actualizar sub-tratamiento')
  }
}

// Función para obtener las fechas disponibles de un tratamiento
export async function getFechasDisponibles(tratamientoId: string) {
  try {
    const { data, error } = await supabase
      .from('fechas_disponibles')
      .select('*')
      .eq('tratamiento_id', tratamientoId)
      .order('fecha_inicio')

    if (error) {
      console.error('Error al obtener fechas disponibles:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error al obtener fechas disponibles:', error)
    throw error
  }
}

// Función para crear una fecha disponible
export async function crearFechaDisponible(
  tratamientoId: string,
  fechaInicio: string,
  fechaFin: string,
  boxesDisponibles: number[],
  horaInicio: string,
  horaFin: string
) {
  try {
    // Función para convertir una fecha a la zona horaria de Argentina
    const convertirFechaArgentina = (fecha: string) => {
      // Crear la fecha en la zona horaria de Argentina
      const fechaArgentina = new Date(fecha + 'T00:00:00-03:00')
      
      // Verificar que la fecha sea válida
      if (isNaN(fechaArgentina.getTime())) {
        throw new Error(`Fecha inválida: ${fecha}`)
      }
      
      return fechaArgentina
    }

    // Convertir las fechas a la zona horaria de Argentina
    const inicio = convertirFechaArgentina(fechaInicio)
    const fin = convertirFechaArgentina(fechaFin)
    
    // Asegurar que la fecha de inicio no sea posterior a la fecha de fin
    if (inicio > fin) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin')
    }

    // Formatear las fechas en formato YYYY-MM-DD
    const fechaInicioFormateada = inicio.toISOString().split('T')[0]
    const fechaFinFormateada = fin.toISOString().split('T')[0]

    console.log('Fechas procesadas:', {
      fechaInicioOriginal: fechaInicio,
      fechaFinOriginal: fin,
      fechaInicioAjustada: fechaInicioFormateada,
      fechaFinAjustada: fechaFinFormateada,
      zonaHoraria: 'America/Argentina/Buenos_Aires'
    })

    // Validar que las horas sean válidas
    const [horaInicioHora, horaInicioMinuto] = horaInicio.split(':').map(Number)
    const [horaFinHora, horaFinMinuto] = horaFin.split(':').map(Number)

    if (
      isNaN(horaInicioHora) || isNaN(horaInicioMinuto) ||
      isNaN(horaFinHora) || isNaN(horaFinMinuto) ||
      horaInicioHora < 0 || horaInicioHora > 23 ||
      horaFinHora < 0 || horaFinHora > 23 ||
      horaInicioMinuto < 0 || horaInicioMinuto > 59 ||
      horaFinMinuto < 0 || horaFinMinuto > 59
    ) {
      throw new Error('Las horas proporcionadas no son válidas')
    }

    // Asegurar que la hora de inicio no sea posterior a la hora de fin
    const horaInicioMinutos = horaInicioHora * 60 + horaInicioMinuto
    const horaFinMinutos = horaFinHora * 60 + horaFinMinuto
    if (horaInicioMinutos >= horaFinMinutos) {
      throw new Error('La hora de inicio debe ser anterior a la hora de fin')
    }

    // Validar que haya al menos un box disponible
    if (!boxesDisponibles || boxesDisponibles.length === 0) {
      throw new Error('Debe seleccionar al menos un box disponible')
    }

    // Validar que los boxes sean números válidos entre 1 y 8
    if (!boxesDisponibles.every(box => Number.isInteger(box) && box >= 1 && box <= 8)) {
      throw new Error('Los boxes deben ser números entre 1 y 8')
    }

    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('fechas_disponibles')
      .insert({
        tratamiento_id: tratamientoId,
        fecha_inicio: fechaInicioFormateada,
        fecha_fin: fechaFinFormateada,
        boxes_disponibles: boxesDisponibles,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear fecha disponible:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error al crear fecha disponible:', error)
    throw error
  }
}

// Función para actualizar una fecha disponible
export async function actualizarFechaDisponible(
  id: string,
  data: {
    fecha_inicio?: string
    fecha_fin?: string
    boxes_disponibles?: number[]
    hora_inicio?: string
    hora_fin?: string
  }
) {
  try {
    const { data: updatedData, error } = await supabase
      .from('fechas_disponibles')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar fecha disponible:', error)
      throw error
    }

    return updatedData
  } catch (error) {
    console.error('Error al actualizar fecha disponible:', error)
    throw error
  }
}

// Función para eliminar una fecha disponible
export async function eliminarFechaDisponible(id: string) {
  try {
    const { error } = await supabase
      .from('fechas_disponibles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error al eliminar fecha disponible:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error al eliminar fecha disponible:', error)
    throw error
  }
} 