import { useState, useRef, useEffect } from 'react'
import { format, parseISO, addMinutes, isSameDay, subDays, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Cita, FechaDisponible, SubTratamiento } from '@/types/cita'
import { DisponibilidadModal } from "@/components/modals/disponibilidad-modal"

interface TimeSlot {
  hora: string
  minutos: number
}

interface Tratamiento { id: string; nombre: string; sub_tratamientos: SubTratamiento[]; }

interface FormData {
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  boxes_disponibles: number[]
  cantidad_clientes?: number
}

interface CalendarGridProps {
  fecha: Date
  citas: Cita[]
  fechasDisponibles: FechaDisponible[]
  tratamientos: Tratamiento[]
  subTratamientos: SubTratamiento[]
  onCrearDisponibilidad: (data: {
    tratamiento_id: string
    fecha_inicio: string
    fecha_fin: string
    hora_inicio: string
    hora_fin: string
    boxes_disponibles: number[]
  }) => Promise<void>
  onCrearCita: (data: {
    fecha: Date
    horaInicio: string
    horaFin: string
    boxes: number[]
    subTratamientoId: number
  }) => Promise<void>
  onEditarCita: (cita: Cita) => Promise<void>
  onFechaChange: (fecha: Date) => void
}

const HORAS_INICIO = 8
const HORAS_FIN = 21
const INTERVALO_MINUTOS = 15
const NUM_BOXES = 8
const ALTURA_CELDA = 'h-8'

