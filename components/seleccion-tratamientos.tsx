"use client"

import { useState, useEffect } from "react"
import { format, addDays, setHours, setMinutes, isBefore, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronRight, Clock, Calendar, ArrowLeft, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FormularioCita } from "@/components/formulario-cita"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTratamientos } from "@/lib/supabase"

// Tipo para los sub-tratamientos con duración y precio
interface SubTratamiento {
  id: string
  nombre: string
  duracion: number // duración en minutos
  precio: number // precio en pesos
}

// Tipo para los tratamientos
interface Tratamiento {
  id: string
  nombre: string
  sub_tratamientos?: SubTratamiento[] // Cambiado de subTratamientos a sub_tratamientos para coincidir con la DB
}

// Datos de ejemplo
const tratamientosIniciales: Tratamiento[] = [
  {
    id: "depilacion",
    nombre: "Depilación láser",
    sub_tratamientos: [
      { id: "piernas", nombre: "Piernas", duracion: 60, precio: 8000 },
      { id: "brazos", nombre: "Brazos", duracion: 45, precio: 6000 },
      { id: "axilas", nombre: "Axilas", duracion: 30, precio: 4000 },
      { id: "rostro", nombre: "Rostro", duracion: 30, precio: 5000 },
      { id: "espalda", nombre: "Espalda", duracion: 60, precio: 9000 },
      { id: "completo", nombre: "Cuerpo completo", duracion: 120, precio: 20000 },
    ],
  },
  {
    id: "facial",
    nombre: "Tratamiento facial",
    sub_tratamientos: [
      { id: "limpieza", nombre: "Limpieza profunda", duracion: 45, precio: 5500 },
      { id: "hidratacion", nombre: "Hidratación", duracion: 30, precio: 4500 },
      { id: "antiedad", nombre: "Anti-edad", duracion: 60, precio: 7500 },
      { id: "acne", nombre: "Tratamiento para acné", duracion: 45, precio: 6000 },
    ],
  },
  {
    id: "masaje",
    nombre: "Masaje",
    sub_tratamientos: [
      { id: "relajante", nombre: "Relajante", duracion: 60, precio: 7000 },
      { id: "deportivo", nombre: "Deportivo", duracion: 45, precio: 6500 },
      { id: "descontracturante", nombre: "Descontracturante", duracion: 60, precio: 7500 },
      { id: "piedras", nombre: "Piedras calientes", duracion: 90, precio: 9500 },
    ],
  },
  {
    id: "corte",
    nombre: "Corte de cabello",
    sub_tratamientos: [
      { id: "corte_basico", nombre: "Corte básico", duracion: 30, precio: 2500 },
      { id: "corte_lavado", nombre: "Corte con lavado", duracion: 45, precio: 3500 },
      { id: "corte_peinado", nombre: "Corte con peinado", duracion: 60, precio: 4500 },
    ],
  },
  {
    id: "tinte",
    nombre: "Tinte",
    sub_tratamientos: [
      { id: "tinte_raiz", nombre: "Retoque de raíz", duracion: 60, precio: 5000 },
      { id: "tinte_completo", nombre: "Tinte completo", duracion: 90, precio: 8000 },
      { id: "mechas", nombre: "Mechas/Highlights", duracion: 120, precio: 10000 },
      { id: "balayage", nombre: "Balayage", duracion: 150, precio: 13000 },
    ],
  },
  {
    id: "manicura",
    nombre: "Manicura",
    sub_tratamientos: [
      { id: "manicura_basica", nombre: "Manicura básica", duracion: 30, precio: 2000 },
      { id: "manicura_semipermanente", nombre: "Semipermanente", duracion: 45, precio: 3500 },
      { id: "manicura_acrilicas", nombre: "Uñas acrílicas", duracion: 90, precio: 6000 },
    ],
  },
  {
    id: "pedicura",
    nombre: "Pedicura",
    sub_tratamientos: [
      { id: "pedicura_basica", nombre: "Pedicura básica", duracion: 45, precio: 3000 },
      { id: "pedicura_spa", nombre: "Pedicura spa", duracion: 60, precio: 4500 },
      { id: "pedicura_semipermanente", nombre: "Semipermanente", duracion: 60, precio: 4000 },
    ],
  },
  {
    id: "maquillaje",
    nombre: "Maquillaje",
    sub_tratamientos: [
      { id: "social", nombre: "Social", duracion: 45, precio: 5000 },
      { id: "novia", nombre: "Novia", duracion: 90, precio: 12000 },
      { id: "quinceañera", nombre: "Quinceañera", duracion: 60, precio: 8000 },
      { id: "artistico", nombre: "Artístico", duracion: 75, precio: 9000 },
    ],
  },
]

// Datos de ejemplo para citas existentes (para simular disponibilidad)
const citasExistentes = [
  {
    fecha: new Date(2025, 4, 20, 10, 0),
    duracion: 60,
  },
  {
    fecha: new Date(2025, 4, 20, 14, 0),
    duracion: 45,
  },
  {
    fecha: new Date(2025, 4, 21, 11, 0),
    duracion: 90,
  },
]

