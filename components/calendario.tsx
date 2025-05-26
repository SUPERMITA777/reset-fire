"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { VistaCalendario } from "@/components/vista-calendario"

export function Calendario() {
  const [vista, setVista] = useState<"dia" | "semana" | "mes">("dia")
  const [fechaActual, setFechaActual] = useState(() => new Date())

  const handleCambiarVista = (nuevaVista: "dia" | "semana" | "mes") => {
    setVista(nuevaVista)
  }

  const handleCambiarFecha = (nuevaFecha: Date) => {
    setFechaActual(nuevaFecha)
  }

  const handleDiaAnterior = () => {
    const nuevaFecha = new Date(fechaActual)
    nuevaFecha.setDate(nuevaFecha.getDate() - 1)
    setFechaActual(nuevaFecha)
  }

  const handleDiaSiguiente = () => {
    const nuevaFecha = new Date(fechaActual)
    nuevaFecha.setDate(nuevaFecha.getDate() + 1)
    setFechaActual(nuevaFecha)
  }

  const handleHoy = () => {
    setFechaActual(new Date())
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleDiaAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDiaSiguiente}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleHoy}>
            Hoy
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={vista === "dia" ? "default" : "outline"}
            onClick={() => handleCambiarVista("dia")}
          >
            Día
          </Button>
          <Button
            variant={vista === "semana" ? "default" : "outline"}
            onClick={() => handleCambiarVista("semana")}
          >
            Semana
          </Button>
          <Button
            variant={vista === "mes" ? "default" : "outline"}
            onClick={() => handleCambiarVista("mes")}
          >
            Mes
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <VistaCalendario
          vista={vista}
          fechaActual={fechaActual}
          onCambiarVista={handleCambiarVista}
          onCambiarFecha={handleCambiarFecha}
        />
      </div>
    </div>
  )
}
