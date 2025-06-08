const fs = require('fs').promises;
const path = require('path');
const { format } = require('date-fns');

const DB_PATH = path.join(__dirname, '..', 'data');

// Funciones de utilidad para leer/escribir archivos JSON
async function readJsonFile(filename) {
  const filePath = path.join(DB_PATH, filename);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeJsonFile(filename, data) {
  const filePath = path.join(DB_PATH, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Funciones para tratamientos
async function getTratamientos() {
  const data = await readJsonFile('tratamientos.json');
  return data.tratamientos;
}

async function getTratamientoById(id) {
  const tratamientos = await getTratamientos();
  return tratamientos.find(t => t.id === id);
}

async function getSubTratamientoById(tratamientoId, subTratamientoId) {
  const tratamiento = await getTratamientoById(tratamientoId);
  return tratamiento?.sub_tratamientos.find(st => st.id === subTratamientoId);
}

// Funciones para disponibilidad
async function getDisponibilidad() {
  const data = await readJsonFile('disponibilidad.json');
  return data.disponibilidad;
}

async function getDisponibilidadByTratamiento(tratamientoId) {
  const disponibilidad = await getDisponibilidad();
  return disponibilidad.find(d => d.tratamiento_id === tratamientoId);
}

// Funciones para citas
async function getCitas() {
  const data = await readJsonFile('citas.json');
  return data.citas.map(cita => ({
    id: cita.id,
    fecha: new Date(cita.fecha),
    horaInicio: cita.hora_inicio,
    horaFin: cita.hora_fin || null, // Calcular basado en la duración del sub-tratamiento
    box: `Box ${cita.box_id}`,
    box_id: cita.box_id,
    nombreCompleto: cita.cliente.nombre_completo,
    dni: cita.cliente.dni,
    whatsapp: cita.cliente.whatsapp,
    tratamiento: cita.tratamiento_id,
    subTratamiento: cita.sub_tratamiento_id,
    nombreTratamiento: cita.tratamiento?.nombre,
    nombreSubTratamiento: cita.sub_tratamiento?.nombre,
    color: cita.color || "#4f46e5",
    duracion: cita.sub_tratamiento?.duracion || null,
    precio: cita.sub_tratamiento?.precio || null,
    senia: cita.senia || 0,
    notas: cita.observaciones,
    estado: cita.estado || "pendiente",
    observaciones: cita.observaciones,
    created_at: cita.created_at,
    updated_at: cita.updated_at
  }));
}

async function getCitasByFecha(fecha) {
  const citas = await getCitas();
  const fechaStr = format(fecha, 'yyyy-MM-dd');
  return citas.filter(c => format(c.fecha, 'yyyy-MM-dd') === fechaStr);
}

async function getCitasByTratamiento(tratamientoId) {
  const citas = await getCitas();
  return citas.filter(c => c.tratamiento === tratamientoId);
}

async function crearCita(cita) {
  const data = await readJsonFile('citas.json');
  const nuevaCita = {
    id: Date.now().toString(),
    tratamiento_id: cita.tratamiento,
    sub_tratamiento_id: cita.subTratamiento,
    fecha: format(cita.fecha, 'yyyy-MM-dd'),
    hora_inicio: cita.horaInicio,
    box_id: cita.box_id,
    cliente: {
      dni: cita.dni || null,
      nombre_completo: cita.nombreCompleto,
      whatsapp: cita.whatsapp || null
    },
    senia: cita.senia || 0,
    estado: cita.estado || "pendiente",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  data.citas.push(nuevaCita);
  await writeJsonFile('citas.json', data);
  return nuevaCita;
}

async function actualizarCita(id, cambios) {
  const data = await readJsonFile('citas.json');
  const index = data.citas.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  const citaActual = data.citas[index];
  const citaActualizada = {
    ...citaActual,
    tratamiento_id: cambios.tratamiento || citaActual.tratamiento_id,
    sub_tratamiento_id: cambios.subTratamiento || citaActual.sub_tratamiento_id,
    fecha: cambios.fecha ? format(cambios.fecha, 'yyyy-MM-dd') : citaActual.fecha,
    hora_inicio: cambios.horaInicio || citaActual.hora_inicio,
    box_id: cambios.box_id || citaActual.box_id,
    cliente: {
      dni: cambios.dni || citaActual.cliente.dni,
      nombre_completo: cambios.nombreCompleto || citaActual.cliente.nombre_completo,
      whatsapp: cambios.whatsapp || citaActual.cliente.whatsapp
    },
    senia: cambios.senia || citaActual.senia,
    estado: cambios.estado || citaActual.estado,
    observaciones: cambios.observaciones || citaActual.observaciones,
    updated_at: new Date().toISOString()
  };
  
  data.citas[index] = citaActualizada;
  await writeJsonFile('citas.json', data);
  
  // Transformar la cita al formato que espera la aplicación
  return {
    id: citaActualizada.id,
    fecha: new Date(citaActualizada.fecha),
    horaInicio: citaActualizada.hora_inicio,
    horaFin: citaActualizada.hora_fin || null,
    box: `Box ${citaActualizada.box_id}`,
    box_id: citaActualizada.box_id,
    nombreCompleto: citaActualizada.cliente.nombre_completo,
    dni: citaActualizada.cliente.dni,
    whatsapp: citaActualizada.cliente.whatsapp,
    tratamiento: citaActualizada.tratamiento_id,
    subTratamiento: citaActualizada.sub_tratamiento_id,
    nombreTratamiento: citaActualizada.tratamiento?.nombre,
    nombreSubTratamiento: citaActualizada.sub_tratamiento?.nombre,
    color: citaActualizada.color || "#4f46e5",
    duracion: citaActualizada.sub_tratamiento?.duracion || null,
    precio: citaActualizada.sub_tratamiento?.precio || null,
    senia: citaActualizada.senia || 0,
    notas: citaActualizada.observaciones,
    estado: citaActualizada.estado || "pendiente",
    observaciones: citaActualizada.observaciones,
    created_at: citaActualizada.created_at,
    updated_at: citaActualizada.updated_at
  };
}

// Función para obtener horarios disponibles para una fecha específica
async function getHorariosDisponibles(tratamientoId, fecha) {
  console.log('Buscando horarios para:', { tratamientoId, fecha });
  
  const disponibilidad = await getDisponibilidadByTratamiento(tratamientoId);
  console.log('Disponibilidad encontrada:', disponibilidad);
  
  const citas = await getCitasByFecha(fecha);
  console.log('Citas existentes:', citas);
  
  const tratamiento = await getTratamientoById(tratamientoId);
  console.log('Tratamiento encontrado:', tratamiento);
  
  if (!disponibilidad || !tratamiento) {
    console.log('No se encontró disponibilidad o tratamiento');
    return [];
  }
  
  // Verificar si la fecha está dentro del rango de disponibilidad
  const fechaObj = new Date(fecha);
  const inicioObj = new Date(disponibilidad.fecha_inicio);
  const finObj = new Date(disponibilidad.fecha_fin);
  
  console.log('Verificando rango de fechas:', {
    fecha: fechaObj.toISOString(),
    inicio: inicioObj.toISOString(),
    fin: finObj.toISOString()
  });
  
  if (fechaObj < inicioObj || fechaObj > finObj) {
    console.log('La fecha está fuera del rango de disponibilidad');
    return [];
  }
  
  // Obtener el día de la semana (1-7)
  const diaSemana = fechaObj.getDay() + 1;
  console.log('Día de la semana:', diaSemana);
  
  // Filtrar horarios disponibles para ese día
  const horariosDisponibles = disponibilidad.horarios
    .filter(h => {
      const disponible = h.dias_semana.includes(diaSemana);
      console.log(`Horario ${h.hora_inicio} - ${h.hora_fin}: ${disponible ? 'disponible' : 'no disponible'} para día ${diaSemana}`);
      return disponible;
    })
    .map(horario => {
      // Contar citas existentes para este horario
      const citasEnHorario = citas.filter(c => 
        c.tratamiento === tratamientoId && 
        c.hora_inicio === horario.hora_inicio
      );
      
      // Verificar disponibilidad por box
      const boxesOcupados = citasEnHorario.map(c => c.box_id);
      const boxesDisponibles = disponibilidad.boxes.filter(box => !boxesOcupados.includes(box));
      
      console.log(`Horario ${horario.hora_inicio}:`, {
        citasExistentes: citasEnHorario.length,
        boxesOcupados,
        boxesDisponibles,
        cuposDisponibles: boxesDisponibles.length
      });
      
      return {
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        boxes_disponibles: boxesDisponibles,
        cupos_disponibles: boxesDisponibles.length
      };
    })
    .filter(h => h.cupos_disponibles > 0);
  
  console.log('Horarios disponibles finales:', horariosDisponibles);
  return horariosDisponibles;
}

// Función para verificar disponibilidad de un horario específico
async function verificarDisponibilidad(tratamientoId, fecha, horaInicio, boxId) {
  const disponibilidad = await getDisponibilidadByTratamiento(tratamientoId);
  const citas = await getCitasByFecha(fecha);
  
  if (!disponibilidad) return false;
  
  // Verificar si la fecha está dentro del rango de disponibilidad
  const fechaObj = new Date(fecha);
  const inicioObj = new Date(disponibilidad.fecha_inicio);
  const finObj = new Date(disponibilidad.fecha_fin);
  
  if (fechaObj < inicioObj || fechaObj > finObj) return false;
  
  // Verificar si el box está disponible para este tratamiento
  if (!disponibilidad.boxes.includes(boxId)) return false;
  
  // Verificar si el horario está disponible
  const horario = disponibilidad.horarios.find(h => 
    h.hora_inicio === horaInicio && 
    h.dias_semana.includes(fechaObj.getDay() + 1)
  );
  
  if (!horario) return false;
  
  // Verificar si el box está ocupado en ese horario
  const boxOcupado = citas.some(c => 
    c.box_id === boxId && 
    c.hora_inicio === horaInicio
  );
  
  return !boxOcupado;
}

// Función para crear una nueva disponibilidad
async function crearDisponibilidad(disponibilidad) {
  const data = await readJsonFile('disponibilidad.json');
  const nuevaDisponibilidad = {
    ...disponibilidad,
    horarios: disponibilidad.horarios.map(h => ({
      ...h,
      dias_semana: Array.isArray(h.dias_semana) ? h.dias_semana : [1, 2, 3, 4, 5]
    }))
  };
  
  // Verificar si ya existe disponibilidad para este tratamiento
  const index = data.disponibilidad.findIndex(d => d.tratamiento_id === disponibilidad.tratamiento_id);
  
  if (index !== -1) {
    data.disponibilidad[index] = nuevaDisponibilidad;
  } else {
    data.disponibilidad.push(nuevaDisponibilidad);
  }
  
  await writeJsonFile('disponibilidad.json', data);
  return nuevaDisponibilidad;
}

// Función para verificar la configuración del tratamiento
async function verificarConfiguracionTratamiento(tratamientoId) {
  console.log('Verificando configuración para tratamiento:', tratamientoId);
  
  const tratamiento = await getTratamientoById(tratamientoId);
  console.log('Tratamiento encontrado:', tratamiento);
  
  const disponibilidad = await getDisponibilidadByTratamiento(tratamientoId);
  console.log('Disponibilidad encontrada:', disponibilidad);
  
  if (!tratamiento) {
    console.log('No se encontró el tratamiento');
    return null;
  }
  
  const configuracion = {
    tiene_horarios: false,
    cantidad_horarios: 0,
    tiene_fechas_disponibles: false,
    es_compartido: tratamiento.es_compartido || false,
    max_clientes: tratamiento.max_clientes_por_turno || 1,
    boxes_disponibles: disponibilidad?.boxes || tratamiento.boxes_disponibles || [],
    fecha_inicio: null,
    fecha_fin: null
  };
  
  if (disponibilidad) {
    // Verificar fechas disponibles
    const hoy = new Date();
    const fechaInicio = new Date(disponibilidad.fecha_inicio);
    const fechaFin = new Date(disponibilidad.fecha_fin);
    
    configuracion.tiene_fechas_disponibles = fechaInicio <= fechaFin;
    configuracion.fecha_inicio = disponibilidad.fecha_inicio;
    configuracion.fecha_fin = disponibilidad.fecha_fin;
    
    // Verificar horarios
    if (disponibilidad.horarios && Array.isArray(disponibilidad.horarios)) {
      configuracion.tiene_horarios = disponibilidad.horarios.length > 0;
      configuracion.cantidad_horarios = disponibilidad.horarios.length;
      
      // Verificar que los horarios tengan la estructura correcta
      const horariosValidos = disponibilidad.horarios.every(h => 
        h.hora_inicio && 
        h.hora_fin && 
        Array.isArray(h.dias_semana) && 
        h.dias_semana.length > 0
      );
      
      if (!horariosValidos) {
        console.log('Advertencia: Algunos horarios no tienen la estructura correcta');
      }
    }
  }
  
  console.log('Configuración final:', configuracion);
  return configuracion;
}

// Función para obtener la configuración completa del tratamiento
async function getConfiguracionCompletaTratamiento(tratamientoId) {
  const tratamiento = await getTratamientoById(tratamientoId);
  const disponibilidad = await getDisponibilidadByTratamiento(tratamientoId);
  
  if (!tratamiento) return null;
  
  return {
    tratamiento,
    disponibilidad,
    configuracion: await verificarConfiguracionTratamiento(tratamientoId)
  };
}

module.exports = {
  getTratamientos,
  getTratamientoById,
  getSubTratamientoById,
  getDisponibilidad,
  getDisponibilidadByTratamiento,
  getCitas,
  getCitasByFecha,
  getCitasByTratamiento,
  crearCita,
  actualizarCita,
  getHorariosDisponibles,
  crearDisponibilidad,
  verificarConfiguracionTratamiento,
  getConfiguracionCompletaTratamiento
}; 