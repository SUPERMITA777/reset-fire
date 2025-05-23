"use client"

import { useState, useEffect } from "react"
import { format, addDays, isSameDay, addMinutes, startOfDay, endOfDay, eachDayOfInterval, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Settings2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FormularioCita } from "@/components/formulario-cita"
import { getTratamientos, verificarDisponibilidadBox, getFechasDisponibles } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { toZonedTime } from 'date-fns-tz'

interface SubTratamiento {
  id: string
  nombre: string
  duracion: number
  precio: number
}

interface Tratamiento {
  id: string
  nombre: string
  sub_tratamientos: SubTratamiento[]
}

export default function TratamientosPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<Tratamiento | null>(null)
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<SubTratamiento | null>(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(undefined)
  const [horariosDisponibles, setHorariosDisponibles] = useState<{ hora: string; box: number; disponible: boolean }[]>([])
  const [horariosMostrados, setHorariosMostrados] = useState<{ hora: string; box: number; disponible: boolean }[]>([])
  const [offsetHorarios, setOffsetHorarios] = useState(0)
  const [dialogoNuevaCita, setDialogoNuevaCita] = useState(false)
  const [datosCita, setDatosCita] = useState<{
    fecha: Date
    horaInicio: string
    box: number
  } | null>(null)
  const [fechasDisponibles, setFechasDisponibles] = useState<Date[]>([])
  const [mostrarHorarios, setMostrarHorarios] = useState(false)

  // Cargar tratamientos al montar el componente
  useEffect(() => {
    async function cargarTratamientos() {
      const data = await getTratamientos()
      setTratamientos(data)
    }
    cargarTratamientos()
  }, [])

  // Cargar fechas disponibles cuando se selecciona un sub-tratamiento
  useEffect(() => {
    if (subTratamientoSeleccionado && tratamientoSeleccionado) {
      cargarFechasDisponibles()
    }
  }, [subTratamientoSeleccionado, tratamientoSeleccionado])

  // Función para convertir una fecha a la zona horaria de Argentina
  const convertirFechaArgentina = (fechaStr: string) => {
    const fecha = parseISO(fechaStr)
    return toZonedTime(fecha, 'America/Argentina/Buenos_Aires')
  }

  const cargarFechasDisponibles = async () => {
    if (!subTratamientoSeleccionado || !tratamientoSeleccionado) return

    try {
      // Obtener las fechas disponibles del tratamiento padre
      const fechasDisponibles = await getFechasDisponibles(tratamientoSeleccionado.id)
      
      // Convertir las fechas disponibles a objetos Date
      const fechas = fechasDisponibles.flatMap(fecha => {
        const inicio = convertirFechaArgentina(fecha.fecha_inicio)
        const fin = convertirFechaArgentina(fecha.fecha_fin)
        const fechas: Date[] = []
        
        // Generar todas las fechas entre inicio y fin
        let fechaActual = inicio
        while (fechaActual <= fin) {
          // Verificar si la fecha está dentro del horario configurado
          const horaInicio = parseInt(fecha.hora_inicio.split(':')[0])
          const horaFin = parseInt(fecha.hora_fin.split(':')[0])
          
          // Solo incluir fechas que tengan al menos un box disponible
          if (fecha.boxes_disponibles.length > 0) {
            fechas.push(fechaActual)
          }
          
          fechaActual = addDays(fechaActual, 1)
        }
        
        return fechas
      })

      setFechasDisponibles(fechas)
    } catch (error) {
      console.error('Error al cargar fechas disponibles:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las fechas disponibles",
        variant: "destructive"
      })
    }
  }

  // Buscar horarios disponibles cuando se selecciona una fecha
  const buscarHorariosDisponibles = async (fecha: Date, subTratamiento: SubTratamiento, offset: number = 0): Promise<{ hora: string; box: number; disponible: boolean }[]> => {
    if (!tratamientoSeleccionado) {
      console.log('No hay tratamiento seleccionado')
      return []
    }

    try {
      console.log('Buscando horarios para:', {
        fecha: format(fecha, 'yyyy-MM-dd'),
        tratamientoId: tratamientoSeleccionado.id,
        subTratamientoId: subTratamiento.id,
        offset
      })

      // Obtener las fechas disponibles del tratamiento
      const fechasDisponibles = await getFechasDisponibles(tratamientoSeleccionado.id)
      
      // Encontrar la configuración de disponibilidad para la fecha seleccionada
      const fechaConfig = fechasDisponibles.find(f => {
        const inicio = convertirFechaArgentina(f.fecha_inicio)
        const fin = convertirFechaArgentina(f.fecha_fin)
        const fechaSeleccionada = toZonedTime(fecha, 'America/Argentina/Buenos_Aires')
        
        const inicioComparar = startOfDay(inicio)
        const finComparar = startOfDay(fin)
        const fechaSeleccionadaComparar = startOfDay(fechaSeleccionada)
        
        return fechaSeleccionadaComparar >= inicioComparar && fechaSeleccionadaComparar <= finComparar
      })

      if (!fechaConfig) {
        console.log('No se encontró configuración para la fecha seleccionada')
        toast({
          title: "Fecha no disponible",
          description: "La fecha seleccionada no está dentro del rango de fechas disponibles para este tratamiento.",
          variant: "destructive"
        })
        return []
      }

      // Obtener todas las citas existentes para la fecha seleccionada
      const { data: citasExistentes, error: errorCitas } = await supabase
        .from('citas')
        .select('*')
        .eq('fecha', format(fecha, 'yyyy-MM-dd'))

      if (errorCitas) {
        console.error('Error al obtener citas existentes:', errorCitas)
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas existentes",
          variant: "destructive"
        })
        return []
      }

      const horarios: { hora: string; box: number; disponible: boolean }[] = []
      const [horaInicioConfig] = fechaConfig.hora_inicio.split(':').map(Number)
      const [horaFinConfig] = fechaConfig.hora_fin.split(':').map(Number)
      let turnosEncontrados = 0
      const TURNOS_A_BUSCAR = 5

      // Generar horarios hasta encontrar 5 disponibles o terminar el rango
      for (const box of fechaConfig.boxes_disponibles) {
        if (turnosEncontrados >= TURNOS_A_BUSCAR) break
        
        for (let hora = horaInicioConfig; hora < horaFinConfig && turnosEncontrados < TURNOS_A_BUSCAR; hora++) {
          for (let minuto = 0; minuto < 60 && turnosEncontrados < TURNOS_A_BUSCAR; minuto += 15) {
            const horaInicio = `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`
            const horaFin = format(
              addMinutes(new Date(`2000-01-01T${horaInicio}`), subTratamiento.duracion),
              "HH:mm"
            )

            // Verificar si este horario se superpone con alguna cita existente
            const haySuperposicion = citasExistentes.some(cita => {
              const citaInicio = new Date(`2000-01-01T${cita.hora_inicio}`)
              const citaFin = new Date(`2000-01-01T${cita.hora_fin}`)
              const horarioInicio = new Date(`2000-01-01T${horaInicio}`)
              const horarioFin = new Date(`2000-01-01T${horaFin}`)

              return cita.box_id === box && (
                (horarioInicio >= citaInicio && horarioInicio < citaFin) ||
                (horarioFin > citaInicio && horarioFin <= citaFin) ||
                (horarioInicio <= citaInicio && horarioFin >= citaFin)
              )
            })

            // Verificar si el tratamiento está disponible en este horario/box
            const disponibleTratamiento = await verificarDisponibilidadBox(
              format(fecha, 'yyyy-MM-dd'),
              horaInicio,
              horaFin,
              box,
              tratamientoSeleccionado.id
            )

            const disponible = !haySuperposicion && disponibleTratamiento

            if (disponible) {
              horarios.push({ 
                hora: horaInicio, 
                box, 
                disponible 
              })
              turnosEncontrados++
              if (turnosEncontrados >= TURNOS_A_BUSCAR) break
            }
          }
        }
      }

      console.log('Total horarios disponibles encontrados:', horarios.length)
      
      // Ordenar los horarios por hora
      horarios.sort((a, b) => a.hora.localeCompare(b.hora))
      
      // Si es la primera búsqueda (offset = 0), actualizar los estados
      if (offset === 0) {
        setHorariosDisponibles(horarios)
        setHorariosMostrados(horarios)
        setOffsetHorarios(0)

        // Mostrar mensaje si no se encontraron horarios
        if (horarios.length === 0) {
          toast({
            title: "Sin horarios disponibles",
            description: "No hay horarios disponibles para esta fecha.",
            variant: "destructive"
          })
        }
      }

      return horarios
    } catch (error) {
      console.error('Error detallado al buscar horarios disponibles:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios disponibles. Por favor, intente nuevamente.",
        variant: "destructive"
      })
      return []
    }
  }

  // Manejar selección de sub-tratamiento
  const handleSubTratamientoSeleccionado = (subTrat: SubTratamiento, tratamiento: Tratamiento) => {
    setSubTratamientoSeleccionado(subTrat)
    setTratamientoSeleccionado(tratamiento)
    setMostrarHorarios(false)
    setFechaSeleccionada(undefined)
    setHorariosDisponibles([])
  }

  // Manejar selección de fecha desde lenteja
  const handleFechaSeleccionadaDesdeLenteja = async (fecha: Date) => {
    console.log('Fecha seleccionada:', format(fecha, 'yyyy-MM-dd'))
    setFechaSeleccionada(fecha)
    setMostrarHorarios(true)
    setOffsetHorarios(0) // Resetear el offset al seleccionar una nueva fecha
    if (subTratamientoSeleccionado) {
      console.log('Sub-tratamiento seleccionado:', subTratamientoSeleccionado)
      await buscarHorariosDisponibles(fecha, subTratamientoSeleccionado, 0)
    } else {
      console.log('No hay sub-tratamiento seleccionado')
    }
  }

  // Manejar nueva búsqueda de horarios
  const handleNuevaBusqueda = async () => {
    if (!fechaSeleccionada || !subTratamientoSeleccionado || !tratamientoSeleccionado) return

    try {
      console.log('Buscando más turnos disponibles...')
      const nuevosHorarios = await buscarHorariosDisponibles(
        fechaSeleccionada,
        subTratamientoSeleccionado,
        horariosDisponibles.length
      )

      if (nuevosHorarios.length > 0) {
        // Agregar los nuevos horarios a los existentes
        setHorariosDisponibles(prev => [...prev, ...nuevosHorarios])
        setHorariosMostrados(prev => [...prev, ...nuevosHorarios])
        setOffsetHorarios(prev => prev + nuevosHorarios.length)
        
        toast({
          title: "Nuevos turnos encontrados",
          description: `Se encontraron ${nuevosHorarios.length} turnos adicionales`
        })
      } else {
        toast({
          title: "No hay más turnos",
          description: "No se encontraron más turnos disponibles para esta fecha",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al buscar más turnos:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar más turnos disponibles",
        variant: "destructive"
      })
    }
  }

  // Manejar selección de horario
  const handleHorarioSeleccionado = (hora: string, box: number) => {
    if (!fechaSeleccionada || !subTratamientoSeleccionado || !tratamientoSeleccionado) return

    setDatosCita({
      fecha: fechaSeleccionada,
      horaInicio: hora,
      box
    })
    setDialogoNuevaCita(true)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tratamientos Disponibles</h1>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/configuraciones")}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          Gestión de Tratamientos
        </Button>
      </div>

      {/* Lista de tratamientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tratamientos.map((tratamiento) => (
          <Card
            key={tratamiento.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle>{tratamiento.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tratamiento.sub_tratamientos.map((subTrat) => (
                  <div
                    key={subTrat.id}
                    className="p-2 rounded bg-muted hover:bg-muted/80 cursor-pointer"
                    onClick={() => handleSubTratamientoSeleccionado(subTrat, tratamiento)}
                  >
                    <div className="font-medium">{subTrat.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      Duración: {Math.floor(subTrat.duracion / 60)}h {subTrat.duracion % 60}m
                    </div>
                    <div className="text-sm font-medium">
                      ${subTrat.precio.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fechas disponibles como lentejas */}
      {subTratamientoSeleccionado && !mostrarHorarios && (
        <Card>
          <CardHeader>
            <CardTitle>Fechas Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fechasDisponibles.map((fecha) => (
                <Badge
                  key={fecha.toISOString()}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleFechaSeleccionadaDesdeLenteja(fecha)}
                >
                  {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Horarios disponibles como lentejas */}
      {subTratamientoSeleccionado && mostrarHorarios && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Horarios Disponibles</CardTitle>
              <CardDescription>
                {format(fechaSeleccionada!, "EEEE d 'de' MMMM", { locale: es })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {horariosDisponibles.length > horariosMostrados.length + offsetHorarios && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNuevaBusqueda}
                >
                  Buscar más turnos
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMostrarHorarios(false)
                  setFechaSeleccionada(undefined)
                  setHorariosDisponibles([])
                  setHorariosMostrados([])
                  setOffsetHorarios(0)
                }}
              >
                Volver a fechas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {horariosMostrados.map((horario) => (
                <Badge
                  key={`${horario.hora}-${horario.box}`}
                  variant="default"
                  className="cursor-pointer hover:bg-primary/90 p-2"
                  onClick={() => handleHorarioSeleccionado(horario.hora, horario.box)}
                >
                  {horario.hora} - Box {horario.box}
                </Badge>
              ))}
            </div>
            {horariosMostrados.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay más horarios disponibles para esta fecha
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo de nueva cita */}
      <Dialog open={dialogoNuevaCita} onOpenChange={setDialogoNuevaCita}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nueva Cita</DialogTitle>
            <DialogDescription>
              Complete los datos del cliente para agendar la cita
            </DialogDescription>
          </DialogHeader>
          {datosCita && subTratamientoSeleccionado && tratamientoSeleccionado && (
            <FormularioCita
              fechaInicial={datosCita.fecha}
              horaInicialInicio={datosCita.horaInicio}
              tratamientoInicial={tratamientoSeleccionado.id}
              subTratamientoInicial={subTratamientoSeleccionado.id}
              boxInicial={datosCita.box}
              onSuccess={() => {
                setDialogoNuevaCita(false)
                setDatosCita(null)
                setHorariosDisponibles([])
                setHorariosMostrados([])
                setOffsetHorarios(0)
                setFechaSeleccionada(undefined)
                setMostrarHorarios(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
