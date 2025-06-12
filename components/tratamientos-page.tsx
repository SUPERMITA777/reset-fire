"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, DollarSign, ChevronRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

type Tratamiento = {
  id: string
  nombre: string
  sub_tratamientos: SubTratamiento[]
}

type SubTratamiento = {
  id: string
  nombre: string
  duracion: number
  precio: number
  tratamiento_id: string
}

type Disponibilidad = {
  id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  boxes_disponibles: number[]
  cantidad_clientes: number
  tratamiento_id: string
}

export function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<Tratamiento | null>(null)
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<SubTratamiento | null>(null)
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([])
  const [fechasDisponibles, setFechasDisponibles] = useState<{fecha: string, turnos: string[]}[]>([])
  const [mostrarTurnos, setMostrarTurnos] = useState(false)
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null)

  useEffect(() => {
    cargarTratamientos()
  }, [])

  useEffect(() => {
    if (subTratamientoSeleccionado) {
      cargarDisponibilidades()
    }
  }, [subTratamientoSeleccionado])

  const cargarTratamientos = async () => {
    try {
      const { data, error } = await supabase
        .from("rf_tratamientos")
        .select(`
          id,
          nombre,
          sub_tratamientos (
            id,
            nombre,
            duracion,
            precio,
            tratamiento_id
          )
        `)
        .order('nombre')

      if (error) throw error
      setTratamientos(data || [])
    } catch (error) {
      console.error("Error al cargar tratamientos:", error)
    }
  }

  const cargarDisponibilidades = async () => {
    if (!subTratamientoSeleccionado) return

    try {
      const { data, error } = await supabase
        .from("rf_disponibilidad")
        .select("*")
        .eq("tratamiento_id", subTratamientoSeleccionado.tratamiento_id)
        .gte("fecha_inicio", new Date().toISOString().split('T')[0])
        .order("fecha_inicio")

      if (error) throw error

      // Procesar las disponibilidades para obtener las próximas 3 fechas
      const fechasUnicas = Array.from(new Set(data.map(d => d.fecha_inicio)))
      const proximasFechas = fechasUnicas.slice(0, 3)

      const fechasConTurnos = proximasFechas.map(fecha => {
        const disponibilidadesDelDia = data.filter(d => d.fecha_inicio === fecha)
        const turnos = disponibilidadesDelDia.flatMap(d => {
          const turnos: string[] = []
          let horaActual = d.hora_inicio
          while (horaActual < d.hora_fin) {
            turnos.push(horaActual)
            // Sumar la duración del subtratamiento
            const [horas, minutos] = horaActual.split(':').map(Number)
            const duracionMinutos = subTratamientoSeleccionado.duracion
            const nuevaHora = new Date()
            nuevaHora.setHours(horas, minutos + duracionMinutos)
            horaActual = format(nuevaHora, 'HH:mm')
          }
          return turnos
        })
        return {
          fecha,
          turnos: turnos.slice(0, 5) // Tomar solo los primeros 5 turnos
        }
      })

      setFechasDisponibles(fechasConTurnos)
    } catch (error) {
      console.error("Error al cargar disponibilidades:", error)
    }
  }

  const formatearDuracion = (minutos: number) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}m`
  }

  return (
    <div className="container mx-auto py-8">
      {!tratamientoSeleccionado && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tratamientos.map((tratamiento) => (
            <Card
              key={tratamiento.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setTratamientoSeleccionado(tratamiento)}
            >
              <CardHeader>
                <CardTitle>{tratamiento.nombre}</CardTitle>
                <CardDescription>
                  {tratamiento.sub_tratamientos.length} subtratamientos disponibles
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {tratamientoSeleccionado && !subTratamientoSeleccionado && (
        <div>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setTratamientoSeleccionado(null)}
          >
            ← Volver a tratamientos
          </Button>
          <h2 className="text-2xl font-bold mb-4">{tratamientoSeleccionado.nombre}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tratamientoSeleccionado.sub_tratamientos.map((subTratamiento) => (
              <Card
                key={subTratamiento.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSubTratamientoSeleccionado(subTratamiento)}
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
                      ${subTratamiento.precio.toLocaleString()}
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

      {subTratamientoSeleccionado && (
        <div>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSubTratamientoSeleccionado(null)}
          >
            ← Volver a {tratamientoSeleccionado?.nombre}
          </Button>
          <h2 className="text-2xl font-bold mb-4">{subTratamientoSeleccionado.nombre}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {fechasDisponibles.map(({ fecha, turnos }) => (
              <Card
                key={fecha}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  setFechaSeleccionada(fecha)
                  setMostrarTurnos(true)
                }}
              >
                <CardHeader>
                  <CardTitle>
                    {format(new Date(fecha), "EEEE d 'de' MMMM", { locale: es })}
                  </CardTitle>
                  <CardDescription>
                    {turnos.length} turnos disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {turnos.slice(0, 3).map((turno, index) => (
                      <Badge key={index} variant="secondary">
                        {turno}
                      </Badge>
                    ))}
                    {turnos.length > 3 && (
                      <Badge variant="outline">+{turnos.length - 3} más</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={mostrarTurnos} onOpenChange={setMostrarTurnos}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Turnos disponibles para {subTratamientoSeleccionado?.nombre}
            </DialogTitle>
          </DialogHeader>
          {fechaSeleccionada && (
            <div className="grid gap-2">
              <h3 className="font-medium">
                {format(new Date(fechaSeleccionada), "EEEE d 'de' MMMM", { locale: es })}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {fechasDisponibles
                  .find(f => f.fecha === fechaSeleccionada)
                  ?.turnos.map((turno, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        // Aquí iría la lógica para seleccionar el turno
                        setMostrarTurnos(false)
                      }}
                    >
                      {turno}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 