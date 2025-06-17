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
  const formatearFecha = (fecha: string | undefined) => {
    if (!fecha) return "Fecha no especificada"
    try {
      return format(new Date(fecha), "EEEE d 'de' MMMM", { locale: es })
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

  // Obtener datos del cliente
  const nombreCompleto = cita.rf_clientes?.nombre_completo || "Cliente no especificado"
  const dni = cita.rf_clientes?.dni
  const whatsapp = cita.rf_clientes?.whatsapp

  // Obtener datos del tratamiento
  const nombreTratamiento = cita.rf_subtratamientos?.nombre_subtratamiento || "Tratamiento no especificado"
  const nombreSubTratamiento = cita.rf_subtratamientos?.nombre_subtratamiento || "Subtratamiento no especificado"

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-start">
        <div className="w-4 h-4 rounded-full mt-1 mr-2 flex-shrink-0 bg-blue-500" />
        <div>
          <h3 className="font-medium text-lg">
            {nombreCompleto}
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
            {formatearHora(cita.hora)} - {cita.duracion ? `${cita.duracion} min` : "Duración no especificada"}
          </span>
        </div>

        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>
            {nombreCompleto} {dni && `(DNI: ${dni})`}
          </span>
        </div>

        {whatsapp && (
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{whatsapp}</span>
          </div>
        )}

        <div className="flex items-center">
          <Scissors className="w-4 h-4 mr-2 text-muted-foreground" />
          <span>
            {nombreTratamiento} - {nombreSubTratamiento}
          </span>
        </div>

        {(cita.precio || cita.sena) && (
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>
              {cita.precio && `Precio: $${cita.precio.toLocaleString()}`}{" "}
              {cita.sena && cita.sena > 0 && `(Seña: $${cita.sena.toLocaleString()})`}
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
