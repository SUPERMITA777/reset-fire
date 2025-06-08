import { createClient } from '@supabase/supabase-js'
import { toZonedTime, format } from 'date-fns-tz'
import { startOfMonth, endOfMonth, parseISO, addMinutes } from 'date-fns'
import type { Cita, Tratamiento, SubTratamiento } from "@/types/cita"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Crear una única instancia del cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'reset-fire-auth',
  }
})

// Tipos para las tablas de Supabase
type FechaDisponibleDB = {
  id: string
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  boxes_disponibles: number[]
  hora_inicio: string
  hora_fin: string
  cantidad_clientes: number
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
export async function getTratamientos(): Promise<Tratamiento[]> {
  try {
    const { data, error } = await supabase
      .from('rf_tratamientos')
      .select(`
        *,
        rf_subtratamientos (*)
      `)
      .order('nombre_tratamiento')

    if (error) throw error
    return data || []
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
      citas: citasExistentes?.map((c: { id: string, hora_inicio: string, hora_fin: string }) => ({
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
export async function crearTratamientoDB(params: {
  nombre: string
  max_clientes_por_turno: number
  es_compartido: boolean
  descripcion?: string
}): Promise<Tratamiento> {
  try {
    const { data, error } = await supabase
      .from('tratamientos')
      .insert([{
        nombre: params.nombre,
        max_clientes_por_turno: params.max_clientes_por_turno,
        es_compartido: params.es_compartido,
        descripcion: params.descripcion || ''
      }])
      .select()
      .single()

    if (error) {
      console.error('Error detallado al crear tratamiento:', error)
      throw new Error(error.message || 'Error al crear el tratamiento')
    }

    if (!data) {
      throw new Error('No se recibió respuesta al crear el tratamiento')
    }

    return data
  } catch (error) {
    console.error('Error al crear tratamiento:', error)
    throw error instanceof Error ? error : new Error('Error desconocido al crear el tratamiento')
  }
}

// Función para actualizar un tratamiento
export async function actualizarTratamientoDB(params: {
  id: string
  nombre: string
  max_clientes_por_turno: number
  es_compartido: boolean
  descripcion?: string
}): Promise<Tratamiento> {
  try {
    const { data, error } = await supabase
      .from('tratamientos')
      .update({
        nombre: params.nombre,
        max_clientes_por_turno: params.max_clientes_por_turno,
        es_compartido: params.es_compartido,
        descripcion: params.descripcion || ''
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error detallado al actualizar tratamiento:', error)
      throw new Error(error.message || 'Error al actualizar el tratamiento')
    }

    if (!data) {
      throw new Error('No se recibió respuesta al actualizar el tratamiento')
    }

    return data
  } catch (error) {
    console.error('Error al actualizar tratamiento:', error)
    throw error instanceof Error ? error : new Error('Error desconocido al actualizar el tratamiento')
  }
}

// Función para eliminar un tratamiento
export async function eliminarTratamientoDB(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tratamientos')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error al eliminar tratamiento:', error)
    throw error
  }
}

// Función para crear un sub-tratamiento
export async function crearSubTratamientoDB(params: {
  tratamiento_id: string
  nombre: string
  duracion: number
  precio: number
}): Promise<SubTratamiento> {
  try {
    const { data, error } = await supabase
      .from('sub_tratamientos')
      .insert([{
        tratamiento_id: params.tratamiento_id,
        nombre: params.nombre,
        duracion: params.duracion,
        precio: params.precio
      }])
      .select()
      .single()

    if (error) {
      console.error('Error detallado al crear sub-tratamiento:', error)
      throw new Error(error.message || 'Error al crear el sub-tratamiento')
    }

    if (!data) {
      throw new Error('No se recibió respuesta al crear el sub-tratamiento')
    }

    return data
  } catch (error) {
    console.error('Error al crear sub-tratamiento:', error)
    throw error instanceof Error ? error : new Error('Error desconocido al crear el sub-tratamiento')
  }
}

// Función para editar un sub-tratamiento
export async function editarSubTratamientoDB(id: string, nombre: string, duracion: number, precio: number): Promise<SubTratamiento> {
  const { data, error } = await supabase
    .from('sub_tratamientos')
    .update({ nombre, duracion, precio })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Función para eliminar un sub-tratamiento
export async function eliminarSubTratamientoDB(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sub_tratamientos')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error al eliminar sub-tratamiento:', error)
    throw error
  }
}

// Actualizar la función getCitasPorFecha
export async function getCitasPorFecha(fecha: Date, obtenerMesCompleto: boolean = false): Promise<{ [key: string]: Cita[] }> {
  try {
    const fechaArgentina = toZonedTime(fecha, "America/Argentina/Buenos_Aires")
    let fechaInicio: Date
    let fechaFin: Date
    
    if (obtenerMesCompleto) {
      fechaInicio = startOfMonth(fechaArgentina)
      fechaFin = endOfMonth(fechaArgentina)
    } else {
      fechaInicio = fechaArgentina
      fechaFin = fechaArgentina
    }

    const fechaInicioStr = format(fechaInicio, "yyyy-MM-dd")
    const fechaFinStr = format(fechaFin, "yyyy-MM-dd")
    
    console.log('Consultando citas en rango:', {
      fechaInicio: fechaInicioStr,
      fechaFin: fechaFinStr,
      obtenerMesCompleto
    })

    const { data: citasRaw, error } = await supabase
      .from('citas')
      .select(`
        id,
        nombre_completo,
        dni,
        whatsapp,
        fecha,
        hora_inicio,
        box_id,
        tratamiento_id,
        sub_tratamiento_id,
        observaciones,
        created_at,
        updated_at,
        estado,
        duracion,
        precio,
        senia,
        tratamientos (
          id,
          nombre_tratamiento
        ),
        sub_tratamientos (
          id,
          nombre_subtratamiento,
          duracion,
          precio
        )
      `)
      .gte('fecha', fechaInicioStr)
      .lte('fecha', fechaFinStr)
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (error) {
      console.error('Error en consulta a Supabase:', error)
      throw new Error(`Error al obtener citas: ${error.message}`)
    }

    if (!citasRaw) {
      return {}
    }

    console.log(`Se encontraron ${citasRaw.length} citas en el rango`)

    const citasTransformadas: Cita[] = citasRaw.map((cita: any) => {
      const fechaCitaStr = `${cita.fecha}T00:00:00-03:00`
      const fechaCita = new Date(fechaCitaStr)
      
      if (isNaN(fechaCita.getTime())) {
        throw new Error(`Fecha inválida: ${cita.fecha}`)
      }
      
      const boxNombre = `Box ${cita.box_id}`
      const tratamiento = Array.isArray(cita.tratamientos) ? cita.tratamientos[0] : cita.tratamientos
      const subTratamiento = Array.isArray(cita.sub_tratamientos) ? cita.sub_tratamientos[0] : cita.sub_tratamientos
      
      // Calcular hora_fin basado en la duración del sub-tratamiento
      const horaInicio = parseISO(`${format(fechaCita, 'yyyy-MM-dd')}T${cita.hora_inicio}`)
      const horaFin = addMinutes(horaInicio, subTratamiento?.duracion || 30)
      
      // Generar un color basado en el tratamiento
      const color = tratamiento?.nombre_tratamiento ? 
        `hsl(${tratamiento.nombre_tratamiento.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 360}, 70%, 50%)` : 
        "#808080"
      
      return {
        id: cita.id,
        fecha: fechaCita,
        horaInicio: cita.hora_inicio,
        horaFin: format(horaFin, 'HH:mm'),
        box: boxNombre,
        box_id: cita.box_id,
        nombreCompleto: cita.nombre_completo || "Sin nombre",
        dni: cita.dni || null,
        whatsapp: cita.whatsapp || null,
        tratamiento: cita.tratamiento_id,
        subTratamiento: cita.sub_tratamiento_id || undefined,
        nombreTratamiento: tratamiento?.nombre_tratamiento,
        nombreSubTratamiento: subTratamiento?.nombre_subtratamiento,
        color,
        duracion: subTratamiento?.duracion || null,
        precio: subTratamiento?.precio || null,
        senia: cita.senia || 0,
        notas: cita.observaciones || undefined,
        estado: (cita.estado as "reservado" | "seniado" | "confirmado" | "cancelado") || "reservado",
        observaciones: cita.observaciones,
        created_at: cita.created_at ? format(new Date(cita.created_at), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined,
        updated_at: cita.updated_at ? format(new Date(cita.updated_at), "yyyy-MM-dd'T'HH:mm:ssXXX") : undefined
      }
    })

    const citasAgrupadas = citasTransformadas.reduce<{ [key: string]: Cita[] }>((acc, cita) => {
      const fechaStr = format(cita.fecha, "yyyy-MM-dd")
      if (!acc[fechaStr]) {
        acc[fechaStr] = []
      }
      acc[fechaStr].push(cita)
      return acc
    }, {})

    return citasAgrupadas
  } catch (error) {
    console.error('Error al obtener citas por fecha:', error)
    throw error
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
export function suscribirACitas(fecha: Date, callback: (citas: { [key: string]: Cita[] }) => void) {
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

// Función para obtener las fechas disponibles de un tratamiento
export async function getFechasDisponibles(tratamientoId: string): Promise<FechaDisponibleDB[]> {
  try {
    const { data, error } = await supabase
      .from('fechas_disponibles')
      .select('*')
      .eq('tratamiento_id', tratamientoId)
      .order('fecha_inicio', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error al obtener fechas disponibles:', error)
    throw error
  }
}

// Función para crear una fecha disponible
export async function crearFechaDisponible(params: {
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  boxes_disponibles: number[]
  cantidad_clientes: number
}): Promise<void> {
  try {
    // Log detallado de los parámetros recibidos
    console.log('Parámetros recibidos en crearFechaDisponible:', {
      ...params,
      boxes_disponibles_type: typeof params.boxes_disponibles,
      boxes_disponibles_isArray: Array.isArray(params.boxes_disponibles),
      boxes_disponibles_length: params.boxes_disponibles?.length,
      boxes_disponibles_content: params.boxes_disponibles,
      boxes_disponibles_stringified: JSON.stringify(params.boxes_disponibles)
    })

    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    const fechaInicio = new Date(params.fecha_inicio)
    const fechaFin = new Date(params.fecha_fin)
    if (fechaInicio > fechaFin) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin')
    }

    // Validar que la hora de inicio sea anterior a la hora de fin
    if (params.cantidad_clientes > 1) {
      // Para turnos compartidos, la hora de fin debe ser igual a la hora de inicio
      if (params.hora_inicio !== params.hora_fin) {
        throw new Error('Para turnos compartidos, la hora de fin debe ser igual a la hora de inicio')
      }
    } else {
      // Para turnos individuales, validar que la hora de inicio sea anterior a la hora de fin
      const [horaInicioHora, horaInicioMinuto] = params.hora_inicio.split(':').map(Number)
      const [horaFinHora, horaFinMinuto] = params.hora_fin.split(':').map(Number)
      const horaInicioMinutos = horaInicioHora * 60 + horaInicioMinuto
      const horaFinMinutos = horaFinHora * 60 + horaFinMinuto
      if (horaInicioMinutos >= horaFinMinutos) {
        throw new Error('La hora de inicio debe ser anterior a la hora de fin')
      }
    }

    // Validar que la cantidad de clientes sea positiva
    if (params.cantidad_clientes <= 0) {
      throw new Error('La cantidad de clientes debe ser mayor a 0')
    }

    // Validar que boxes_disponibles sea un array válido
    if (!Array.isArray(params.boxes_disponibles)) {
      console.error('boxes_disponibles no es un array:', params.boxes_disponibles)
      throw new Error('boxes_disponibles debe ser un array')
    }

    if (params.boxes_disponibles.length === 0) {
      console.error('boxes_disponibles está vacío')
      throw new Error('Debe seleccionar al menos un box disponible')
    }

    // Validar que no haya valores null en boxes_disponibles
    if (params.boxes_disponibles.some(box => box === null || box === undefined)) {
      console.error('boxes_disponibles contiene valores nulos:', params.boxes_disponibles)
      throw new Error('Los boxes disponibles no pueden contener valores nulos')
    }

    // Validar que todos los boxes sean números positivos
    if (params.boxes_disponibles.some(box => typeof box !== 'number' || box <= 0)) {
      console.error('boxes_disponibles contiene valores inválidos:', params.boxes_disponibles)
      throw new Error('Los boxes disponibles deben ser números positivos')
    }

    // Log de los datos que se intentan insertar
    console.log('Intentando crear fecha disponible con datos:', {
      tratamiento_id: params.tratamiento_id,
      fecha_inicio: params.fecha_inicio,
      fecha_fin: params.fecha_fin,
      hora_inicio: params.hora_inicio,
      hora_fin: params.hora_fin,
      boxes_disponibles: params.boxes_disponibles,
      cantidad_clientes: params.cantidad_clientes
    })

    // Verificar si ya existe un turno con los mismos datos
    const { data: turnosExistentes, error: errorVerificacion } = await supabase
      .from('fechas_disponibles')
      .select('*')
      .eq('tratamiento_id', params.tratamiento_id)
      .eq('fecha_inicio', params.fecha_inicio)
      .eq('fecha_fin', params.fecha_fin)
      .eq('hora_inicio', params.hora_inicio)
      .eq('hora_fin', params.hora_fin)
      .eq('cantidad_clientes', params.cantidad_clientes)

    if (errorVerificacion) {
      console.error('Error al verificar turnos existentes:', errorVerificacion)
    } else if (turnosExistentes && turnosExistentes.length > 0) {
      console.log('Turnos existentes encontrados:', turnosExistentes)
      
      // Verificar si alguno de los turnos existentes tiene los mismos boxes
      const turnoDuplicado = turnosExistentes.find(turno => {
        if (!Array.isArray(turno.boxes_disponibles)) {
          console.error('boxes_disponibles del turno existente no es un array:', turno.boxes_disponibles)
          return false
        }
        
        const boxesIguales = turno.boxes_disponibles.length === params.boxes_disponibles.length &&
          turno.boxes_disponibles.every((box: number) => params.boxes_disponibles.includes(box))
        
        if (boxesIguales) {
          console.log('Se encontró un turno duplicado:', {
            turno_existente: turno,
            boxes_existentes: turno.boxes_disponibles,
            boxes_nuevos: params.boxes_disponibles
          })
        }
        
        return boxesIguales
      })

      if (turnoDuplicado) {
        throw new Error('Ya existe un turno con exactamente los mismos datos (fecha, hora y boxes)')
      }
    }

    // Intentar la inserción
    const { error } = await supabase
      .from('fechas_disponibles')
      .insert([{
        tratamiento_id: params.tratamiento_id,
        fecha_inicio: params.fecha_inicio,
        fecha_fin: params.fecha_fin,
        hora_inicio: params.hora_inicio,
        hora_fin: params.hora_fin,
        boxes_disponibles: params.boxes_disponibles,
        cantidad_clientes: params.cantidad_clientes
      }])

    if (error) {
      // Log detallado del error y los parámetros
      console.error('Error al crear fecha disponible:', {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        },
        params: {
          tratamiento_id: params.tratamiento_id,
          fecha_inicio: params.fecha_inicio,
          fecha_fin: params.fecha_fin,
          hora_inicio: params.hora_inicio,
          hora_fin: params.hora_fin,
          boxes_disponibles: params.boxes_disponibles,
          cantidad_clientes: params.cantidad_clientes
        }
      })

      // Manejar diferentes tipos de errores con mensajes específicos
      if (error.code === '23505') {
        if (error.message?.includes('fechas_disponibles_tratamiento_fecha_key')) {
          throw new Error('Ya existe un turno para este tratamiento en esta fecha')
        } else {
          throw new Error('Ya existe un turno con exactamente los mismos datos (fecha, hora y boxes)')
        }
      } else if (error.code === '23503') {
        throw new Error('El tratamiento especificado no existe')
      } else if (error.code === '23514') {
        throw new Error('No se cumplen las restricciones de validación (fecha fin debe ser mayor o igual a fecha inicio)')
      } else if (error.code === 'P0001') {
        // Error de función/trigger
        const mensajeError = error.message || 'Error en la validación de la base de datos'
        throw new Error(mensajeError)
      } else {
        // Error genérico con mensaje específico
        const mensajeError = error.message || 'Error desconocido al crear fecha disponible'
        throw new Error(`Error al crear fecha disponible: ${mensajeError}`)
      }
    }

    console.log('Fecha disponible creada exitosamente')
  } catch (error) {
    // Log detallado del error capturado
    console.error('Error al crear fecha disponible:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : 'Error desconocido',
      params: {
        tratamiento_id: params.tratamiento_id,
        fecha_inicio: params.fecha_inicio,
        fecha_fin: params.fecha_fin,
        hora_inicio: params.hora_inicio,
        hora_fin: params.hora_fin,
        boxes_disponibles: params.boxes_disponibles,
        cantidad_clientes: params.cantidad_clientes
      }
    })
    
    // Propagar el error con un mensaje más descriptivo
    if (error instanceof Error) {
      throw new Error(`Error al crear fecha disponible: ${error.message}`)
    }
    throw new Error('Error desconocido al crear fecha disponible')
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
export async function eliminarFechaDisponible(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('fechas_disponibles')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error al eliminar fecha disponible:', error)
    throw error
  }
}

export async function actualizarSubTratamientoDB(params: {
  id: string
  tratamiento_id: string
  nombre: string
  duracion: number
  precio: number
}): Promise<SubTratamiento> {
  try {
    const { data, error } = await supabase
      .from('sub_tratamientos')
      .update({
        nombre: params.nombre,
        duracion: params.duracion,
        precio: params.precio
      })
      .eq('id', params.id)
      .eq('tratamiento_id', params.tratamiento_id)
      .select()
      .single()

    if (error) {
      console.error('Error detallado al actualizar sub-tratamiento:', error)
      throw new Error(error.message || 'Error al actualizar el sub-tratamiento')
    }

    if (!data) {
      throw new Error('No se recibió respuesta al actualizar el sub-tratamiento')
    }

    return data
  } catch (error) {
    console.error('Error al actualizar sub-tratamiento:', error)
    throw error instanceof Error ? error : new Error('Error desconocido al actualizar el sub-tratamiento')
  }
}

export async function actualizarFechaDisponibleDB(params: {
  id: string
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  boxes_disponibles: number[]
  cantidad_clientes: number
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('fechas_disponibles')
      .update({
        fecha_inicio: params.fecha_inicio,
        fecha_fin: params.fecha_fin,
        hora_inicio: params.hora_inicio,
        hora_fin: params.hora_fin,
        boxes_disponibles: params.boxes_disponibles,
        cantidad_clientes: params.cantidad_clientes
      })
      .eq('id', params.id)
      .eq('tratamiento_id', params.tratamiento_id)

    if (error) throw error
  } catch (error) {
    console.error('Error al actualizar fecha disponible:', error)
    throw error
  }
} 