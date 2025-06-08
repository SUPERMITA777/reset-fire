import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Cita } from '@/types/cita'

interface CalendarEventProps {
  cita: Cita
  onEventClick?: (cita: Cita) => void
}

export function CalendarEvent({ cita, onEventClick }: CalendarEventProps) {
  const duracion = cita.duracion || 30 // Duración por defecto de 30 minutos
  const altura = Math.max(duracion / 15, 1) // Altura mínima de 1 unidad (15 minutos)
  
  const horaInicio = parseISO(`${format(cita.fecha, 'yyyy-MM-dd')}T${cita.horaInicio}`)
  const horaFin = parseISO(`${format(cita.fecha, 'yyyy-MM-dd')}T${cita.horaFin}`)
  
  // Calcular la posición vertical basada en la hora de inicio
  const horaInicioMinutos = horaInicio.getHours() * 60 + horaInicio.getMinutes()
  const posicionInicio = (horaInicioMinutos - 8 * 60) / 15 // 8:00 es el inicio del día

  // Determinar el color del estado
  const estadoColor = {
    reservado: 'bg-blue-500',
    seniado: 'bg-yellow-500',
    confirmado: 'bg-green-500',
    cancelado: 'bg-red-500'
  }[cita.estado] || 'bg-gray-500'

  return (
    <div
      className={cn(
        "absolute left-0 right-0 mx-1 rounded-md p-1.5 text-xs cursor-pointer",
        "text-white shadow-sm hover:shadow-md transition-all duration-200",
        "border border-white/20 hover:border-white/40",
        estadoColor,
        "group"
      )}
      style={{
        top: `${posicionInicio * 4}rem`, // 4rem = altura de una celda de 15 minutos
        height: `${altura * 4}rem`,
        zIndex: 10,
        backgroundColor: cita.color || undefined
      }}
      onClick={() => onEventClick?.(cita)}
    >
      {/* Indicador de estado */}
      <div className="absolute top-0 left-0 w-1 h-full bg-white/20 rounded-l-md" />
      
      <div className="flex flex-col h-full">
        {/* Hora y nombre */}
        <div className="font-medium truncate flex items-center gap-1">
          <span className="opacity-90">
            {format(horaInicio, 'HH:mm')}
          </span>
          <span className="truncate">
            {cita.nombreCompleto}
          </span>
        </div>

        {/* Tratamiento y sub-tratamiento */}
        <div className="mt-0.5 space-y-0.5">
          {cita.nombreTratamiento && (
            <div className="truncate opacity-90">
              {cita.nombreTratamiento}
            </div>
          )}
          {cita.nombreSubTratamiento && (
            <div className="truncate opacity-75 text-[10px]">
              {cita.nombreSubTratamiento}
            </div>
          )}
        </div>

        {/* Información adicional en hover */}
        <div className="mt-auto pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-[10px] opacity-75">
            {cita.box} • {format(horaInicio, 'HH:mm')} - {format(horaFin, 'HH:mm')}
          </div>
          {cita.senia > 0 && (
            <div className="text-[10px] opacity-75">
              Seña: ${cita.senia}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 