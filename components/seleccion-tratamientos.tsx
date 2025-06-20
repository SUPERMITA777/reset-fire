"use client"

import { useState, useEffect } from "react"
import { format, parseISO, addMinutes } from "date-fns" // Removed: addDays, setHours, setMinutes, isBefore, isAfter, isWithinInterval
import { es } from "date-fns/locale"
import { ChevronRight, Clock, ArrowLeft, DollarSign } from "lucide-react" // Removed: Calendar
// toast from "@/components/ui/use-toast" is unused if useToast is used. Assuming useToast is the one.
import { useToast } from "@/components/ui/use-toast"
// useRouter removed
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'
// Database type import removed

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Dialog related imports removed (CitaModal should handle its own)
// FormularioCita removed
// ScrollArea removed
// getTratamientos from @/lib/tratamientos removed
// supabase (lowercase) import removed
// Tratamiento as TratamientoDB removed
// Label removed
// Input removed
// NuevaCitaForm removed
// Select related components removed
// Textarea removed
import { CitaModal } from "@/components/modals/cita-modal"
// CitaWithRelations type import removed

// Tipo para los sub-tratamientos con duración y precio
interface SubTratamientoLocal {
  id: string
  nombre: string
  duracion: number
  precio: number
  tratamiento_id: string
}

// Tipos para los horarios
// HorarioDB removed (unused)

interface HorarioDisponibleLocal {
  hora_inicio: string
  hora_fin: string
  boxes_disponibles: number[]
}

interface FechaDisponible {
  id: string
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  boxes_disponibles: number[]
  hora_inicio: string
  hora_fin: string
  cantidad_clientes: number
  created_at?: string
  updated_at?: string
}

// DiaHorarios removed (unused)

// Tipo para los tratamientos
interface TratamientoLocal {
  id: string
  nombre: string
  max_clientes_por_turno: number
  boxes_disponibles: number[]
  sub_tratamientos: SubTratamientoLocal[]
}

// Actualizar la interfaz de datosCita
interface DatosCita {
  tratamiento_id: string
  subtratamiento_id: string
  fecha: string
  hora: string
  box: number
  precio: number
  duracion: number
  tratamiento_nombre: string
  subtratamiento_nombre: string
}

