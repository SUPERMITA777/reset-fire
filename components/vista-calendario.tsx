"use client"

import { useState } from "react"
import { addDays, format, getDay, getDaysInMonth, isSameDay, startOfMonth, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { formatInTimeZone, toZonedTime } from "date-fns-tz"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DetalleCita } from "@/components/detalle-cita"
import { FormularioCita } from "@/components/formulario-cita"
import type { Cita } from "@/types/cita"

interface VistaCalendarioProps {
  vista: "dia" | "semana" | "mes"
  fechaActual: Date
  citas: Cita[]
  onCambiarADia?: (fecha: Date) => void
}

export function VistaCalendario({ vista, fechaActual, citas, onCambiarADia }: VistaCalendarioProps) {
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null)
  const [editarCitaDialog, setEditarCitaDialog] = useState<boolean>(false)
  const [nuevaCita, setNuevaCita] = useState<{ abierto: boolean; fecha: Date | null; horaInicio: string | null }>({
    abierto: false,
    fecha: null,
    horaInicio: null,
  })

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  const horasDia = Array.from({ length: 14 }, (_, i) => i + 8) // 8am a 9pm

  // Función auxiliar para convertir hora a zona horaria de Argentina
  const convertirHoraArgentina = (hora: string) => {
    try {
      const [horas, minutos] = hora.split(":").map(Number)
      const fecha = new Date()
      fecha.setHours(horas, minutos, 0, 0)
      return formatInTimeZone(fecha, "America/Argentina/Buenos_Aires", "HH:mm")
    } catch {
      return hora
    }
  }

  // Función auxiliar para verificar si una hora está dentro del horario de atención
  const esHoraValida = (hora: number) => {
    return hora >= 8 && hora <= 21
  }

  // Generar opciones de horas detalladas (cada 15 minutos) dentro del horario de atención
  const generarHorasDetalladas = () => {
    const horas = []
    for (let hora = 8; hora <= 21; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 15) {
        horas.push({
          hora,
          minuto,
          horaStr: `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`
        })
      }
    }
    return horas
  }

  // Generar días del mes para la vista mensual
  const generarDiasMes = () => {
    const primerDia = startOfMonth(fechaActual)
    const diasEnMes = getDaysInMonth(fechaActual)
    const diaSemanaInicio = getDay(primerDia) === 0 ? 6 : getDay(primerDia) - 1 // Ajustar para que la semana comience el lunes

    const dias = []

    // Días del mes anterior para completar la primera semana
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push({ fecha: addDays(primerDia, i - diaSemanaInicio), esDelMesActual: false })
    }

    // Días del mes actual
    for (let i = 0; i < diasEnMes; i++) {
      dias.push({ fecha: addDays(primerDia, i), esDelMesActual: true })
    }

    // Días del mes siguiente para completar la última semana
    const diasRestantes = 7 - (dias.length % 7)
    if (diasRestantes < 7) {
      for (let i = 1; i <= diasRestantes; i++) {
        dias.push({ fecha: addDays(primerDia, diasEnMes - 1 + i), esDelMesActual: false })
      }
    }

    return dias
  }

  // Generar días de la semana para la vista semanal
  const generarDiasSemana = () => {
    const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i))
  }

  // Filtrar citas para un día específico
  const citasDelDia = (dia: Date) => {
    console.log('Filtrando citas para día:', format(dia, 'yyyy-MM-dd'))
    console.log('Total de citas disponibles:', citas.length)
    const citasFiltradas = citas.filter((cita) => {
      if (!cita.fecha) {
        console.log('Cita sin fecha:', cita)
        return false
      }
      const fechaCita = toZonedTime(new Date(cita.fecha), "America/Argentina/Buenos_Aires")
      const esMismoDia = !isNaN(fechaCita.getTime()) && isSameDay(fechaCita, dia)
      if (esMismoDia) {
        console.log('Cita encontrada para el día:', cita)
      }
      return esMismoDia
    })
    console.log('Citas filtradas para el día:', citasFiltradas.length)
    return citasFiltradas
  }

  // Verificar si hay una cita en una hora específica
  const citaEnHora = (dia: Date, hora: number, box?: string) => {
    if (!esHoraValida(hora)) {
      console.log('Hora no válida:', hora)
      return []
    }
    
    console.log('Buscando citas para:', {
      dia: format(dia, 'yyyy-MM-dd'),
      hora,
      box
    })
    
    const citasFiltradas = citas.filter((cita) => {
      if (!cita.fecha || !cita.horaInicio || !cita.horaFin) {
        console.log('Cita con datos incompletos:', cita)
        return false
      }

      const fechaCita = toZonedTime(new Date(cita.fecha), "America/Argentina/Buenos_Aires")
      if (isNaN(fechaCita.getTime()) || !isSameDay(fechaCita, dia)) {
        console.log('Cita no corresponde al día:', cita)
        return false
      }

      const [horaInicio] = cita.horaInicio.split(":").map(Number)
      const [horaFin] = cita.horaFin.split(":").map(Number)

      // Si se especifica un box, solo mostrar citas de ese box
      if (box && cita.box !== box) {
        console.log('Cita no corresponde al box:', cita)
        return false
      }

      const esHoraValida = !isNaN(horaInicio) && !isNaN(horaFin) && hora >= horaInicio && hora < horaFin
      if (esHoraValida) {
        console.log('Cita encontrada en la hora:', cita)
      }
      return esHoraValida
    })
    
    console.log('Citas encontradas para la hora:', citasFiltradas.length)
    return citasFiltradas
  }

  const abrirDetalleCita = (cita: Cita) => {
    setCitaSeleccionada(cita)
    setEditarCitaDialog(true)
  }

  const cerrarDetalleCita = () => {
    setCitaSeleccionada(null)
    setEditarCitaDialog(false)
  }

  const handleGuardarCitaEditada = (citaEditada: Cita) => {
    cerrarDetalleCita()
  }

  const abrirNuevaCita = (fecha: Date, hora?: number, minuto: number = 0) => {
    // En vista mes o semana, cambiar a vista día
    if ((vista === "mes" || vista === "semana") && onCambiarADia) {
      console.log('Cambiando a vista diaria para fecha:', format(fecha, 'yyyy-MM-dd'))
      onCambiarADia(fecha)
      // Solo cambiar a vista día, no abrir el formulario
      return
    }

    // Solo en vista día, abrir el formulario de nueva cita
    const horaInicio = hora !== undefined ? `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}` : null
    setNuevaCita({
      abierto: true,
      fecha: new Date(fecha),
      horaInicio: horaInicio,
    })
  }

  const cerrarNuevaCita = () => {
    setNuevaCita({
      abierto: false,
      fecha: null,
      horaInicio: null,
    })
  }

  const handleGuardarCita = () => {
    // Cerrar el diálogo después de guardar
    cerrarNuevaCita()
  }

  // Función para calcular la posición y altura de una cita
  const calcularEstiloCita = (cita: Cita): React.CSSProperties => {
    if (!cita.horaInicio || !cita.horaFin) return {}

    const [horaInicio, minutoInicio] = cita.horaInicio.split(":").map(Number)
    const [horaFin, minutoFin] = cita.horaFin.split(":").map(Number)

    const inicioMinutos = horaInicio * 60 + minutoInicio
    const finMinutos = horaFin * 60 + minutoFin
    const duracionMinutos = finMinutos - inicioMinutos

    // Calcular posición (top) y altura en píxeles
    const top = ((inicioMinutos - 8 * 60) / 60) * 60 // 60px por hora
    const height = (duracionMinutos / 60) * 60 // 60px por hora

    return {
      position: "absolute" as const,
      top: `${top}px`,
      height: `${height}px`,
      width: "calc(100% - 8px)",
      left: "4px",
      backgroundColor: cita.color,
      borderRadius: "4px",
      padding: "4px",
      fontSize: "0.75rem",
      color: "white",
      overflow: "hidden",
      zIndex: 1,
    }
  }

  // Renderizar vista mensual
  if (vista === "mes") {
    const dias = generarDiasMes()

    return (
      <>
        <div className="grid grid-cols-7 border-b border-gray-300">
          {diasSemana.map((dia) => (
            <div key={dia} className="p-2 text-center font-medium text-black">
              {dia}
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-7 auto-rows-fr">
          {dias.map((dia, index) => {
            const citasDia = citasDelDia(dia.fecha)
            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] border-b border-r border-gray-300 p-1 cursor-pointer hover:bg-gray-50 transition-colors",
                  !dia.esDelMesActual && "bg-gray-50 text-gray-400",
                )}
                onClick={() => {
                  console.log('Clic en día:', format(dia.fecha, 'yyyy-MM-dd'))
                  abrirNuevaCita(dia.fecha)
                }}
                role="button"
                tabIndex={0}
              >
                <div className="mb-1 text-right text-black">{format(dia.fecha, "d")}</div>
                <div className="space-y-1">
                  {citasDia.map((cita) => (
                    <button
                      key={cita.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        abrirDetalleCita(cita)
                      }}
                      className="w-full truncate rounded px-2 py-1 text-left text-xs text-white hover:opacity-90"
                      style={{ backgroundColor: cita.color }}
                    >
                      {cita.horaInicio ? (() => {
                        try {
                          const [hora, minuto] = cita.horaInicio.split(":")
                          const fechaHora = new Date(2000, 0, 1, parseInt(hora), parseInt(minuto))
                          return !isNaN(fechaHora.getTime()) ? format(fechaHora, "HH:mm") : cita.horaInicio
                        } catch {
                          return cita.horaInicio
                        }
                      })() : null}{" "}
                      {cita.nombreTratamiento || cita.nombreSubTratamiento || "Sin tratamiento"} - {cita.nombreCompleto}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <Dialog open={!!citaSeleccionada} onOpenChange={cerrarDetalleCita}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles de la cita</DialogTitle>
              <DialogDescription>
                Información detallada de la cita seleccionada
              </DialogDescription>
            </DialogHeader>
            {citaSeleccionada && <DetalleCita cita={citaSeleccionada} />}
          </DialogContent>
        </Dialog>
        <Dialog open={editarCitaDialog} onOpenChange={setEditarCitaDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Editar Cita</DialogTitle>
              <DialogDescription>
                Modifica los detalles de la cita existente
              </DialogDescription>
            </DialogHeader>
            <FormularioCita
              fechaInicial={citaSeleccionada?.fecha}
              horaInicialInicio={citaSeleccionada?.horaInicio}
              horaInicialFin={citaSeleccionada?.horaFin}
              tratamientoInicial={citaSeleccionada?.tratamiento}
              subTratamientoInicial={citaSeleccionada?.subTratamiento}
              onSuccess={() => handleGuardarCitaEditada(citaSeleccionada!)}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={nuevaCita.abierto} onOpenChange={cerrarNuevaCita}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Agregar nueva cita</DialogTitle>
              <DialogDescription>
                Complete los datos para crear una nueva cita
              </DialogDescription>
            </DialogHeader>
            <FormularioCita 
              fechaInicial={nuevaCita.fecha} 
              horaInicialInicio={nuevaCita.horaInicio} 
              onSuccess={handleGuardarCita}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Renderizar vista semanal
  if (vista === "semana") {
    const diasSemana = generarDiasSemana()

    return (
      <>
        <div className="grid grid-cols-8 border-b border-gray-300">
          <div className="p-2 text-center font-medium border-r border-gray-300"></div>
          {diasSemana.map((dia) => (
            <div
              key={dia.toString()}
              className="p-2 text-center font-medium cursor-pointer hover:bg-gray-50 transition-colors border-r border-gray-300"
              onClick={() => {
                console.log('Clic en día de la semana:', format(dia, 'yyyy-MM-dd'))
                abrirNuevaCita(dia)
              }}
            >
              <div className="text-black">{format(dia, "EEE", { locale: es })}</div>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full mx-auto",
                  isSameDay(dia, new Date()) ? "bg-blue-500 text-white" : "text-black"
                )}
              >
                {format(dia, "d")}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {horasDia.map((hora) => {
            const horaStr = `${hora.toString().padStart(2, "0")}:00`
            const citasHora = citaEnHora(fechaActual, hora)
            return (
              <div key={horaStr} className="grid grid-cols-8 border-b border-gray-300">
                <div className="border-r border-gray-300 p-2 text-right text-sm text-black">{horaStr}</div>
                {diasSemana.map((dia) => {
                  const citasBox = citasHora.filter(cita => cita.box === `Box ${dia.getDate()}`)
                  return (
                    <div
                      key={dia.toString()}
                      className="border-r border-gray-300 p-1 min-h-[60px] cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => abrirNuevaCita(dia, hora)}
                      role="button"
                      tabIndex={0}
                    >
                      {citasBox.map((cita) => (
                        <button
                          key={cita.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirDetalleCita(cita)
                          }}
                          className="w-full truncate rounded px-2 py-1 text-left text-xs text-white hover:opacity-90"
                          style={{ backgroundColor: cita.color }}
                        >
                          {cita.horaInicio ? convertirHoraArgentina(cita.horaInicio) : null}{" "}
                          {cita.nombreTratamiento || cita.nombreSubTratamiento || "Sin tratamiento"} - {cita.nombreCompleto}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        <Dialog open={!!citaSeleccionada} onOpenChange={cerrarDetalleCita}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles de la cita</DialogTitle>
              <DialogDescription>
                Información detallada de la cita seleccionada
              </DialogDescription>
            </DialogHeader>
            {citaSeleccionada && <DetalleCita cita={citaSeleccionada} />}
          </DialogContent>
        </Dialog>
        <Dialog open={editarCitaDialog} onOpenChange={setEditarCitaDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Editar Cita</DialogTitle>
              <DialogDescription>
                Modifica los detalles de la cita existente
              </DialogDescription>
            </DialogHeader>
            <FormularioCita
              fechaInicial={citaSeleccionada?.fecha}
              horaInicialInicio={citaSeleccionada?.horaInicio}
              horaInicialFin={citaSeleccionada?.horaFin}
              tratamientoInicial={citaSeleccionada?.tratamiento}
              subTratamientoInicial={citaSeleccionada?.subTratamiento}
              onSuccess={() => handleGuardarCitaEditada(citaSeleccionada!)}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={nuevaCita.abierto} onOpenChange={cerrarNuevaCita}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Agregar nueva cita</DialogTitle>
              <DialogDescription>
                Complete los datos para crear una nueva cita
              </DialogDescription>
            </DialogHeader>
            <FormularioCita 
              fechaInicial={nuevaCita.fecha} 
              horaInicialInicio={nuevaCita.horaInicio} 
              onSuccess={handleGuardarCita}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Renderizar vista diaria
  if (vista === "dia") {
    const fechaArgentina = toZonedTime(fechaActual, "America/Argentina/Buenos_Aires")
    const boxes = Array.from({ length: 8 }, (_, i) => `Box ${i + 1}`)
    const horasDetalladas = generarHorasDetalladas()
    const citasDelDiaActual = citasDelDia(fechaActual)

    return (
      <>
        <div className="border-b border-gray-300 p-4 text-center">
          <div className="font-medium text-black">
            {format(fechaArgentina, "EEEE d 'de' MMMM", { locale: es })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {horasDetalladas.map(({ hora, minuto, horaStr }) => (
            <div key={horaStr} className="grid grid-cols-9 border-b border-gray-300">
              <div className={cn(
                "w-16 border-r border-gray-300 p-2 text-right text-sm",
                minuto === 0 ? "text-black font-medium" : "text-gray-500"
              )}>
                {horaStr}
              </div>
              {boxes.map((box) => {
                const citasBox = citasDelDiaActual.filter(cita => {
                  if (!cita.horaInicio || !cita.horaFin || cita.box !== box) return false

                  const [horaInicio, minutoInicio] = cita.horaInicio.split(":").map(Number)
                  const [horaFin, minutoFin] = cita.horaFin.split(":").map(Number)

                  const tiempoActual = hora * 60 + minuto
                  const tiempoInicio = horaInicio * 60 + minutoInicio
                  const tiempoFin = horaFin * 60 + minutoFin

                  return tiempoActual >= tiempoInicio && tiempoActual < tiempoFin
                })

                return (
                  <div
                    key={box}
                    className={cn(
                      "border-r border-gray-300 p-1 cursor-pointer hover:bg-gray-50 transition-colors relative",
                      minuto === 0 ? "min-h-[60px]" : "min-h-[30px]"
                    )}
                    onClick={() => abrirNuevaCita(fechaActual, hora, minuto)}
                    role="button"
                    tabIndex={0}
                  >
                    {minuto === 0 && (
                      <div className="text-xs text-gray-500 mb-1">{box}</div>
                    )}
                    {citasBox.map((cita) => (
                      <button
                        key={cita.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCitaSeleccionada(cita)
                          setEditarCitaDialog(true)
                        }}
                        style={calcularEstiloCita(cita)}
                        className="hover:opacity-90 transition-opacity text-left p-2 w-full"
                      >
                        <div className="font-medium truncate mb-1 text-white">
                          {cita.nombreTratamiento || cita.nombreSubTratamiento || "Sin tratamiento"} - {cita.nombreCompleto}
                        </div>
                        <div className="text-xs truncate text-white">
                          {cita.horaInicio ? convertirHoraArgentina(cita.horaInicio) : null} - {cita.horaFin ? convertirHoraArgentina(cita.horaFin) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <Dialog open={editarCitaDialog} onOpenChange={setEditarCitaDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Editar Cita</DialogTitle>
              <DialogDescription>
                Modifica los detalles de la cita existente
              </DialogDescription>
            </DialogHeader>
            {citaSeleccionada && (
              <FormularioCita
                citaExistente={citaSeleccionada}
                fechaInicial={citaSeleccionada.fecha}
                horaInicialInicio={citaSeleccionada.horaInicio}
                horaInicialFin={citaSeleccionada.horaFin}
                tratamientoInicial={citaSeleccionada.tratamiento}
                subTratamientoInicial={citaSeleccionada.subTratamiento}
                onSuccess={() => {
                  setEditarCitaDialog(false)
                  setCitaSeleccionada(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={nuevaCita.abierto} onOpenChange={cerrarNuevaCita}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Agregar nueva cita</DialogTitle>
              <DialogDescription>
                Complete los datos para crear una nueva cita
              </DialogDescription>
            </DialogHeader>
            <FormularioCita 
              fechaInicial={nuevaCita.fecha} 
              horaInicialInicio={nuevaCita.horaInicio} 
              onSuccess={handleGuardarCita}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return null
}
