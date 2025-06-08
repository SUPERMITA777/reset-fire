"use client"

import { useState, useEffect } from "react"
import { format, addDays, setHours, setMinutes, isBefore, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronRight, Clock, Calendar, ArrowLeft, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

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

// Tipo para los sub-tratamientos con duración y precio
interface SubTratamiento {
  id: string
  nombre: string
  duracion: number // duración en minutos
  precio: number // precio en pesos
  box: number
}

// Tipos para los horarios
interface HorarioDB {
  hora_inicio: string
  hora_fin: string
  vacantes_disponibles: number
}

interface HorarioDisponible {
  hora: string
  box: number
  disponible: boolean
}

interface DiaHorarios {
  fecha: Date
  horarios: HorarioDisponible[]
}

// Tipo para los tratamientos
interface TratamientoLocal extends Omit<TratamientoDB, 'sub_tratamientos'> {
  max_clientes_por_turno: number
  sub_tratamientos: SubTratamiento[]
}

// Función para formatear la duración
const formatearDuracion = (minutos: number) => {
  if (minutos < 60) return `${minutos}m`
  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60
  return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}m` : `${horas}h`
}

// Función para verificar disponibilidad de cupos
async function verificarDisponibilidadCupos(
  tratamientoId: string,
  fecha: Date,
  horaInicio: string,
  boxId: number
) {
  const { data, error } = await supabase
    .rpc('obtener_disponibilidad_turno', {
      p_tratamiento_id: tratamientoId,
      p_fecha: format(fecha, 'yyyy-MM-dd'),
      p_hora_inicio: horaInicio,
      p_box_id: boxId
    })

  if (error) throw error
  return data[0] || { cupos_disponibles: 0, total_cupos: 0 }
}

export function SeleccionTratamientos() {
  const { toast } = useToast()
  const router = useRouter()
  const [tratamientos, setTratamientos] = useState<TratamientoLocal[]>([])
  const [loading, setLoading] = useState(true)
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<TratamientoLocal | null>(null)
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<SubTratamiento | null>(null)
  const [horariosDisponibles, setHorariosDisponibles] = useState<DiaHorarios[]>([])
  const [citaDialogAbierto, setCitaDialogAbierto] = useState(false)
  const [crearTurnoDialogAbierto, setCrearTurnoDialogAbierto] = useState(false)
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<{
    fecha: Date
    hora: string
    box: number
  } | null>(null)
  const [datosCita, setDatosCita] = useState<{
    tratamiento: string
    subTratamiento: string
    fecha: Date | null
    horaInicio: string | null
  }>({
    tratamiento: "",
    subTratamiento: "",
    fecha: null,
    horaInicio: null,
  })
  const [disponibilidadCupos, setDisponibilidadCupos] = useState<Record<string, { cupos_disponibles: number, total_cupos: number }>>({})

  useEffect(() => {
    async function cargarTratamientos() {
      setLoading(true)
      try {
        const data = await getTratamientos()
        // Convertir los tratamientos al tipo correcto
        const tratamientosFormateados: TratamientoLocal[] = data.map((t: TratamientoDB) => ({
          ...t,
          max_clientes_por_turno: t.max_clientes_por_turno || 1,
          sub_tratamientos: t.sub_tratamientos.map((st: SubTratamiento) => ({
            ...st,
            box: st.box || 1
          }))
        }))
        setTratamientos(tratamientosFormateados)
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
  }, [toast])

  // Función para seleccionar un tratamiento
  const seleccionarTratamiento = (tratamiento: TratamientoLocal) => {
    setTratamientoSeleccionado(tratamiento)
    setSubTratamientoSeleccionado(null)
    setHorariosDisponibles([])
    setDatosCita({
      tratamiento: tratamiento.id,
      subTratamiento: "",
      fecha: null,
      horaInicio: null
    })
  }

  // Función para seleccionar un subtratamiento
  const seleccionarSubTratamiento = (subTratamiento: SubTratamiento) => {
    if (!tratamientoSeleccionado) return
    setSubTratamientoSeleccionado(subTratamiento)
    setDatosCita(prev => ({
      ...prev,
      subTratamiento: subTratamiento.id
    }))
  }

  // Función para seleccionar un horario y abrir el formulario de cita
  const seleccionarHorario = async (fecha: Date, hora: string, box: number) => {
    if (!tratamientoSeleccionado || !subTratamientoSeleccionado) return

    // Verificar disponibilidad de cupos
    const disponibilidad = await verificarDisponibilidadCupos(
      tratamientoSeleccionado.id,
      fecha,
      hora,
      box
    )

    // Si no hay cupos disponibles, abrir el diálogo de crear turno
    if (disponibilidad.cupos_disponibles <= 0) {
      setTurnoSeleccionado({
        fecha,
        hora,
        box
      })
      setCrearTurnoDialogAbierto(true)
      return
    }

    // Si hay cupos disponibles, abrir el diálogo de crear cita
    setDatosCita(prev => ({
      ...prev,
      fecha: fecha,
      horaInicio: hora
    }))

    setCitaDialogAbierto(true)
  }

  // Función para cargar la disponibilidad de cupos
  const cargarDisponibilidadCupos = async (horarios: HorarioDisponible[]) => {
    if (!tratamientoSeleccionado) return

    const disponibilidad: Record<string, { cupos_disponibles: number, total_cupos: number }> = {}
    
    for (const horario of horarios) {
      const fecha = new Date(horario.hora)
      const key = format(fecha, 'yyyy-MM-dd HH:mm')
      const data = await verificarDisponibilidadCupos(
        tratamientoSeleccionado.id,
        fecha,
        format(fecha, 'HH:mm'),
        horario.box
      )
      disponibilidad[key] = data
    }

    setDisponibilidadCupos(disponibilidad)
  }

  // Actualizar la disponibilidad cuando cambian los horarios
  useEffect(() => {
    if (horariosDisponibles.length > 0 && tratamientoSeleccionado) {
      const todosLosHorarios = horariosDisponibles.flatMap(dia => dia.horarios)
      cargarDisponibilidadCupos(todosLosHorarios)
    }
  }, [horariosDisponibles, tratamientoSeleccionado])

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
      const { data, error } = await supabase
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
            hora: fechaHora.toISOString(),
            box: Number(boxId)
          })
        }
      }

      // Ordenar por hora
      horariosDisponibles.sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime())

      // Agrupar por día
      const horariosPorDia: DiaHorarios[] = [{
        fecha: fecha,
        horarios: horariosDisponibles
      }]

      setHorariosDisponibles(horariosPorDia)
    } catch (error) {
      console.error('Error al cargar horarios disponibles:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios disponibles",
        variant: "destructive"
      })
    }
  }

  return (
    <div>
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
                <CardDescription>{tratamiento.sub_tratamientos?.length} sub-tratamientos disponibles</CardDescription>
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
            {tratamientoSeleccionado.sub_tratamientos?.map((subTratamiento) => (
              <Card
                key={subTratamiento.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => seleccionarSubTratamiento(subTratamiento)}
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

      {/* Vista de selección de horario */}
      {tratamientoSeleccionado && subTratamientoSeleccionado && (
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {tratamientoSeleccionado.nombre} - {subTratamientoSeleccionado.nombre}
          </h2>
          <p className="text-muted-foreground mb-6">
            Duración: {formatearDuracion(subTratamientoSeleccionado.duracion)} | Precio: $
            {subTratamientoSeleccionado.precio.toLocaleString()} | Selecciona un horario disponible para agendar tu cita
          </p>

          {horariosDisponibles.length > 0 ? (
            <div className="space-y-8">
              {horariosDisponibles.map((dia, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium">
                    {format(dia.fecha, 'EEEE dd/MM/yyyy', { locale: es })}
                  </h3>
                  <ScrollArea className="whitespace-nowrap pb-2">
                    <div className="flex gap-2">
                      {dia.horarios.map((horario: HorarioDisponible, i: number) => {
                        const key = format(new Date(horario.hora), 'yyyy-MM-dd HH:mm')
                        const disponibilidad = disponibilidadCupos[key] || { cupos_disponibles: 0, total_cupos: 0 }
                        const hora = format(new Date(horario.hora), "HH:mm")
                        
                        return (
                          <div key={i} className="flex flex-col gap-1">
                            <Button
                              variant={disponibilidad.cupos_disponibles > 0 ? "outline" : "secondary"}
                              className="flex-shrink-0"
                              onClick={() => disponibilidad.cupos_disponibles > 0 && 
                                seleccionarHorario(new Date(horario.hora), hora, horario.box)}
                              disabled={disponibilidad.cupos_disponibles <= 0}
                            >
                              <div className="flex flex-col items-center">
                                <span>{hora}</span>
                                <span className="text-xs text-muted-foreground">
                                  Box {horario.box}
                                </span>
                                {tratamientoSeleccionado?.max_clientes_por_turno > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    {disponibilidad.cupos_disponibles} cupos
                                  </span>
                                )}
                              </div>
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">Calculando horarios disponibles</h3>
              <p className="text-muted-foreground">Esto puede tomar unos momentos...</p>
            </div>
          )}
        </div>
      )}

      {/* Diálogo de nueva cita */}
      <Dialog open={citaDialogAbierto} onOpenChange={setCitaDialogAbierto}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nueva Cita</DialogTitle>
            <DialogDescription>
              Complete los datos del cliente para agendar la cita
            </DialogDescription>
          </DialogHeader>
          {datosCita.fecha && datosCita.horaInicio && datosCita.tratamiento && datosCita.subTratamiento && (
            <FormularioCita
              fechaInicial={datosCita.fecha}
              horaInicialInicio={datosCita.horaInicio}
              tratamientoInicial={datosCita.tratamiento}
              subTratamientoInicial={datosCita.subTratamiento}
              boxInicial={turnoSeleccionado?.box || 1}
              onSuccess={() => {
                setCitaDialogAbierto(false)
                setDatosCita({
                  tratamiento: "",
                  subTratamiento: "",
                  fecha: null,
                  horaInicio: null
                })
                setTurnoSeleccionado(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Agregar el diálogo de crear turno */}
      <Dialog open={crearTurnoDialogAbierto} onOpenChange={setCrearTurnoDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Turno</DialogTitle>
            <DialogDescription>
              Crear un nuevo turno para {tratamientoSeleccionado?.nombre} en {turnoSeleccionado && format(turnoSeleccionado.fecha, 'dd/MM/yyyy')} a las {turnoSeleccionado?.hora}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Box</Label>
              <Input value={turnoSeleccionado?.box?.toString() || ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input value={turnoSeleccionado ? format(turnoSeleccionado.fecha, 'dd/MM/yyyy') : ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Hora</Label>
              <Input value={turnoSeleccionado?.hora || ''} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (turnoSeleccionado && tratamientoSeleccionado) {
                  // Abrir el diálogo de disponibilidad con los datos prellenados
                  router.push(`/tratamientos/gestion?tratamiento=${tratamientoSeleccionado.id}&fecha=${format(turnoSeleccionado.fecha, 'yyyy-MM-dd')}&hora=${turnoSeleccionado.hora}&box=${turnoSeleccionado.box}`)
                }
                setCrearTurnoDialogAbierto(false)
              }}
            >
              Crear Turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