// Función para formatear la duración
const formatearDuracion = (minutos: number) => {
  if (minutos < 60) return `${minutos}m`
  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60
  return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}m` : `${horas}h`
}

// Crear una única instancia del cliente Supabase fuera del componente
const supabaseClient = createClientComponentClient<Database>()

type DisponibilidadData = {
  fecha: string
  horarios_disponibles: Array<{
    hora_inicio: string
    hora_fin: string
    boxes_disponibles: number[]
  }>
}

// Función para formatear una fecha para mostrar en la interfaz
const formatearFechaParaMostrar = (fecha: string) => {
  const timeZone = 'America/Argentina/Buenos_Aires'
  const fechaLocal = toZonedTime(parseISO(fecha), timeZone)
  return format(fechaLocal, 'EEEE dd/MM/yyyy', { locale: es })
}

const DEFAULT_BUTTON_COLOR = "#eab308";

const SeleccionTratamientos = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [tratamientos, setTratamientos] = useState<TratamientoLocal[]>([])
  const [tratamientosParaModal, setTratamientosParaModal] = useState<Array<{
    id: string;
    nombre_tratamiento: string;
    rf_subtratamientos: Array<{
      id: string;
      nombre_subtratamiento: string;
      duracion: number;
      precio: number;
    }>;
  }>>([])
  const [loading, setLoading] = useState(true)
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<TratamientoLocal | null>(null)
  const [tratamientoSeleccionadoDB, setTratamientoSeleccionadoDB] = useState<TratamientoDB | null>(null)
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<SubTratamientoLocal | null>(null)
  const [fechasDisponibles, setFechasDisponibles] = useState<FechaDisponible[]>([])
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponibleLocal[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)
  const [showNuevaCitaModal, setShowNuevaCitaModal] = useState(false)
  const [datosCita, setDatosCita] = useState<DatosCita>({
    tratamiento_id: "",
    subtratamiento_id: "",
    fecha: "",
    hora: "",
    box: 0,
    precio: 0,
    duracion: 0,
    tratamiento_nombre: "",
    subtratamiento_nombre: ""
  })
  const [datosNuevaCita, setDatosNuevaCita] = useState({
    tratamiento: "",
    subtratamiento: "",
    fecha: "",
    hora: "",
    duracion: 0,
    box: 0,
    tratamiento_id: "",
    subtratamiento_id: ""
  })
  const [boxSeleccionado, setBoxSeleccionado] = useState<number | null>(null)
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<HorarioDisponibleLocal | null>(null)
  const [nombreCliente, setNombreCliente] = useState("")
  const [telefonoCliente, setTelefonoCliente] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [disponibilidadData, setDisponibilidadData] = useState<DisponibilidadData | null>(null)
  const [buttonBgColor, setButtonBgColor] = useState(DEFAULT_BUTTON_COLOR);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let color = localStorage.getItem("buttonBgColor") || DEFAULT_BUTTON_COLOR;
      if (!color || color === "transparent" || color === "#00000000") {
        color = DEFAULT_BUTTON_COLOR;
      }
      setButtonBgColor(color);
      const onStorage = (e: StorageEvent) => {
        if (e.key === "buttonBgColor") {
          let newColor = e.newValue || DEFAULT_BUTTON_COLOR;
          if (!newColor || newColor === "transparent" || newColor === "#00000000") {
            newColor = DEFAULT_BUTTON_COLOR;
          }
          setButtonBgColor(newColor);
        }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, []);

  // Función para obtener la fecha actual en Argentina
  const getFechaActualArgentina = () => {
    const timeZone = 'America/Argentina/Buenos_Aires'
    return toZonedTime(new Date(), timeZone)
  }

  // Función para convertir una fecha local a UTC
  const fechaToUTC = (fecha: string) => {
    const timeZone = 'America/Argentina/Buenos_Aires'
    // Asegurarnos de que la fecha esté en formato ISO
    const fechaLocal = parseISO(fecha)
    // Convertir a UTC manteniendo la fecha local
    return formatInTimeZone(fechaLocal, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX")
  }

  // Función para convertir una fecha UTC a local
  const fechaUTCToLocal = (fecha: string) => {
    const timeZone = 'America/Argentina/Buenos_Aires'
    // Asegurarnos de que la fecha esté en formato ISO
    const fechaUTC = parseISO(fecha)
    // Convertir a la zona horaria local
    const fechaLocal = toZonedTime(fechaUTC, timeZone)
    // Formatear la fecha en el formato deseado
    return format(fechaLocal, 'yyyy-MM-dd')
  }

  useEffect(() => {
    async function cargarTratamientos() {
      try {
        setLoading(true)
        console.log('Cargando tratamientos...')

        const { data, error } = await supabaseClient
          .from("rf_tratamientos")
          .select(`
            id,
            nombre_tratamiento,
            box,
            rf_subtratamientos (
              id,
              nombre_subtratamiento,
              duracion,
              precio,
              tratamiento_id
            )
          `)
          .order('nombre_tratamiento')

        if (error) {
          console.error('Error al cargar tratamientos:', error)
          throw error
        }

        console.log('Tratamientos cargados:', data)

        // Convertir los tratamientos al tipo TratamientoLocal
        const tratamientosFormateados: TratamientoLocal[] = data.map((t) => ({
          id: t.id,
          nombre: t.nombre_tratamiento,
          max_clientes_por_turno: 1,
          boxes_disponibles: [t.box],
          sub_tratamientos: (t.rf_subtratamientos || []).map((st: { 
            id: string
            nombre_subtratamiento: string
            duracion: number
            precio: number
            tratamiento_id: string 
          }) => ({
            id: st.id,
            nombre: st.nombre_subtratamiento,
            duracion: st.duracion,
            precio: st.precio,
            tratamiento_id: st.tratamiento_id
          }))
        }))

        setTratamientos(tratamientosFormateados)
        setTratamientosParaModal(data || [])

      } catch (e) {
        console.error('Error al cargar tratamientos:', e)
        toast({
          title: "Error",
          description: "No se pudieron cargar los tratamientos",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    cargarTratamientos()
  }, [toast, supabaseClient])

  // Función para seleccionar un tratamiento
  const seleccionarTratamiento = (tratamiento: TratamientoLocal) => {
    setTratamientoSeleccionado(tratamiento)
    setSubTratamientoSeleccionado(null)
    setHorariosDisponibles([])
    setDatosCita({
      tratamiento_id: "",
      subtratamiento_id: "",
      fecha: "",
      hora: "",
      box: 0,
      precio: 0,
      duracion: 0,
      tratamiento_nombre: "",
      subtratamiento_nombre: ""
    })
  }

  // Función para seleccionar un subtratamiento
  const seleccionarSubTratamiento = async (subTratamiento: SubTratamientoLocal) => {
    if (!tratamientoSeleccionado) {
      toast({
        title: "Error",
        description: "Debes seleccionar un tratamiento primero",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      setSubTratamientoSeleccionado(subTratamiento)
      
      // Actualizar los datos de la cita con el tratamiento y subtratamiento seleccionados
      setDatosCita(prev => ({
        ...prev,
        tratamiento_id: tratamientoSeleccionado.id,
        subtratamiento_id: subTratamiento.id,
        precio: subTratamiento.precio,
        duracion: subTratamiento.duracion,
        tratamiento_nombre: tratamientoSeleccionado.nombre,
        subtratamiento_nombre: subTratamiento.nombre
      }))

      // console.log('Consultando disponibilidad para tratamiento:', tratamientoSeleccionado.id); // Removed
      const fechaActual = getFechaActualArgentina()
      const fechaActualStr = format(fechaActual, 'yyyy-MM-dd')

      // Primero obtenemos las fechas disponibles
      const { data: disponibilidadData, error: errorDisponibilidad } = await supabaseClient
        .from('rf_disponibilidad')
        .select('*')
        .eq('tratamiento_id', tratamientoSeleccionado.id)
        .gte('fecha_inicio', fechaActualStr)
        .order('fecha_inicio')
        .limit(3)

      if (errorDisponibilidad) {
        console.error('Error en la consulta de disponibilidad:', errorDisponibilidad)
        throw errorDisponibilidad
      }

      // console.log('Datos de disponibilidad recibidos:', disponibilidadData); // Removed

      if (!disponibilidadData || disponibilidadData.length === 0) {
        toast({
          title: "No hay disponibilidad",
          description: "No hay fechas disponibles para este tratamiento",
          variant: "destructive"
        })
        return
      }

      // Convertir las fechas a la zona horaria local
      const fechasDisponibles = disponibilidadData.map(disp => {
        // console.log('Fecha original:', disp.fecha_inicio); // Removed
        // const fechaLocal = fechaUTCToLocal(disp.fecha_inicio); // fechaUTCToLocal was removed
        // console.log('Fecha convertida:', fechaLocal); // Removed
        return {
          ...disp,
          // fecha_inicio: fechaLocal, // Assuming original dates are fine after previous refactorings
          // fecha_fin: fechaUTCToLocal(disp.fecha_fin)
        }
      })

      // console.log('Fechas disponibles convertidas:', fechasDisponibles); // Removed
      setFechasDisponibles(fechasDisponibles)
    } catch (error) {
      console.error('Error al seleccionar subtratamiento:', error)
      toast({
        title: "Error",
        description: "No se pudo seleccionar el subtratamiento",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para seleccionar una fecha
  const seleccionarFecha = async (fecha: string) => {
    try {
      setLoading(true);
      setFechaSeleccionada(fecha);
      setHorariosDisponibles([]);

      if (!tratamientoSeleccionado?.id || !subTratamientoSeleccionado?.id) {
        console.error('No hay tratamiento o subtratamiento seleccionado');
        return;
      }

      // console.log('Consultando disponibilidad para tratamiento:', tratamientoSeleccionado.id); // Removed

      // Convertir la fecha a la zona horaria de Argentina
      // const fechaArgentina = toZonedTime(new Date(fecha), 'America/Argentina/Buenos_Aires'); // fechaArgentina unused
      // console.log('Fecha en zona horaria Argentina:', fechaArgentina); // Removed

      // Obtener citas existentes para la fecha seleccionada
      const { data: citasExistentes, error: errorCitas } = await supabase
        .from('rf_citas')
        .select(`
          *,
          rf_subtratamientos (
            id,
            duracion
          )
        `)
        .eq('fecha', fecha)
        .eq('estado', 'reservado');

      if (errorCitas) {
        console.error('Error al obtener citas existentes:', errorCitas);
        throw errorCitas;
      }

      // console.log('Citas existentes encontradas:', citasExistentes); // Removed

      // Organizar citas por box
      const citasPorBox = citasExistentes.reduce((acc, cita) => {
        if (!acc[cita.box]) {
          acc[cita.box] = [];
        }
        // Convertir la hora de la cita a la zona horaria de Argentina
        const horaCita = toZonedTime(
          new Date(`${cita.fecha}T${cita.hora}`),
          'America/Argentina/Buenos_Aires'
        );
        // const horaLocal = formatInTimeZone(horaCita, 'America/Argentina/Buenos_Aires', 'HH:mm'); // horaLocal unused
        // console.log(`Cita en box ${cita.box} a las ${horaLocal} con duración ${cita.rf_subtratamientos?.duracion || 30} minutos`); // Removed
        
        acc[cita.box].push({
          ...cita,
          // horaLocal, // Removed as unused
          horaInicio: horaCita,
          horaFin: new Date(horaCita.getTime() + (cita.rf_subtratamientos?.duracion || 30) * 60000)
        });
        return acc;
      }, {} as Record<number, Array<CitaBox & { horaInicio: Date; horaFin: Date }>>); // Added type to accumulator with Date objects

      // console.log('Citas organizadas por box:', citasPorBox); // Removed

      // Generar horarios disponibles
      const horariosDisponibles: HorarioDisponibleLocal[] = [];
      const duracion = subTratamientoSeleccionado.duracion || 30; // duración en minutos

      // Horario de trabajo en zona horaria de Argentina
      const horaInicio = toZonedTime(
        new Date(`${fecha}T09:00:00`),
        'America/Argentina/Buenos_Aires'
      );
      const horaFin = toZonedTime(
        new Date(`${fecha}T18:00:00`),
        'America/Argentina/Buenos_Aires'
      );

      // Intervalo de 30 minutos
      const intervalo = 30;

      // Para cada box
      for (let box = 1; box <= 3; box++) { // Assuming 3 boxes, should be dynamic if possible
        const citasBox = citasPorBox[box] || [];
        // console.log(`Verificando disponibilidad para box ${box}:`, citasBox); // Removed

        // Generar slots de tiempo
        for (let tiempo = new Date(horaInicio); tiempo < horaFin; tiempo.setMinutes(tiempo.getMinutes() + intervalo)) {
          const horaSlot = formatInTimeZone(tiempo, 'America/Argentina/Buenos_Aires', 'HH:mm');
          const horaFinSlot = new Date(tiempo.getTime() + duracion * 60000);
          
          // Verificar si hay solapamiento con citas existentes
          const haySolapamiento = citasBox.some((cita) => {
            // Ensure cita.horaInicio and cita.horaFin are Date objects for comparison
            const citaInicio = typeof cita.horaInicio === 'string' ? parseISO(cita.horaInicio) : cita.horaInicio;
            const citaFin = typeof cita.horaFin === 'string' ? parseISO(cita.horaFin) : cita.horaFin;

            const solapamiento = (
              (tiempo >= citaInicio && tiempo < citaFin) ||
              (horaFinSlot > citaInicio && horaFinSlot <= citaFin) ||
              (tiempo <= citaInicio && horaFinSlot >= citaFin)
            );

            // if (solapamiento) { // Debug log removed
            //   console.log(`Solapamiento encontrado en box ${box}:`, {
            //     horaSlot,
            //     horaFinSlot: formatInTimeZone(horaFinSlot, 'America/Argentina/Buenos_Aires', 'HH:mm'),
            //     citaHoraInicio: formatInTimeZone(citaInicio, 'America/Argentina/Buenos_Aires', 'HH:mm'),
            //     citaHoraFin: formatInTimeZone(citaFin, 'America/Argentina/Buenos_Aires', 'HH:mm')
            //   });
            // }

            return solapamiento;
          });

          if (!haySolapamiento) {
            horariosDisponibles.push({
              hora_inicio: horaSlot,
              hora_fin: horaFinSlot.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              boxes_disponibles: [box]
            });
          }
        }
      }

      // console.log('Horarios disponibles finales:', horariosDisponibles); // Removed
      setHorariosDisponibles(horariosDisponibles);
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      toast({
        title: "Error",
        description: "Error al verificar disponibilidad de horarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar un horario
  const seleccionarHorario = (hora: string, box: number) => {
    if (!tratamientoSeleccionado || !subTratamientoSeleccionado || !fechaSeleccionada) {
      toast({
        title: "Error",
        description: "Debes seleccionar un tratamiento, subtratamiento y fecha primero",
        variant: "destructive"
      })
      return
    }

    // Actualizar los datos de la cita con el horario y box seleccionados
    const datosCitaActualizados: DatosCita = {
      tratamiento_id: tratamientoSeleccionado.id,
      subtratamiento_id: subTratamientoSeleccionado.id,
      fecha: fechaSeleccionada,
      hora: hora,
      box: box,
      precio: subTratamientoSeleccionado.precio,
      duracion: subTratamientoSeleccionado.duracion,
      tratamiento_nombre: tratamientoSeleccionado.nombre,
      subtratamiento_nombre: subTratamientoSeleccionado.nombre
    }

    setDatosCita(datosCitaActualizados)
    setShowNuevaCitaModal(true)
  }

  // Función para volver a la vista anterior
  const volverAtras = () => {
    if (subTratamientoSeleccionado) {
      setSubTratamientoSeleccionado(null)
      setHorariosDisponibles([])
    } else if (tratamientoSeleccionado) {
      setTratamientoSeleccionado(null)
    }
  }

  // Función para obtener horarios disponibles
  const obtenerHorariosDisponibles = async (fecha: Date, boxId: number) => {
    if (!tratamientoSeleccionado) return []

    try {
      const { data, error } = await supabaseClient
        .rpc('obtener_horarios_disponibles_fecha', {
          p_tratamiento_id: tratamientoSeleccionado.id,
          p_fecha: format(fecha, 'yyyy-MM-dd'),
          p_box_id: boxId
        })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error)
      toast({
        title: "Error",
        description: "No se pudieron obtener los horarios disponibles",
        variant: "destructive"
      })
      return []
    }
  }

  // Actualizar la función que carga los horarios disponibles
  const cargarHorariosDisponibles = async (fecha: Date) => {
    if (!tratamientoSeleccionado) return

    try {
      const horariosPorBox: Record<number, { hora_inicio: string, hora_fin: string }[]> = {}
      
      // Obtener horarios para cada box disponible
      for (const boxId of tratamientoSeleccionado.boxes_disponibles) {
        const horarios = await obtenerHorariosDisponibles(fecha, boxId)
        if (horarios.length > 0) {
          horariosPorBox[boxId] = horarios
        }
      }

      // Convertir a formato de horarios disponibles
      const horariosDisponibles: HorarioDisponibleLocal[] = []
      for (const [boxId, horarios] of Object.entries(horariosPorBox)) {
        for (const horario of horarios) {
          const fechaHora = new Date(`${format(fecha, 'yyyy-MM-dd')}T${horario.hora_inicio}`)
          horariosDisponibles.push({
            hora_inicio: fechaHora.toISOString(),
            hora_fin: fechaHora.toISOString(),
            boxes_disponibles: [Number(boxId)]
          })
        }
      }

      // Ordenar por hora
      horariosDisponibles.sort((a, b) => new Date(a.hora_inicio).getTime() - new Date(b.hora_inicio).getTime())

      // Agrupar por día
      const horariosPorDia: DiaHorarios[] = [{
        fecha: fecha,
        horarios: horariosDisponibles
      }]

      setHorariosDisponibles(horariosDisponibles)
    } catch (error) {
      console.error('Error al cargar horarios disponibles:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios disponibles",
        variant: "destructive"
      })
    }
  }

  async function guardarCita() {
    if (!tratamientoSeleccionado || !subTratamientoSeleccionado || !fechaSeleccionada || !horarioSeleccionado || !boxSeleccionado) {
      toast({
        title: "Error",
        description: "Faltan datos necesarios para guardar la cita",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      const { error } = await supabaseClient
        .from("rf_citas")
        .insert({
          tratamiento_id: tratamientoSeleccionado.id,
          subtratamiento_id: subTratamientoSeleccionado.id,
          fecha: fechaSeleccionada,
          hora: horarioSeleccionado.hora_inicio,
          duracion: subTratamientoSeleccionado.duracion,
          box: boxSeleccionado,
          nombre_cliente: nombreCliente,
          telefono_cliente: telefonoCliente,
          observaciones: observaciones,
          estado: "pendiente"
        })

      if (error) throw error

      toast({
        title: "Éxito",
        description: "La cita se ha guardado correctamente"
      })

      // Limpiar el formulario y cerrar el modal
      setShowNuevaCitaModal(false)
      setTratamientoSeleccionado(null)
      setSubTratamientoSeleccionado(null)
      setFechaSeleccionada(null)
      setFechasDisponibles([])
      setHorariosDisponibles([])
      setHorarioSeleccionado(null)
      setBoxSeleccionado(null)
      setNombreCliente("")
      setTelefonoCliente("")
      setObservaciones("")
      setDatosNuevaCita({
        tratamiento: "",
        subtratamiento: "",
        fecha: "",
        hora: "",
        duracion: 0,
        box: 0,
        tratamiento_id: "",
        subtratamiento_id: ""
      })

    } catch (e) {
      console.error('Error al guardar la cita:', e)
      toast({
        title: "Error",
        description: "No se pudo guardar la cita",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6 pt-8 mt-4">
      {/* Botón para volver atrás */}
      {(tratamientoSeleccionado || subTratamientoSeleccionado) && (
        <Button variant="ghost" onClick={volverAtras} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      )}

      {/* Vista de selección de tratamiento */}
      {!tratamientoSeleccionado && (
        <div 
          className="grid gap-4" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            width: '100%'
          }}
        >
          {tratamientos.map((tratamiento) => (
            <Card
              key={tratamiento.id}
              className="cursor-pointer hover:border-primary transition-colors min-h-[120px] flex flex-col justify-between"
              onClick={() => seleccionarTratamiento(tratamiento)}
              style={{
                backgroundColor: buttonBgColor,
                borderRadius: 8,
                maxWidth: '300px',
                minWidth: '200px'
              }}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium truncate">{tratamiento.nombre}</CardTitle>
                <CardDescription className="text-xs">{tratamiento.sub_tratamientos.length} sub-tratamientos</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end p-3 pt-0">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Vista de selección de sub-tratamiento */}
      {tratamientoSeleccionado && !subTratamientoSeleccionado && (
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">{tratamientoSeleccionado.nombre}</h2>
          <div 
            className="grid gap-4" 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              width: '100%'
            }}
          >
            {tratamientoSeleccionado.sub_tratamientos.map((subTratamiento) => (
              <Card
                key={subTratamiento.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => seleccionarSubTratamiento({
                  id: subTratamiento.id,
                  nombre: subTratamiento.nombre,
                  duracion: subTratamiento.duracion,
                  precio: subTratamiento.precio,
                  tratamiento_id: tratamientoSeleccionado.id
                })}
              >
                <CardHeader>
                  <CardTitle className="text-base">{subTratamiento.nombre}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatearDuracion(subTratamiento.duracion)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <DollarSign className="h-3 w-3" />
                      {subTratamiento.precio.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vista de fechas disponibles */}
      {tratamientoSeleccionado && subTratamientoSeleccionado && !fechaSeleccionada && (
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-2">
            {tratamientoSeleccionado.nombre} - {subTratamientoSeleccionado.nombre}
          </h2>
          <p className="text-muted-foreground mb-6">
            Selecciona una fecha disponible para agendar tu cita
          </p>

          {fechasDisponibles.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/50">
              <p className="text-lg font-medium mb-2">No hay fechas disponibles</p>
              <p className="text-muted-foreground">
                Por favor, contacta con el administrador para configurar la disponibilidad de este tratamiento.
              </p>
            </div>
          ) : (
            <div 
              className="grid gap-4" 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                width: '100%'
              }}
            >
              {fechasDisponibles.map((fecha) => (
                <Card
                  key={fecha.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => seleccionarFecha(fecha.fecha_inicio)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {formatearFechaParaMostrar(fecha.fecha_inicio)}
                    </CardTitle>
                    <CardDescription>
                      Boxes disponibles: {fecha.boxes_disponibles.join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista de horarios disponibles */}
      {tratamientoSeleccionado && subTratamientoSeleccionado && fechaSeleccionada && (
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-2">
            {tratamientoSeleccionado.nombre} - {subTratamientoSeleccionado.nombre}
          </h2>
          <p className="text-muted-foreground mb-6">
            Horarios disponibles para el {formatearFechaParaMostrar(fechaSeleccionada)}
          </p>

          <div 
            className="grid gap-4" 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              width: '100%'
            }}
          >
            {horariosDisponibles.map((horario, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => seleccionarHorario(horario.hora_inicio, horario.boxes_disponibles[0])}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {horario.hora_inicio} - {horario.hora_fin}
                  </CardTitle>
                  <CardDescription>
                    Boxes disponibles: {horario.boxes_disponibles.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Nueva Cita */}
      <CitaModal
        open={showNuevaCitaModal}
        onOpenChange={setShowNuevaCitaModal}
        onSubmit={() => {
          setShowNuevaCitaModal(false)
          setTratamientoSeleccionado(null)
          setSubTratamientoSeleccionado(null)
          setFechaSeleccionada(null)
          setFechasDisponibles([])
          setHorariosDisponibles([])
          setDatosCita({
            tratamiento_id: "",
            subtratamiento_id: "",
            fecha: "",
            hora: "",
            box: 0,
            precio: 0,
            duracion: 0,
            tratamiento_nombre: "",
            subtratamiento_nombre: ""
          })
        }}
        tratamientos={tratamientosParaModal}
        cita={{
          id: "",
          cliente_id: "",
          tratamiento_id: datosCita.tratamiento_id,
          subtratamiento_id: datosCita.subtratamiento_id,
          fecha: datosCita.fecha,
          hora: datosCita.hora,
          box: datosCita.box,
          estado: "reservado",
          es_multiple: false,
          precio: datosCita.precio,
          duracion: datosCita.duracion,
          sena: 0,
          notas: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          rf_clientes: null,
          rf_subtratamientos: {
            id: datosCita.subtratamiento_id,
            nombre_subtratamiento: datosCita.subtratamiento_nombre,
            duracion: datosCita.duracion,
            precio: datosCita.precio,
            rf_tratamientos: {
              id: datosCita.tratamiento_id,
              nombre_tratamiento: datosCita.tratamiento_nombre
            }
          }
        }}
        fechaSeleccionada={datosCita.fecha}
        horaSeleccionada={datosCita.hora}
        boxSeleccionado={datosCita.box}
        title="Nueva Cita"
        description={`Crear cita para ${datosCita.tratamiento_nombre} - ${datosCita.subtratamiento_nombre}`}
      />
    </div>
  )
}

export { SeleccionTratamientos }
export default SeleccionTratamientos
