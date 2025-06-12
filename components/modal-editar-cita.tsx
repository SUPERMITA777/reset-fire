import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { FormularioCita } from "@/components/formulario-cita"
import type { Cita } from "@/types/cita"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { CitaModal } from "@/components/modals/cita-modal"

// Función para obtener el color según el estado
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "reservado":
      return "#3b82f6" // azul
    case "confirmado":
      return "#22c55e" // verde
    case "cancelado":
      return "#ef4444" // rojo
    case "completado":
      return "#6b7280" // gris
    default:
      return "#3b82f6" // azul por defecto
  }
}

interface ModalEditarCitaProps {
  citaId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Definir el tipo NuevaCita localmente para el formulario
interface NuevaCita {
  id: string;
  dni: string;
  nombre_completo: string;
  whatsapp: string;
  tratamiento_id: string;
  subtratamiento_id: string;
  fecha: string;
  hora: string;
  box: number;
  estado: "reservado" | "confirmado" | "cancelado" | "completado";
  notas: string;
  precio: number;
  sena: number;
}

export function ModalEditarCita({ citaId, open, onOpenChange, onSuccess }: ModalEditarCitaProps) {
  const [cita, setCita] = useState<any | null>(null)
  const [tratamientos, setTratamientos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar datos de la cita y tratamientos
  useEffect(() => {
    const cargarDatos = async () => {
      if (!citaId) return;
      setLoading(true);
      try {
        // Cargar la cita con sus relaciones
        const { data: citaData, error: citaError } = await supabase
          .from('rf_citas')
          .select(`*,
            rf_clientes (id, dni, nombre_completo, whatsapp),
            rf_subtratamientos (id, nombre_subtratamiento, duracion, precio, rf_tratamientos (id, nombre_tratamiento)),
            rf_citas_clientes (id, cliente_id, total, sena, rf_clientes (id, dni, nombre_completo, whatsapp))
          `)
          .eq('id', citaId)
          .single();
        if (citaError) throw citaError;
        if (!citaData) throw new Error('No se encontró la cita');
        // Transformar los datos para el CitaModal
        const citaTransformada = {
          ...citaData,
          cliente_id: citaData.rf_clientes?.id,
          tratamiento_id: citaData.rf_subtratamientos?.rf_tratamientos?.id,
          subtratamiento_id: citaData.rf_subtratamientos?.id,
          dni: citaData.rf_clientes?.dni || "",
          nombre_completo: citaData.rf_clientes?.nombre_completo || "",
          whatsapp: citaData.rf_clientes?.whatsapp || "",
          nombre_tratamiento: citaData.rf_subtratamientos?.rf_tratamientos?.nombre_tratamiento || "",
          nombre_subtratamiento: citaData.rf_subtratamientos?.nombre_subtratamiento || "",
          duracion: citaData.rf_subtratamientos?.duracion || 30,
          precio: citaData.rf_subtratamientos?.precio || 0,
          estado: citaData.estado || "reservado",
          notas: citaData.notas || "",
          box: citaData.box || 1,
          fecha: citaData.fecha || "",
          hora: citaData.hora || "",
          sena: citaData.sena || 0,
          es_multiple: citaData.es_multiple || false,
          rf_clientes: citaData.rf_clientes,
          rf_subtratamientos: citaData.rf_subtratamientos,
          rf_citas_clientes: citaData.rf_citas_clientes || [],
        };
        setCita(citaTransformada);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la cita. Por favor, intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    if (open) cargarDatos();
  }, [citaId, open]);

  useEffect(() => {
    // Cargar tratamientos para el select
    const cargarTratamientos = async () => {
      const { data, error } = await supabase
        .from("rf_tratamientos")
        .select(`id, nombre_tratamiento, rf_subtratamientos (id, nombre_subtratamiento, duracion, precio, tratamiento_id)`)
        .order('nombre_tratamiento');
      if (!error && data) setTratamientos(data);
    };
    cargarTratamientos();
  }, []);

  if (!open) return null;

  return (
    <CitaModal
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={() => {
        onOpenChange(false);
        onSuccess?.();
      }}
      cita={cita}
      tratamientos={tratamientos}
      fechaSeleccionada={cita?.fecha}
      horaSeleccionada={cita?.hora}
      boxSeleccionado={cita?.box}
      title="Editar Cita"
      description="Modifica los detalles de la cita"
    />
  );
} 