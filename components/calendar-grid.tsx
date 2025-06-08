"use client"

import React, { useState, useEffect } from "react"
import { format, addDays, setHours, setMinutes, isBefore, isAfter, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FormularioCita } from "@/components/formulario-cita"
import { supabase } from "@/lib/supabase"

interface CalendarGridProps {
  fecha: Date
  citas: any[]
  fechasDisponibles: any[]
  tratamientos: any[]
  subTratamientos: any[]
  onCrearDisponibilidad: (data: any) => Promise<void>
  onCrearCita: (data: any) => Promise<void>
  onEditarCita: (cita: any) => void
  onFechaChange?: (fecha: Date) => void
}

interface Slot {
  hora: number
  minutos: number
  disponible: boolean
  box?: number
}

export function CalendarGrid({
  fecha,
  citas,
  fechasDisponibles,
  tratamientos,
  subTratamientos,
  onCrearDisponibilidad,
  onCrearCita,
  onEditarCita,
  onFechaChange
}: CalendarGridProps) {
  const [fechaActual, setFechaActual] = useState(fecha)
  const [showModalCita, setShowModalCita] = useState(false)
  const [showModalDisponibilidad, setShowModalDisponibilidad] = useState(false)
  const [slotSeleccionado, setSlotSeleccionado] = useState<Slot | null>(null)
  const [boxSeleccionado, setBoxSeleccionado] = useState<number | null>(null)
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<number | null>(null)
  const [slotsSeleccionados, setSlotsSeleccionados] = useState<Set<string>>(new Set())
  const [estaSeleccionando, setEstaSeleccionando] = useState(false)
  const [slotInicio, setSlotInicio] = useState<string | null>(null)
  const [slotsDisponibles, setSlotsDisponibles] = useState<Set<string>>(new Set())

  // Generar slots de tiempo
  const slots: Slot[] = []
  for (let hora = 8; hora < 20; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      slots.push({
        hora,
        minutos: minuto,
        disponible: true
      })
    }
  }

  // Verificar disponibilidad de slots
  useEffect(() => {
    const slotsDisponibles = new Set<string>()
    fechasDisponibles.forEach(disponibilidad => {
      const [horaInicio, minutoInicio] = disponibilidad.hora_inicio.split(':').map(Number)
      const [horaFin, minutoFin] = disponibilidad.hora_fin.split(':').map(Number)
      
      const inicio = horaInicio * 60 + minutoInicio
      const fin = horaFin * 60 + minutoFin
      
      slots.forEach(slot => {
        const slotMinutos = slot.hora * 60 + slot.minutos
        if (slotMinutos >= inicio && slotMinutos < fin) {
          disponibilidad.boxes_disponibles.forEach((box: number) => {
            slotsDisponibles.add(`${slot.hora}:${slot.minutos}-${box}`)
          })
        }
      })
    })

    // Marcar slots como no disponibles si ya tienen citas
    citas.forEach(cita => {
      const [horaInicio, minutoInicio] = cita.hora_inicio.split(':').map(Number)
      const [horaFin, minutoFin] = cita.hora_fin.split(':').map(Number)
      
      const inicio = horaInicio * 60 + minutoInicio
      const fin = horaFin * 60 + minutoFin
      
      slots.forEach(slot => {
        const slotMinutos = slot.hora * 60 + slot.minutos
        if (slotMinutos >= inicio && slotMinutos < fin) {
          slotsDisponibles.delete(`${slot.hora}:${slot.minutos}-${cita.box_id}`)
        }
      })
    })

    // Actualizar estado de slots
    setSlotsDisponibles(slotsDisponibles)
  }, [fecha, fechasDisponibles, citas])

  // Manejadores de eventos
  const handleSlotClick = (slot: Slot, box: number) => {
    if (!slotsDisponibles.has(`${slot.hora}:${slot.minutos}-${box}`)) return
    
    setSlotSeleccionado(slot)
    setBoxSeleccionado(box)
    setShowModalCita(true)
  }

  const irDiaAnterior = () => {
    const nuevaFecha = addDays(fechaActual, -1)
    setFechaActual(nuevaFecha)
    if (onFechaChange) onFechaChange(nuevaFecha)
  }

  const irDiaSiguiente = () => {
    const nuevaFecha = addDays(fechaActual, 1)
    setFechaActual(nuevaFecha)
    if (onFechaChange) onFechaChange(nuevaFecha)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado con fecha y navegación */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={irDiaAnterior}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">
            {format(fechaActual, "EEEE d 'de' MMMM", { locale: es })}
          </span>
        </div>
        <Button variant="outline" size="icon" onClick={irDiaSiguiente}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid de slots */}
      <div className="grid grid-cols-8 gap-1 flex-1">
        {/* Encabezados de columnas */}
        <div className="col-span-1"></div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(box => (
          <div key={box} className="text-center font-medium">
            Box {box}
          </div>
        ))}

        {/* Slots de tiempo */}
        {slots.map((slot, index) => (
          <React.Fragment key={`${slot.hora}:${slot.minutos}`}>
            <div className="flex items-center justify-end pr-2 text-sm text-muted-foreground">
              {format(setHours(setMinutes(new Date(), slot.minutos), slot.hora), 'HH:mm')}
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(box => {
              const slotKey = `${slot.hora}:${slot.minutos}-${box}`
              const disponible = slotsDisponibles.has(slotKey)
              return (
                <button
                  key={slotKey}
                  className={`h-12 rounded border ${
                    disponible
                      ? 'bg-green-50 hover:bg-green-100 border-green-200'
                      : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                  }`}
                  onClick={() => handleSlotClick(slot, box)}
                  disabled={!disponible}
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Modal de nueva cita */}
      <Dialog open={showModalCita} onOpenChange={setShowModalCita}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nueva Cita</DialogTitle>
            <DialogDescription>
              Complete los datos del cliente para agendar la cita
            </DialogDescription>
          </DialogHeader>
          {slotSeleccionado && (
            <FormularioCita
              fechaInicial={fechaActual}
              horaInicialInicio={`${slotSeleccionado.hora}:${slotSeleccionado.minutos.toString().padStart(2, '0')}`}
              boxInicial={boxSeleccionado || 1}
              onSuccess={() => {
                setShowModalCita(false)
                setSlotSeleccionado(null)
                setBoxSeleccionado(null)
                setSubTratamientoSeleccionado(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 