"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VistaCalendario } from "@/components/vista-calendario"
import { getCitasPorFecha } from "@/lib/supabase"
import type { Cita } from "@/types/cita"

export function Calendario() {
  const [fechaActual, setFechaActual] = useState<Date>(new Date())
  const [vista, setVista] = useState<"dia" | "semana" | "mes">("dia")
  const [citas, setCitas] = useState<Cita[]>([])
  const [horaActual, setHoraActual] = useState<string>("")

  useEffect(() => {
    // Actualizar la hora cada segundo
    const timer = setInterval(() => {
      const ahora = new Date()
      setHoraActual(format(ahora, "HH:mm:ss"))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function cargarCitas() {
      try {
        console.log('Iniciando carga de citas para fecha:', format(fechaActual, 'yyyy-MM-dd'))
        const obtenerMesCompleto = vista === "mes"
        const citasDelDia = await getCitasPorFecha(fechaActual, obtenerMesCompleto)
        console.log('Citas cargadas del servidor:', citasDelDia)
        console.log('Número de citas cargadas:', citasDelDia.length)
        setCitas(citasDelDia)
      } catch (error) {
        console.error("Error al cargar citas:", error)
      }
    }
    cargarCitas()
  }, [fechaActual, vista])

  // Agregar un efecto para monitorear cambios en el estado de citas
  useEffect(() => {
    console.log('Estado de citas actualizado:', citas)
    console.log('Número de citas en el estado:', citas.length)
  }, [citas])

  const handleCambiarADia = (fecha: Date) => {
    console.log('Cambiando a vista diaria con fecha:', format(fecha, 'yyyy-MM-dd'))
    setFechaActual(fecha)
    setVista("dia")
  }

  return (
    <Card className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-300 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nuevaFecha = new Date(fechaActual)
              nuevaFecha.setDate(nuevaFecha.getDate() - 1)
              setFechaActual(nuevaFecha)
            }}
            className="text-black border-gray-300 hover:bg-gray-100"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFechaActual(new Date())}
            className="text-black border-gray-300 hover:bg-gray-100"
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nuevaFecha = new Date(fechaActual)
              nuevaFecha.setDate(nuevaFecha.getDate() + 1)
              setFechaActual(nuevaFecha)
            }}
            className="text-black border-gray-300 hover:bg-gray-100"
          >
            Siguiente
          </Button>
          <span className="ml-4 font-medium text-black">
            {format(fechaActual, "MMMM yyyy", { locale: es })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-black">
            <Clock className="h-4 w-4" />
            <span>{horaActual}</span>
            <span>{format(new Date(), "dd/MM/yyyy")}</span>
          </div>
        </div>
      </div>

      <Tabs value={vista} onValueChange={(v) => setVista(v as typeof vista)} className="flex-1">
        <div className="flex items-center justify-end border-b border-gray-300 p-4">
          <TabsList className="bg-white border border-gray-300">
            <TabsTrigger 
              value="dia" 
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-black text-black"
            >
              Día
            </TabsTrigger>
            <TabsTrigger 
              value="semana"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-black text-black"
            >
              Semana
            </TabsTrigger>
            <TabsTrigger 
              value="mes"
              className="data-[state=active]:bg-gray-100 data-[state=active]:text-black text-black"
            >
              Mes
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-hidden">
          <TabsContent value="dia" className="h-full m-0">
            <VistaCalendario
              vista="dia"
              fechaActual={fechaActual}
              citas={citas}
              onCambiarADia={handleCambiarADia}
            />
          </TabsContent>
          <TabsContent value="semana" className="h-full m-0">
            <VistaCalendario
              vista="semana"
              fechaActual={fechaActual}
              citas={citas}
              onCambiarADia={handleCambiarADia}
            />
          </TabsContent>
          <TabsContent value="mes" className="h-full m-0">
            <VistaCalendario
              vista="mes"
              fechaActual={fechaActual}
              citas={citas}
              onCambiarADia={handleCambiarADia}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}
