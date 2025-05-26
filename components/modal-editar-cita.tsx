import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormularioCita } from "./formulario-cita"
import type { Cita } from "@/types/cita"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ModalEditarCitaProps {
  cita: Cita | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ModalEditarCita({ cita, open, onOpenChange, onSuccess }: ModalEditarCitaProps) {
  if (!cita) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Editar Cita - {format(cita.fecha, "PPP", { locale: es })}
          </DialogTitle>
        </DialogHeader>
        
        <FormularioCita
          fechaInicial={cita.fecha}
          horaInicialInicio={cita.horaInicio}
          horaInicialFin={cita.horaFin}
          tratamientoInicial={cita.tratamiento}
          subTratamientoInicial={cita.subTratamiento}
          boxInicial={cita.box_id}
          citaExistente={cita}
          onSuccess={() => {
            onOpenChange(false)
            if (onSuccess) onSuccess()
          }}
        />
      </DialogContent>
    </Dialog>
  )
} 