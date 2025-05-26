"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, isSameMonth, getDay, getDaysInMonth, startOfDay, endOfDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormularioCita } from "@/components/formulario-cita"
import type { Cita } from "@/types/cita"
import { getCitasPorFecha } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface VistaCalendarioProps {
  vista: "dia" | "semana" | "mes"
  fechaActual: Date
  onCambiarVista?: (vista: "dia" | "semana" | "mes") => void
  onCambiarFecha?: (fecha: Date) => void
}

export function VistaCalendario({ vista, fechaActual, onCambiarVista, onCambiarFecha }: VistaCalendarioProps) {
  const [citasAgrupadas, setCitasAgrupadas] = useState<{ [key: string]: Cita[] }>({})
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar las citas
  const cargarCitas = async (fecha: Date) => {
    try {
      setLoading(true)
      setError(null)
      
      // Determinar si debemos obtener el mes completo basado en la vista
      const obtenerMesCompleto = vista === 'mes' || vista === 'semana'
      
      console.log('Cargando citas:', {
        fecha: fecha.toISOString(),
        vista,
        obtenerMesCompleto
      })

      const citas = await getCitasPorFecha(fecha, obtenerMesCompleto)
      setCitasAgrupadas(citas)
    } catch (error) {
      console.error('Error al cargar citas:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  // Cargar citas cuando cambia la vista o la fecha
  useEffect(() => {
    cargarCitas(fechaActual)
  }, [vista, fechaActual])

  // Función auxiliar para filtrar citas por fecha
  const filtrarCitasPorFecha = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd')
    return citasAgrupadas[fechaStr] || []
  }

  // Función para manejar el clic en una cita
  const handleCitaClick = (cita: Cita) => {
    setCitaSeleccionada(cita)
    setMostrarFormulario(true)
  }

  // Función para manejar el guardado de una cita
  const handleGuardarCita = async () => {
    setMostrarFormulario(false)
    setCitaSeleccionada(null)
    // Recargar las citas después de guardar
    await cargarCitas(fechaActual)
  }

  // Renderizar vista diaria
  const renderVistaDia = () => {
    const citasDelDia = filtrarCitasPorFecha(fechaActual)
    const boxes = Array.from({ length: 8 }, (_, i) => i + 1)

    // Función para obtener las citas de un box específico
    const getCitasPorBox = (boxId: number) => {
      return citasDelDia.filter(cita => cita.box_id === boxId)
    }

    // Función para convertir hora string a minutos para ordenar
    const horaAMinutos = (hora: string) => {
      const [horas, minutos] = hora.split(':').map(Number)
      return horas * 60 + minutos
    }

    // Ordenar las citas por hora de inicio
    const ordenarCitasPorHora = (citas: Cita[]) => {
      return [...citas].sort((a, b) => horaAMinutos(a.horaInicio) - horaAMinutos(b.horaInicio))
    }

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            {format(fechaActual, "EEEE d 'de' MMMM", { locale: es })}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8 h-full">
            {boxes.map(boxId => {
              const citasBox = ordenarCitasPorHora(getCitasPorBox(boxId))
              
              return (
                <div key={boxId} className="border-r last:border-r-0 flex flex-col">
                  <div className="p-2 bg-gray-50 border-b text-center font-medium">
                    BOX {boxId}
                  </div>
                  <div className="flex-1 p-2 space-y-2">
                    {citasBox.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">
                        Sin citas
                      </div>
                    ) : (
                      citasBox.map(cita => (
                        <button
                          key={cita.id}
                          onClick={() => handleCitaClick(cita)}
                          className={cn(
                            "w-full p-2 rounded text-left transition-colors",
                            "hover:bg-opacity-90",
                            "border border-transparent hover:border-gray-200"
                          )}
                          style={{ backgroundColor: cita.color || '#808080' }}
                        >
                          <div className="text-white">
                            <div className="font-medium text-sm">
                              {cita.horaInicio} - {cita.horaFin}
                            </div>
                            <div className="text-xs opacity-90">
                              {cita.nombreTratamiento || cita.nombreSubTratamiento}
                            </div>
                            <div className="text-xs font-medium mt-1">
                              {cita.nombreCompleto}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Renderizar vista semanal
  const renderVistaSemana = () => {
    const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 })
    const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i))

    return (
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-7 border-b">
          {diasSemana.map(dia => (
            <div key={dia.toISOString()} className="p-2 text-center">
              <div className="font-medium">
                {format(dia, "EEE", { locale: es })}
              </div>
              <div className={cn(
                "text-sm",
                isSameDay(dia, fechaActual) && "bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mx-auto"
              )}>
                {format(dia, "d")}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 h-full">
            {diasSemana.map(dia => {
              const citasDelDia = filtrarCitasPorFecha(dia)

              return (
                <div key={dia.toISOString()} className="border-r last:border-r-0 p-2">
                  <div className="space-y-1">
                    {citasDelDia.map(cita => (
                      <button
                        key={cita.id}
                        onClick={() => handleCitaClick(cita)}
                        className={cn(
                          "w-full p-2 rounded text-left text-sm transition-colors",
                          "hover:bg-opacity-90",
                          "border border-transparent hover:border-gray-200"
                        )}
                        style={{ backgroundColor: cita.color || '#808080' }}
                      >
                        <div className="text-white">
                          <div className="font-medium truncate">
                            {cita.horaInicio} - {cita.nombreCompleto}
                          </div>
                          <div className="text-xs opacity-90 truncate">
                            {cita.nombreTratamiento || cita.nombreSubTratamiento}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Renderizar vista mensual
  const renderVistaMes = () => {
    const inicioMes = startOfMonth(fechaActual)
    const finMes = endOfMonth(fechaActual)
    const diasEnMes = getDaysInMonth(fechaActual)
    const diaSemanaInicio = getDay(inicioMes) === 0 ? 6 : getDay(inicioMes) - 1

    const dias: { fecha: Date; esDelMesActual: boolean }[] = []
    // Días del mes anterior
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push({ fecha: addDays(inicioMes, i - diaSemanaInicio), esDelMesActual: false })
    }
    // Días del mes actual
    for (let i = 0; i < diasEnMes; i++) {
      dias.push({ fecha: addDays(inicioMes, i), esDelMesActual: true })
    }
    // Días del mes siguiente
    const diasRestantes = 7 - (dias.length % 7)
    if (diasRestantes < 7) {
      for (let i = 1; i <= diasRestantes; i++) {
        dias.push({ fecha: addDays(finMes, i), esDelMesActual: false })
      }
    }

    return (
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-7 border-b">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(dia => (
            <div key={dia} className="p-2 text-center font-medium">
              {dia}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 auto-rows-fr">
            {dias.map(({ fecha, esDelMesActual }, index) => {
              const citasDelDia = filtrarCitasPorFecha(fecha)

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[100px] border-b border-r p-1",
                    !esDelMesActual && "bg-gray-50 text-gray-400"
                  )}
                >
                  <div className="text-right mb-1">
                    {format(fecha, "d")}
                  </div>
                  <div className="space-y-1">
                    {citasDelDia.map(cita => (
                      <button
                        key={cita.id}
                        onClick={() => handleCitaClick(cita)}
                        className={cn(
                          "w-full p-1 rounded text-left text-xs transition-colors",
                          "hover:bg-opacity-90",
                          "border border-transparent hover:border-gray-200"
                        )}
                        style={{ backgroundColor: cita.color || '#808080' }}
                      >
                        <div className="text-white truncate">
                          <div className="font-medium">
                            {cita.horaInicio} - {cita.nombreCompleto}
                          </div>
                          <div className="opacity-90 truncate">
                            {cita.nombreTratamiento || cita.nombreSubTratamiento}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full border rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 border-b">
            {error}
          </div>
        )}

        {vista === "dia" && renderVistaDia()}
        {vista === "semana" && renderVistaSemana()}
        {vista === "mes" && renderVistaMes()}
      </div>

      <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {citaSeleccionada ? "Editar Cita" : "Nueva Cita"}
            </DialogTitle>
          </DialogHeader>
          <FormularioCita
            citaExistente={citaSeleccionada || undefined}
            fechaInicial={citaSeleccionada?.fecha}
            horaInicialInicio={citaSeleccionada?.horaInicio}
            horaInicialFin={citaSeleccionada?.horaFin}
            tratamientoInicial={citaSeleccionada?.tratamiento}
            subTratamientoInicial={citaSeleccionada?.subTratamiento}
            onSuccess={handleGuardarCita}
          />
        </DialogContent>
      </Dialog>
    </>
  )
} 