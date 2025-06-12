"use client"

import { useState, useEffect } from "react"
import { format, addDays, setHours, setMinutes, isBefore, isAfter, parseISO, addMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronRight, Clock, Calendar, ArrowLeft, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'
import { Database } from '@/types/supabase'

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { FormularioCita } from "@/components/formulario-cita"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTratamientos } from "@/lib/tratamientos"
import { supabase } from "@/lib/supabase"
import { Tratamiento as TratamientoDB } from "@/types/cita"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { NuevaCitaForm } from "@/components/forms/nueva-cita-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CitaModal } from "@/components/modals/cita-modal"
import type { CitaWithRelations } from "@/types/cita"
import { SubTratamiento, HorarioDisponible } from '@/types/cita'

// Tipo para los sub-tratamientos con duración y precio
interface SubTratamiento {
  id: string
  nombre: string
  duracion: number
  precio: number
  tratamiento_id: string
}

// Tipos para los horarios
interface HorarioDB {
  hora_inicio: string
  hora_fin: string
  vacantes_disponibles: number
}

interface HorarioDisponible {
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

interface DiaHorarios {
  fecha: Date
  horarios: HorarioDisponible[]
}

// Tipo para los tratamientos
interface TratamientoLocal {
  id: string
  nombre: string
  max_clientes_por_turno: number
  boxes_disponibles: number[]
  sub_tratamientos: SubTratamiento[]
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
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<SubTratamiento | null>(null)
  const [fechasDisponibles, setFechasDisponibles] = useState<FechaDisponible[]>([])
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)
  const [showNuevaCitaModal, setShowNuevaCitaModal] = useState(false)
  const [datosCita, setDatosCita] = useState({
    tratamiento_id: "",
    subtratamiento_id: "",
    fecha: "",
    hora: "",
    box: 0,
    precio: 0,
    duracion: 0
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
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<HorarioDisponible | null>(null)
  const [nombreCliente, setNombreCliente] = useState("")
  const [telefonoCliente, setTelefonoCliente] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [disponibilidadData, setDisponibilidadData] = useState<DisponibilidadData | null>(null)

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
          sub_tratamientos: (t.rf_subtratamientos || []).map((st) => ({
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
      duracion: 0
    })
  }

  // Función para seleccionar un subtratamiento
  const seleccionarSubTratamiento = async (subTratamiento: SubTratamiento) => {
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
        duracion: subTratamiento.duracion
      }))

      console.log('Consultando disponibilidad para tratamiento:', tratamientoSeleccionado.id)
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

