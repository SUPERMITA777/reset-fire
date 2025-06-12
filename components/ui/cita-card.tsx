import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Cita } from '@/types/cita'

interface CitaCardProps {
  cita: Cita
  onClick?: () => void
}

export function CitaCard({ cita, onClick }: CitaCardProps) {
  const nombreCliente = cita.rf_clientes?.nombre_completo || 'Sin cliente';
  const nombreTratamiento = cita.rf_subtratamientos?.nombre_subtratamiento || 'Sin tratamiento';
  const esMultiple = cita.es_multiple;
  const cantidadClientes = esMultiple ? 
    (cita.rf_citas_clientes?.[0]?.count || 0) : 
    (cita.rf_clientes ? 1 : 0);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-2 rounded text-left transition-colors",
        "hover:bg-opacity-90",
        "border",
        {
          "bg-blue-100 border-blue-300": cita.estado === "reservado",
          "bg-green-100 border-green-300": cita.estado === "confirmado",
          "bg-red-100 border-red-300": cita.estado === "cancelado",
          "bg-gray-100 border-gray-300": cita.estado === "completado"
        }
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm truncate">{nombreCliente}</span>
          {esMultiple && (
            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
              {cantidadClientes} {cantidadClientes === 1 ? 'cliente' : 'clientes'}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-600 truncate">{nombreTratamiento}</span>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{format(parseISO(`${cita.fecha}T${cita.hora}`), 'HH:mm', { locale: es })}</span>
          <span>Box {cita.box}</span>
        </div>
      </div>
    </button>
  );
} 