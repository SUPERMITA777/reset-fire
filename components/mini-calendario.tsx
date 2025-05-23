"use client"

import type * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface MiniCalendarioProps {
  fechaSeleccionada: Date | undefined
  onSeleccionarFecha: (fecha: Date | undefined) => void
}

export function MiniCalendario({ fechaSeleccionada, onSeleccionarFecha }: MiniCalendarioProps) {
  return (
    <Calendar
      mode="single"
      selected={fechaSeleccionada}
      onSelect={onSeleccionarFecha}
      className="rounded-md border"
    />
  )
}