interface CalendarEventProps { cita: Cita; onEventClick: (cita: Cita) => void; }

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
  const [slotsSeleccionados, setSlotsSeleccionados] = useState<Set<string>>(new Set())
  const [estaSeleccionando, setEstaSeleccionando] = useState(false)
  const [slotInicio, setSlotInicio] = useState<string | null>(null)
  const [showModalDisponibilidad, setShowModalDisponibilidad] = useState(false)
  const [showModalCita, setShowModalCita] = useState(false)
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<string | null>(null)
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<number | null>(null)
  const [boxSeleccionado, setBoxSeleccionado] = useState<number | null>(null)
  const [slotSeleccionado, setSlotSeleccionado] = useState<TimeSlot | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [fechaCalendario, setFechaCalendario] = useState<Date>(fecha)
  const [fechaActual, setFechaActual] = useState<Date>(fecha)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')

  // Generar slots de tiempo
  const slots: TimeSlot[] = []
  for (let hora = HORAS_INICIO; hora < HORAS_FIN; hora++) {
    for (let minuto = 0; minuto < 60; minuto += INTERVALO_MINUTOS) {
      const slot: TimeSlot = {
        hora: hora.toString().padStart(2, '0'),
        minutos: minuto
      }
      slots.push(slot)
    }
  }

  // Función para mostrar los minutos en el grid
  const mostrarMinutos = (minutos: number): string => {
    switch (minutos) {
      case 0: return '00'
      case 15: return '15'
      case 30: return '30'
      case 45: return '45'
      default: return ''
    }
  }

  // Función para verificar si es un intervalo de 15 minutos
  const esIntervaloQuince = (minutos: number): boolean => {
    return minutos === 0 || minutos === 15 || minutos === 30 || minutos === 45
  }

  // Función para obtener el ID único de un slot
  const getSlotId = (slot: TimeSlot, box: number) => 
    `${slot.hora}:${slot.minutos.toString().padStart(2, '0')}-${box}`

  // Función para verificar si un slot está disponible
  const isSlotDisponible = (slot: TimeSlot, box: number) => {
    const slotId = getSlotId(slot, box)
    const horaSlot = `${slot.hora}:${slot.minutos.toString().padStart(2, '0')}`
    return fechasDisponibles.some(fd => {
      const fechaDisponible = parseISO(fd.fecha_inicio)
      const boxNum = Number(box)
      return isSameDay(fechaDisponible, fecha) &&
        fd.boxes_disponibles.includes(boxNum) &&
        fd.hora_inicio.localeCompare(horaSlot) <= 0 &&
        fd.hora_fin.localeCompare(horaSlot) > 0
    })
  }

  // Función para obtener las citas de un box específico
  const getCitasBox = (box: number) => {
    return citas.filter(cita => 
      isSameDay(cita.fecha, fecha) && 
      Number(cita.box) === box
    )
  }

  // Manejadores de eventos del mouse
  const handleMouseDown = (slot: TimeSlot, box: number) => {
    if (isSlotDisponible(slot, box)) {
      setEstaSeleccionando(true)
      setSlotInicio(getSlotId(slot, box))
      setSlotsSeleccionados(new Set([getSlotId(slot, box)]))
    }
  }

  const handleMouseEnter = (slot: TimeSlot, box: number) => {
    if (estaSeleccionando && slotInicio) {
      const slots = new Set<string>()
      const [horaInicio, minutoInicio, boxInicio] = slotInicio.split(/[:-]/).map(Number)
      
      const slotActual = {
        hora: slot.hora,
        minutos: slot.minutos,
        box
      }
      
      const slotInicioObj = {
        hora: horaInicio.toString().padStart(2, '0'),
        minutos: minutoInicio,
        box: boxInicio
      }

      // Convertir slots a array para poder usar indexOf
      const slotsArray = Array.from(slots)
      const slotsInicio = slotsArray.findIndex(s => s === getSlotId(slotInicioObj, boxInicio))
      const slotsFin = slotsArray.findIndex(s => s === getSlotId(slotActual, box))

      if (slotsInicio !== -1 && slotsFin !== -1) {
        const [min, max] = [Math.min(slotsInicio, slotsFin), Math.max(slotsInicio, slotsFin)]
        
        // Seleccionar todos los slots en el rango
        for (let i = min; i <= max; i++) {
          const currentSlot = slotsArray[i]
          if (currentSlot && isSlotDisponible(slot, box)) {
            slots.add(currentSlot)
          }
        }
      }

      setSlotsSeleccionados(slots)
    }
  }

  const handleMouseUp = () => {
    if (estaSeleccionando && slotsSeleccionados.size > 0) {
      setEstaSeleccionando(false)
      setShowModalDisponibilidad(true)
    }
  }

  const handleSlotClick = (slot: TimeSlot, box: number) => {
    if (isSlotDisponible(slot, box)) {
      setSlotSeleccionado(slot)
      setBoxSeleccionado(box)
      setShowModalCita(true)
    }
  }

  // Manejadores de modales
  const handleCrearDisponibilidad = async (formData: FormData) => {
    await onCrearDisponibilidad({
      tratamiento_id: formData.tratamiento_id,
      fecha_inicio: format(fechaCalendario, 'yyyy-MM-dd'),
      fecha_fin: format(fechaCalendario, 'yyyy-MM-dd'),
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
      boxes_disponibles: formData.boxes_disponibles
    });
    setShowModalDisponibilidad(false);
  };

  const handleCrearCita = async () => {
    if (!subTratamientoSeleccionado || slotsSeleccionados.size === 0) return;

    const slotsArray = Array.from(slotsSeleccionados);
    const boxes = Array.from(new Set(slotsArray.map(slot => {
      const boxStr = slot.split('-')[1];
      const boxNum = boxStr ? parseInt(boxStr, 10) : 0;
      return boxNum > 0 ? boxNum : null;
    }))).filter((box): box is number => box !== null);

    // Ordenar slots por hora
    slotsArray.sort((a, b) => {
      const [horaA, minutoA] = a.split(':')[0].split('-')[0].split(':').map(Number);
      const [horaB, minutoB] = b.split(':')[0].split('-')[0].split(':').map(Number);
      return (horaA * 60 + minutoA) - (horaB * 60 + minutoB);
    });

    const primerSlot = slotsArray[0].split('-')[0];
    const ultimoSlot = slotsArray[slotsArray.length - 1].split('-')[0];
    const [horaFin, minutoFin] = ultimoSlot.split(':').map(Number);
    const horaFinObj = addMinutes(
      parseISO(`${format(fecha, 'yyyy-MM-dd')}T${horaFin}:${minutoFin}`),
      INTERVALO_MINUTOS
    );

    await onCrearCita({
      fecha,
      horaInicio: primerSlot,
      horaFin: format(horaFinObj, 'HH:mm'),
      boxes,
      subTratamientoId: subTratamientoSeleccionado
    });

    setShowModalCita(false);
    setSlotsSeleccionados(new Set());
    setSubTratamientoSeleccionado(null);
  };

  // Limpiar selección al cambiar de fecha
  useEffect(() => {
    setSlotsSeleccionados(new Set())
    setEstaSeleccionando(false)
    setSlotInicio(null)
  }, [fecha])

  const subTratamientosFiltrados = tratamientoSeleccionado
    ? subTratamientos.filter(st => st.tratamiento_id === tratamientoSeleccionado)
    : []

  const irDiaAnterior = () => {
    const nuevaFecha = subDays(fechaActual, 1)
    setFechaActual(nuevaFecha)
    if (onFechaChange) onFechaChange(nuevaFecha)
  }

  const irDiaSiguiente = () => {
    const nuevaFecha = addDays(fechaActual, 1)
    setFechaActual(nuevaFecha)
    if (onFechaChange) onFechaChange(nuevaFecha)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
      {/* Encabezado con fecha y flechas */}
      <div className="flex justify-center items-center py-4 border-b">
        <Button 
          variant="ghost" 
          onClick={irDiaAnterior} 
          className="mx-2 hover:bg-gray-100"
        >
          ◀
        </Button>
        <span className="mx-4 text-lg font-medium">
          {format(fechaActual, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </span>
        <Button 
          variant="ghost" 
          onClick={irDiaSiguiente} 
          className="mx-2 hover:bg-gray-100"
        >
          ▶
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div ref={gridRef} className="flex-1 overflow-auto">
           <div className="min-w-full inline-block align-middle">
             <div className="overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead>
                   <tr>
                     <th scope="col" className="sticky top-0 z-10 w-12 h-12 bg-white border-b border-r px-2 flex items-center justify-center font-medium text-sm text-gray-600 bg-gray-50">
                       Hora
                     </th>
                     {Array.from({ length: NUM_BOXES }, (_, i) => (i + 1)).map((box) => (
                       <th key={box} scope="col" className="sticky top-0 z-10 w-24 h-12 bg-white border-b border-r px-2 flex items-center justify-center font-medium text-sm text-gray-600 bg-gray-50">
                         Box {box}
                       </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200 bg-white">
                   {slots.map((slot, index) => (
                     <tr key={index} className={cn(ALTURA_CELDA, "relative")}>
                       <td className="sticky left-0 z-10 w-12 h-12 bg-white border-r px-2 flex items-center justify-center font-medium text-sm text-gray-600 bg-gray-50">
                         {format(parseISO(slot.hora), "HH:mm")}
                       </td>
                       {Array.from({ length: NUM_BOXES }, (_, i) => (i + 1)).map((box) => (
                         <td key={box} className="relative h-12 border-r px-2 flex items-center justify-center font-medium text-sm text-gray-600 bg-gray-50" data-slot={`${slot.hora}-${box}`}></td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </ScrollArea>
      {/* Modal de disponibilidad */}
      <DisponibilidadModal
        open={showModalDisponibilidad}
        onOpenChange={setShowModalDisponibilidad}
        onSubmit={handleCrearDisponibilidad}
        tratamientos={tratamientos}
        title="Crear disponibilidad"
        description="Seleccione el tratamiento y los horarios disponibles"
      />
      {/* Modal de cita (sin cambios) */}
      <Dialog open={showModalCita} onOpenChange={setShowModalCita}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle>Crear nueva cita</DialogTitle>
           </DialogHeader>
           <div className="py-4">
             <Select
               value={tratamientoSeleccionado || ""}
               onValueChange={(value) => { setTratamientoSeleccionado(value); setSubTratamientoSeleccionado(null); }}
             >
               <SelectTrigger className="w-full">
                 <SelectValue placeholder="Seleccionar tratamiento" />
               </SelectTrigger>
               <SelectContent>
                 {tratamientos.map((t) => ( <SelectItem key={t.id} value={t.id}> {t.nombre} </SelectItem> ))}
               </SelectContent>
             </Select>
             <div className="mt-2">
               <Select
                 value={subTratamientoSeleccionado?.toString() || ""}
                 onValueChange={(value) => setSubTratamientoSeleccionado(parseInt(value))}
                 disabled={!tratamientoSeleccionado}
               >
                 <SelectTrigger className="w-full">
                   <SelectValue placeholder="Seleccionar sub-tratamiento" />
                 </SelectTrigger>
                 <SelectContent>
                   {subTratamientosFiltrados.map((st) => ( <SelectItem key={st.id} value={st.id.toString()}> {st.nombre} </SelectItem> ))}
                 </SelectContent>
               </Select>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModalCita(false); setTratamientoSeleccionado(null); setSubTratamientoSeleccionado(null); }}> Cancelar </Button>
            <Button onClick={handleCrearCita} disabled={!tratamientoSeleccionado || !subTratamientoSeleccionado}> Crear cita </Button>
          </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

const CalendarEvent = ({ cita, onEventClick }: CalendarEventProps) => {
  const duracion = cita.duracion || 30 // usar duracion directamente de la cita
  const alturaBase = 2 // altura base en rem (8px * 2 = 16px)
  const alturaPorMinuto = alturaBase / INTERVALO_MINUTOS // altura por minuto
  const altura = Math.max(alturaBase, duracion * alturaPorMinuto) // altura mínima de 2rem

  return (
    <div
      className={cn(
        "absolute left-0 right-0 mx-1 rounded-md p-1 text-xs cursor-pointer overflow-hidden",
        "bg-blue-100 border border-blue-200 hover:bg-blue-200 transition-colors",
        "flex flex-col"
      )}
      style={{
        top: `${(parseInt(cita.horaInicio.split(':')[0]) - HORAS_INICIO) * 4 + parseInt(cita.horaInicio.split(':')[1]) / INTERVALO_MINUTOS}rem`,
        height: `${altura}rem`,
        zIndex: 10
      }}
      onClick={() => onEventClick(cita)}
    >
      <div className="font-medium truncate">{cita.nombreSubTratamiento || cita.nombreTratamiento}</div>
      <div className="text-[10px] text-gray-600 truncate">
        {format(parseISO(cita.horaInicio), 'HH:mm')} - {format(parseISO(cita.horaFin), 'HH:mm')}
      </div>
    </div>
  )
} 