"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VistaSelectorProps {
  vista: "dia" | "semana" | "mes"
  setVista: (vista: "dia" | "semana" | "mes") => void
}

export function VistaSelector({ vista, setVista }: VistaSelectorProps) {
  return (
    <div className="flex rounded-md border">
      <Button
        variant="ghost"
        size="sm"
        className={cn("rounded-none rounded-l-md", vista === "dia" && "bg-muted")}
        onClick={() => setVista("dia")}
      >
        Día
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn("rounded-none border-x", vista === "semana" && "bg-muted")}
        onClick={() => setVista("semana")}
      >
        Semana
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn("rounded-none rounded-r-md", vista === "mes" && "bg-muted")}
        onClick={() => setVista("mes")}
      >
        Mes
      </Button>
    </div>
  )
}