      console.log('Datos de disponibilidad recibidos:', disponibilidadData)

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
        console.log('Fecha original:', disp.fecha_inicio)
        const fechaLocal = fechaUTCToLocal(disp.fecha_inicio)
        console.log('Fecha convertida:', fechaLocal)
        return {
          ...disp,
          fecha_inicio: fechaLocal,
          fecha_fin: fechaUTCToLocal(disp.fecha_fin)
        }
      })

      console.log('Fechas disponibles convertidas:', fechasDisponibles)
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
    if (!tratamientoSeleccionado || !subTratamientoSeleccionado) {
      toast({
        title: "Error",
        description: "Debes seleccionar un tratamiento y subtratamiento primero",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      // Asegurarnos de que la fecha esté en el formato correcto
      const fechaLocal = fechaUTCToLocal(fecha)
      setFechaSeleccionada(fechaLocal)
      setHorariosDisponibles([])

      // Actualizar los datos de la cita con la fecha seleccionada
      setDatosCita(prev => ({
        ...prev,
        fecha: fechaLocal
      }))

      // Obtener las citas existentes para esta fecha y box
      const { data: citasExistentes, error: errorCitas } = await supabaseClient
        .from("rf_citas")
        .select("*")
        .eq("fecha", fechaLocal)
        .in("box", tratamientoSeleccionado.boxes_disponibles)

      if (errorCitas) {
        console.error('Error al cargar citas existentes:', errorCitas)
        throw errorCitas
      }

      console.log('Citas existentes:', citasExistentes)

      // Obtener la disponibilidad para esta fecha
      const { data: disponibilidad, error: errorDisponibilidad } = await supabaseClient
        .from("rf_disponibilidad")
        .select("*")
        .eq("tratamiento_id", tratamientoSeleccionado.id)
        .lte("fecha_inicio", fechaLocal)
        .gte("fecha_fin", fechaLocal)
        .single()

      if (errorDisponibilidad) {
        console.error('Error al cargar disponibilidad:', errorDisponibilidad)
        throw errorDisponibilidad
      }

      if (!disponibilidad) {
        toast({
          title: "Error",
          description: "No hay disponibilidad para esta fecha",
          variant: "destructive"
        })
        return
      }

      // Generar horarios disponibles
      const horarios: HorarioDisponible[] = []
      const horaInicio = parseISO(`2000-01-01T${disponibilidad.hora_inicio}`)
      const horaFin = parseISO(`2000-01-01T${disponibilidad.hora_fin}`)
      const duracion = subTratamientoSeleccionado.duracion || 60 // duración en minutos

      // Generar horarios cada 30 minutos
      let horaActual = horaInicio
      while (horaActual < horaFin) {
        const horaStr = format(horaActual, 'HH:mm')
        const horaFinStr = format(addMinutes(horaActual, duracion), 'HH:mm')

        // Verificar si hay citas existentes en este horario
        const citasEnHorario = citasExistentes?.filter(cita => {
          const citaHoraInicio = parseISO(`2000-01-01T${cita.hora}`)
          const citaHoraFin = addMinutes(citaHoraInicio, cita.duracion || 60)
          return (
            (horaActual >= citaHoraInicio && horaActual < citaHoraFin) ||
            (addMinutes(horaActual, duracion) > citaHoraInicio && addMinutes(horaActual, duracion) <= citaHoraFin)
          )
        }) || []

        // Filtrar boxes disponibles que no estén ocupados
        const boxesDisponibles = disponibilidad.boxes_disponibles.filter((box: number) => 
          !citasEnHorario.some(cita => cita.box === box)
        )

        if (boxesDisponibles.length > 0) {
          horarios.push({
            hora_inicio: horaStr,
            hora_fin: horaFinStr,
            boxes_disponibles: boxesDisponibles
          })
        }

        horaActual = addMinutes(horaActual, 30)
      }

      setHorariosDisponibles(horarios)
    } catch (error) {
      console.error('Error al cargar horarios disponibles:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios disponibles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
    const datosCitaActualizados = {
      tratamiento_id: tratamientoSeleccionado.id,
      subtratamiento_id: subTratamientoSeleccionado.id,
      fecha: fechaSeleccionada,
      hora: hora,
      box: box,
      precio: subTratamientoSeleccionado.precio,
      duracion: subTratamientoSeleccionado.duracion
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
      const horariosDisponibles: HorarioDisponible[] = []
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
    <div className="space-y-6">
      {/* Botón para volver atrás */}
      {(tratamientoSeleccionado || subTratamientoSeleccionado) && (
        <Button variant="ghost" onClick={volverAtras} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      )}

      {/* Vista de selección de tratamiento */}
      {!tratamientoSeleccionado && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tratamientos.map((tratamiento) => (
            <Card
              key={tratamiento.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => seleccionarTratamiento(tratamiento)}
            >
              <CardHeader>
                <CardTitle>{tratamiento.nombre}</CardTitle>
                <CardDescription>{tratamiento.sub_tratamientos.length} sub-tratamientos disponibles</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Vista de selección de sub-tratamiento */}
      {tratamientoSeleccionado && !subTratamientoSeleccionado && (
        <div>
          <h2 className="text-2xl font-bold mb-4">{tratamientoSeleccionado.nombre}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <CardTitle>{subTratamiento.nombre}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatearDuracion(subTratamiento.duracion)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
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
        <div>
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
            <div className="grid gap-4 md:grid-cols-3">
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
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {tratamientoSeleccionado.nombre} - {subTratamientoSeleccionado.nombre}
          </h2>
          <p className="text-muted-foreground mb-6">
            Horarios disponibles para el {formatearFechaParaMostrar(fechaSeleccionada)}
          </p>

          <div className="grid gap-4 md:grid-cols-3">
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
            duracion: 0
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
          rf_subtratamientos: null
        }}
        fechaSeleccionada={datosCita.fecha}
        horaSeleccionada={datosCita.hora}
        boxSeleccionado={datosCita.box}
        title="Nueva Cita"
        description="Complete los datos para crear una nueva cita"
      />
    </div>
  )
}

export { SeleccionTratamientos }
export default SeleccionTratamientos
