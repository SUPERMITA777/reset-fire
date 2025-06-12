import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface DisponibilidadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormData) => Promise<void>
  disponibilidad?: Disponibilidad | null
  tratamientos: Tratamiento[]
  title?: string
  description?: string
  defaultTratamientoId?: string
}

interface FormData {
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  boxes_disponibles: number[]
}

interface Disponibilidad {
  id: string
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  boxes_disponibles: number[]
}

interface Tratamiento {
  id: string
  nombre: string
}

export function DisponibilidadModal({
  open,
  onOpenChange,
  onSubmit,
  disponibilidad,
  tratamientos,
  title = disponibilidad ? "Editar Disponibilidad" : "Nueva Disponibilidad",
  description = disponibilidad 
    ? "Modifica los datos de la disponibilidad" 
    : "Ingresa los datos de la disponibilidad",
  defaultTratamientoId
}: DisponibilidadModalProps) {
  const [form, setForm] = useState<FormData>({
    tratamiento_id: defaultTratamientoId || "",
    fecha_inicio: disponibilidad?.fecha_inicio || format(new Date(), "yyyy-MM-dd"),
    fecha_fin: disponibilidad?.fecha_fin || format(new Date(), "yyyy-MM-dd"),
    hora_inicio: disponibilidad?.hora_inicio || "09:00",
    hora_fin: disponibilidad?.hora_fin || "10:00",
    boxes_disponibles: disponibilidad?.boxes_disponibles || [1]
  })

  useEffect(() => {
    if (disponibilidad) {
      setForm({
        tratamiento_id: disponibilidad.tratamiento_id,
        fecha_inicio: disponibilidad.fecha_inicio,
        fecha_fin: disponibilidad.fecha_fin,
        hora_inicio: disponibilidad.hora_inicio,
        hora_fin: disponibilidad.hora_fin,
        boxes_disponibles: disponibilidad.boxes_disponibles
      })
    } else {
      setForm({
        tratamiento_id: defaultTratamientoId || "",
        fecha_inicio: format(new Date(), "yyyy-MM-dd"),
        fecha_fin: format(new Date(), "yyyy-MM-dd"),
        hora_inicio: "09:00",
        hora_fin: "10:00",
        boxes_disponibles: [1]
      })
    }
  }, [disponibilidad, defaultTratamientoId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px] p-3">
        <DialogHeader className="space-y-0.5 mb-2">
          <DialogTitle className="text-sm">{title}</DialogTitle>
          <DialogDescription className="text-xs">{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium">TRATAMIENTO</Label>
            <Select
              value={form.tratamiento_id}
              onValueChange={(value) => setForm(f => ({ ...f, tratamiento_id: value }))}
            >
              <SelectTrigger className="w-full h-7 text-xs">
                <SelectValue placeholder="Seleccionar tratamiento" />
              </SelectTrigger>
              <SelectContent>
                {tratamientos.map((tratamiento) => (
                  <SelectItem 
                    key={tratamiento.id} 
                    value={tratamiento.id}
                    className="text-xs"
                  >
                    {tratamiento.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1/2">
              <Label className="text-xs font-medium mb-1 block">FECHA INICIO</Label>
              <Input
                type="date"
                value={form.fecha_inicio}
                onChange={e => {
                  const newDate = e.target.value;
                  setForm(f => ({ 
                    ...f, 
                    fecha_inicio: newDate,
                    fecha_fin: f.fecha_fin < newDate ? newDate : f.fecha_fin 
                  }));
                }}
                required
                className="h-7 text-xs"
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="w-1/2">
              <Label className="text-xs font-medium mb-1 block">FECHA FIN</Label>
              <Input
                type="date"
                value={form.fecha_fin}
                onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
                required
                className="h-7 text-xs"
                min={form.fecha_inicio}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1/2">
              <Label className="text-xs font-medium mb-1 block">HORA INICIO</Label>
              <Input 
                type="time" 
                value={form.hora_inicio} 
                onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
                required 
                className="h-7 text-xs"
                step="1800"
              />
            </div>
            <div className="w-1/2">
              <Label className="text-xs font-medium mb-1 block">HORA FIN</Label>
              <Input 
                type="time" 
                value={form.hora_fin} 
                onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))}
                required 
                className="h-7 text-xs"
                step="1800"
              />
            </div>
          </div>

          <div className="w-1/2">
            <Label className="text-xs font-medium mb-1 block">BOX</Label>
            <Input 
              type="number" 
              min="1" 
              max="8" 
              value={form.boxes_disponibles[0]} 
              onChange={e => setForm(f => ({ ...f, boxes_disponibles: [Number(e.target.value)] }))} 
              required 
              className="h-7 text-xs"
            />
          </div>

          <Button type="submit" className="w-full h-7 text-xs mt-1">
            {disponibilidad ? "Guardar Cambios" : "Crear Disponibilidad"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 