// Función para formatear la duración
const formatearDuracion = (minutos: number) => {
  if (minutos < 60) return `${minutos}m`
  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60
  return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}m` : `${horas}h`
}

// Función para verificar si un horario está disponible
const estaDisponible = (fecha: Date, duracion: number) => {
  const fechaFin = new Date(fecha.getTime() + duracion * 60000)

  // Verificar si está dentro del horario de atención (8am a 8pm)
  if (fecha.getHours() < 8 || fechaFin.getHours() >= 20 || (fechaFin.getHours() === 20 && fechaFin.getMinutes() > 0)) {
    return false
  }

  // Verificar si se solapa con alguna cita existente
  for (const cita of citasExistentes) {
    const citaFin = new Date(cita.fecha.getTime() + cita.duracion * 60000)

    // Si la nueva cita comienza durante una cita existente
    if (isAfter(fecha, cita.fecha) && isBefore(fecha, citaFin)) {
      return false
    }

    // Si la nueva cita termina durante una cita existente
    if (isAfter(fechaFin, cita.fecha) && isBefore(fechaFin, citaFin)) {
      return false
    }

    // Si la nueva cita engloba completamente una cita existente
    if (isBefore(fecha, cita.fecha) && isAfter(fechaFin, citaFin)) {
      return false
    }
  }

  return true
}

// Función para generar horarios disponibles
const generarHorariosDisponibles = (fechaInicio: Date, duracion: number, dias = 7) => {
  const horarios = []

  for (let dia = 0; dia < dias; dia++) {
    const fecha = addDays(fechaInicio, dia)
    const horariosDelDia = []

    // Generar horarios cada 30 minutos desde las 8am hasta las 8pm
    for (let hora = 8; hora < 20; hora++) {
      for (const minuto of [0, 30]) {
        const horaPropuesta = setHours(setMinutes(fecha, minuto), hora)

        // Verificar si el horario está disponible
        if (estaDisponible(horaPropuesta, duracion)) {
          horariosDelDia.push(horaPropuesta)
        }
      }
    }

    if (horariosDelDia.length > 0) {
      horarios.push({
        fecha,
        horarios: horariosDelDia,
      })
    }
  }

  return horarios
}

export function SeleccionTratamientos() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<Tratamiento | null>(null)
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<SubTratamiento | null>(null)
  const [horariosDisponibles, setHorariosDisponibles] = useState<any[]>([])
  const [citaDialogAbierto, setCitaDialogAbierto] = useState(false)
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

  useEffect(() => {
    cargarTratamientos()
  }, [])

  async function cargarTratamientos() {
    setLoading(true)
    try {
      const data = await getTratamientos()
      setTratamientos(data)
    } catch (e) {
      // Manejo de error
    } finally {
      setLoading(false)
    }
  }

  // Función para seleccionar un tratamiento
  const seleccionarTratamiento = (tratamiento: Tratamiento) => {
    setTratamientoSeleccionado(tratamiento)
    setSubTratamientoSeleccionado(null)
    setHorariosDisponibles([])
  }

  // Función para seleccionar un sub-tratamiento
  const seleccionarSubTratamiento = (subTratamiento: SubTratamiento) => {
    setSubTratamientoSeleccionado(subTratamiento)

    // Generar horarios disponibles para los próximos 7 días
    const horarios = generarHorariosDisponibles(new Date(), subTratamiento.duracion, 7)
    setHorariosDisponibles(horarios)
  }

  // Función para seleccionar un horario y abrir el formulario de cita
  const seleccionarHorario = (fecha: Date) => {
    if (!tratamientoSeleccionado || !subTratamientoSeleccionado) return

    setDatosCita({
      tratamiento: tratamientoSeleccionado.id,
      subTratamiento: subTratamientoSeleccionado.id,
      fecha: fecha,
      horaInicio: `${fecha.getHours()}:${fecha.getMinutes() === 0 ? "00" : fecha.getMinutes()}`,
    })

    setCitaDialogAbierto(true)
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

  // Función para manejar el éxito al guardar una cita
  const handleCitaGuardada = () => {
    setCitaDialogAbierto(false)
    // Aquí podrías actualizar la lista de citas o hacer otras acciones necesarias
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
                  <h3 className="text-lg font-medium">{format(dia.fecha, "EEEE d 'de' MMMM", { locale: es })}</h3>
                  <ScrollArea className="whitespace-nowrap pb-2">
                    <div className="flex gap-2">
                      {dia.horarios.map((horario: Date, i: number) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="flex-shrink-0"
                          onClick={() => seleccionarHorario(horario)}
                        >
                          {format(horario, "HH:mm")}
                        </Button>
                      ))}
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

      {/* Diálogo para crear nueva cita */}
      <Dialog open={citaDialogAbierto} onOpenChange={setCitaDialogAbierto}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Agendar nueva cita</DialogTitle>
            <DialogDescription>
              Complete los datos para agendar una nueva cita con el tratamiento seleccionado
            </DialogDescription>
          </DialogHeader>
          <FormularioCita
            tratamientoInicial={datosCita.tratamiento}
            subTratamientoInicial={datosCita.subTratamiento}
            fechaInicial={datosCita.fecha}
            horaInicialInicio={datosCita.horaInicio}
            onSuccess={handleCitaGuardada}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
