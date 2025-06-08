"use client"

import { useEffect, useState } from "react"

export function FechaHora() {
  const [fechaHora, setFechaHora] = useState<string>("")

  useEffect(() => {
    const actualizarFechaHora = () => {
      const ahora = new Date()
      const fechaHoraArg = ahora.toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
      setFechaHora(fechaHoraArg)
    }

    actualizarFechaHora()
    const intervalo = setInterval(actualizarFechaHora, 1000)

    return () => clearInterval(intervalo)
  }, [])

  return <div className="text-right font-mono text-sm mb-2">{fechaHora}</div>
} 