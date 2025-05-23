import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, User, Scissors, Phone, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Cita } from "@/types/cita"

interface DetalleCitaProps {
  cita: Cita
}

export function DetalleCita({ cita }: DetalleCitaProps) {
  // Función auxiliar para formatear la fecha de manera segura
  const formatearFecha = (fecha: Date | undefined) => {
    if (!fecha) return "Fecha no especificada"
    try {
      return format(fecha, "EEEE d 'de' MMMM", { locale: es })
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return "Fecha inválida"
    }
  }

  // Función auxiliar para formatear la hora de manera segura
  const formatearHora = (hora: string | undefined) => {
    if (!hora) return "Hora no especificada"
    try {
      const [h, m] = hora.split(":")
      return `${h}:${m}`
    } catch (error) {
      console.error("Error al formatear hora:", error)
      return "Hora inválida"
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-start">
        <div className="w-4 h-4 rounded-full mt-1 mr-2 flex-shrink-0" style={{ backgroundColor: cita.color }} />
        <div>
          <h3 className="font-medium text-lg">
            {cita.nombreCompleto}
          </h3>
          <p className="text-muted-foreground">
            {formatearFecha(cita.fecha)}
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>
            {formatearHora(cita.horaInicio)} - {formatearHora(cita.horaFin)}
          </span>
        </div>

        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>
            {cita.nombreCompleto} {cita.dni && `(DNI: ${cita.dni})`}
          </span>
        </div>

        {cita.whatsapp && (
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{cita.whatsapp}</span>
          </div>
        )}

        <div className="flex items-center">
          <Scissors className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>
            {cita.nombreTratamiento && cita.nombreSubTratamiento
              ? `${cita.nombreTratamiento} - ${cita.nombreSubTratamiento}`
              : "Tratamiento no especificado"}
          </span>
        </div>

        {(cita.precio || cita.senia) && (
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>
              {cita.precio && `Precio: $${cita.precio.toLocaleString()}`}{" "}
              {cita.senia && cita.senia > 0 && `(Seña: $${cita.senia.toLocaleString()})`}
            </span>
          </div>
        )}
      </div>

      <Separator />

      {cita.notas && (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Observaciones:</p>
          <p>{cita.notas}</p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm">
          Editar
        </Button>
        <Button variant="destructive" size="sm">
          Eliminar
        </Button>
      </div>
    </div>
  )
}
