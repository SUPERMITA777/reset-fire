import type { Tratamiento, SubTratamiento } from "@/types/cita"

// Función para obtener todos los tratamientos
export async function getTratamientos(): Promise<Tratamiento[]> {
  const response = await fetch('/api/tratamientos')
  if (!response.ok) {
    throw new Error('Error al cargar los tratamientos')
  }
  return response.json()
}

// Función para obtener horarios disponibles
export async function getHorariosDisponibles(
  tratamientoId: string,
  fecha: string
): Promise<Array<{
  hora_inicio: string
  hora_fin: string
  cupos_disponibles: number
  boxes_disponibles: number[]
}>> {
  const response = await fetch('/api/tratamientos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tratamientoId, fecha }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener horarios disponibles')
  }

  return response.json()
}

// Función para verificar la configuración de un tratamiento
export async function verificarConfiguracionTratamiento(tratamientoId: string) {
  try {
    const tratamientos = await getTratamientos()
    const tratamiento = tratamientos.find(t => t.id === tratamientoId)
    
    if (!tratamiento) {
      return null
    }

    // Obtener la disponibilidad directamente
    const response = await fetch(`/api/tratamientos/${tratamientoId}/disponibilidad`)
    if (!response.ok) {
      throw new Error('Error al obtener la disponibilidad')
    }

    const disponibilidad = await response.json()
    
    // Obtener horarios para verificar disponibilidad
    const hoy = new Date().toISOString().split('T')[0]
    const horarios = await getHorariosDisponibles(tratamientoId, hoy)

    console.log('Verificación de configuración:', {
      tratamientoId,
      tieneDisponibilidad: !!disponibilidad,
      tieneHorarios: horarios.length > 0,
      cantidadHorarios: horarios.length,
      disponibilidad
    })

    return {
      tiene_horarios: horarios.length > 0,
      cantidad_horarios: horarios.length,
      tiene_fechas_disponibles: !!disponibilidad?.fecha_inicio && !!disponibilidad?.fecha_fin,
      es_compartido: tratamiento.es_compartido,
      max_clientes: tratamiento.max_clientes_por_turno,
      boxes_disponibles: tratamiento.boxes_disponibles,
      fecha_inicio: disponibilidad?.fecha_inicio || null,
      fecha_fin: disponibilidad?.fecha_fin || null,
      dias_disponibles: disponibilidad?.dias_disponibles || []
    }
  } catch (error) {
    console.error('Error al verificar configuración:', error)
    throw error
  }
}

// Función para obtener la configuración completa de un tratamiento
export async function getConfiguracionCompletaTratamiento(tratamientoId: string) {
  const tratamientos = await getTratamientos()
  const tratamiento = tratamientos.find(t => t.id === tratamientoId)
  
  if (!tratamiento) {
    return null
  }

  const configuracion = await verificarConfiguracionTratamiento(tratamientoId)
  
  return {
    tratamiento,
    configuracion
  }
}

// Función para obtener las fechas disponibles de un tratamiento
export async function getFechasDisponibles(tratamientoId: string): Promise<{
  fecha_inicio: string
  fecha_fin: string
  dias_disponibles: string[]
}> {
  const response = await fetch(`/api/tratamientos/${tratamientoId}/disponibilidad`)
  if (!response.ok) {
    throw new Error('Error al cargar las fechas disponibles')
  }
  return response.json()
}

// Funciones para tratamientos
export async function crearTratamientoDB(tratamiento: any) {
  const response = await fetch('/api/tratamientos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tratamiento)
  })
  if (!response.ok) {
    throw new Error('Error al crear el tratamiento')
  }
  return response.json()
}

export async function actualizarTratamientoDB(tratamiento: any) {
  const response = await fetch(`/api/tratamientos/${tratamiento.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tratamiento)
  })
  if (!response.ok) {
    throw new Error('Error al actualizar el tratamiento')
  }
  return response.json()
}

export async function eliminarTratamientoDB(id: string) {
  const response = await fetch(`/api/tratamientos/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Error al eliminar el tratamiento')
  }
  return response.json()
}

// Funciones para subtratamientos
export async function crearSubTratamientoDB(params: {
  tratamiento_id: string
  nombre: string
  duracion: number
  precio: number
}): Promise<SubTratamiento> {
  const response = await fetch(`/api/tratamientos/${params.tratamiento_id}/subtratamientos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  if (!response.ok) {
    throw new Error('Error al crear el subtratamiento')
  }
  return response.json()
}

export async function actualizarSubTratamientoDB(params: {
  id: string
  tratamiento_id: string
  nombre: string
  duracion: number
  precio: number
}): Promise<SubTratamiento> {
  const response = await fetch(`/api/tratamientos/${params.tratamiento_id}/subtratamientos/${params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  if (!response.ok) {
    throw new Error('Error al actualizar el subtratamiento')
  }
  return response.json()
}

export async function eliminarSubTratamientoDB(id: string): Promise<void> {
  const response = await fetch(`/api/tratamientos/subtratamientos/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Error al eliminar el subtratamiento')
  }
}

// Funciones para disponibilidad
export async function crearFechaDisponible(disponibilidad: any) {
  const response = await fetch(`/api/tratamientos/${disponibilidad.tratamiento_id}/disponibilidad`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(disponibilidad)
  })
  if (!response.ok) {
    throw new Error('Error al crear la disponibilidad')
  }
  return response.json()
}

export async function actualizarFechaDisponibleDB(disponibilidad: any) {
  const response = await fetch(`/api/tratamientos/${disponibilidad.tratamiento_id}/disponibilidad`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(disponibilidad)
  })
  if (!response.ok) {
    throw new Error('Error al actualizar la disponibilidad')
  }
  return response.json()
}

export async function eliminarFechaDisponible(tratamientoId: string) {
  const response = await fetch(`/api/tratamientos/${tratamientoId}/disponibilidad`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Error al eliminar la disponibilidad')
  }
  return response.json()
} 