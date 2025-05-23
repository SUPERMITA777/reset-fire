"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock } from "lucide-react"

export function RelojFecha() {
  const [fechaHora, setFechaHora] = useState<string>("")

  useEffect(() => {
    // Función para actualizar la fecha y hora
    const actualizarFechaHora = () => {
      const ahora = new Date()
      const formateador = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      
      setFechaHora(formateador.format(ahora))
    }

    // Actualizar inmediatamente
    actualizarFechaHora()

    // Configurar el intervalo para actualizar cada segundo
    const timer = setInterval(actualizarFechaHora, 1000)

    // Limpiar el intervalo al desmontar
    return () => clearInterval(timer)
  }, [])

  // Si no hay fecha (durante la hidratación inicial), mostrar un espacio en blanco
  if (!fechaHora) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>&nbsp;</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>{fechaHora}</span>
    </div>
  )
} 