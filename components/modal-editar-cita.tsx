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
  const [cita, setCita] = useState<Cita | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<NuevaCita>({
    id: "",
    dni: "",
    nombre_completo: "",
    whatsapp: "",
    tratamiento_id: "",
    subtratamiento_id: "",
    fecha: "",
    hora: "",
    box: 1,
    estado: "reservado",
    notas: "",
    precio: 0,
    sena: 0
  })
  const [subtratamientos, setSubtratamientos] = useState<any[]>([])
  const [tratamientos, setTratamientos] = useState<any[]>([])

  // Función para cargar subtratamientos
  const cargarSubtratamientos = async (tratamientoId: string) => {
    try {
      const { data, error } = await supabase
        .from('sub_tratamientos')
        .select('*')
        .eq('tratamiento_id', tratamientoId);

      if (error) {
        console.error('Error al cargar subtratamientos:', error);
        throw error;
      }

      setSubtratamientos(data || []);
    } catch (err) {
      console.error('Error al cargar subtratamientos:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los subtratamientos",
        variant: "destructive"
      });
    }
  };

  // Cargar datos de la cita cuando se abre el modal
  useEffect(() => {
    const cargarCita = async () => {
      if (!citaId) return;

      try {
        // Cargar la cita con sus relaciones
        const { data: citaData, error: citaError } = await supabase
          .from('rf_citas')
          .select(`
            *,
            rf_clientes (
              id,
              dni,
              nombre_completo,
              whatsapp
            ),
            rf_subtratamientos (
              id,
              nombre_subtratamiento,
              duracion,
              precio,
              rf_tratamientos (
                id,
                nombre_tratamiento
              )
            ),
            rf_citas_clientes (
              id,
              cliente_id,
              total,
              sena,
              rf_clientes (
                id,
                dni,
                nombre_completo,
                whatsapp
              )
            )
          `)
          .eq('id', citaId)
          .single();

        if (citaError) {
          console.error('Error al cargar la cita:', citaError);
          throw citaError;
        }

        if (!citaData) {
          throw new Error('No se encontró la cita');
        }

        // Transformar los datos para que coincidan con la estructura esperada
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
          clientes_multiple: citaData.rf_citas_clientes?.map(cc => ({
            id: cc.id,
            paciente_id: cc.cliente_id,
            dni: cc.rf_clientes?.dni || "",
            nombre_completo: cc.rf_clientes?.nombre_completo || "",
            whatsapp: cc.rf_clientes?.whatsapp || "",
            total: cc.total || 0,
            sena: cc.sena || 0
          })) || []
        };

        console.log('Cita transformada:', citaTransformada);
        setCita(citaTransformada);

        // Actualizar el formulario según si es cita múltiple o no
        if (citaData.es_multiple) {
          setFormMultiple({
            tratamiento_id: citaTransformada.tratamiento_id,
            subtratamiento_id: citaTransformada.subtratamiento_id,
            fecha: citaTransformada.fecha,
            hora: citaTransformada.hora,
            box: citaTransformada.box,
            notas: citaTransformada.notas || "",
            clientes: citaTransformada.clientes_multiple
          });
        } else {
          setFormData({
            id: citaTransformada.id,
            dni: citaTransformada.dni,
            nombre_completo: citaTransformada.nombre_completo,
            whatsapp: citaTransformada.whatsapp || "",
            tratamiento_id: citaTransformada.tratamiento_id,
            subtratamiento_id: citaTransformada.subtratamiento_id,
            fecha: citaTransformada.fecha,
            hora: citaTransformada.hora,
            box: citaTransformada.box,
            estado: citaTransformada.estado,
            notas: citaTransformada.notas || "",
            precio: citaTransformada.precio,
            sena: citaTransformada.sena
          });
        }
      } catch (error) {
        console.error('Error al cargar la cita:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la cita. Por favor, intente nuevamente.",
          variant: "destructive"
        });
      }
    };

    if (open) {
      cargarCita();
    }
  }, [citaId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Solo actualizar los campos que se pueden editar
      const { data: updatedCita, error: updateError } = await supabase
        .from('rf_citas')
        .update({
          estado: formData.estado,
          notas: formData.notas,
          sena: formData.sena,
          box: formData.box,
          fecha: formData.fecha,
          hora: formData.hora
        })
        .eq('id', cita?.id);

      if (updateError) {
        console.error('Error al actualizar la cita:', updateError);
        throw updateError;
      }

      if (!updatedCita) {
        throw new Error('No se pudo actualizar la cita');
      }

      console.log('Cita actualizada:', updatedCita);

      // Actualizar también los datos del cliente si cambiaron
      if (cita?.cliente_id && (
        formData.dni !== cita.rf_clientes?.dni ||
        formData.nombre_completo !== cita.rf_clientes?.nombre_completo ||
        formData.whatsapp !== cita.rf_clientes?.whatsapp
      )) {
        const { error: clienteError } = await supabase
          .from('rf_clientes')
          .update({
            dni: formData.dni,
            nombre_completo: formData.nombre_completo,
            whatsapp: formData.whatsapp
          })
          .eq('id', cita.cliente_id);

        if (clienteError) {
          console.error('Error al actualizar el cliente:', clienteError);
          throw clienteError;
        }
      }

      toast({
        title: "Éxito",
        description: "Cita actualizada correctamente"
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error al actualizar la cita:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cita. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <DialogHeader>
          <DialogTitle>Editar Cita</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la cita
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="dni" className="mb-1.5 block text-xs">DNI</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                  placeholder="DNI del cliente"
                  className="h-7 text-xs"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nombre_completo" className="mb-1.5 block text-xs">NOMBRE COMPLETO</Label>
                <Input
                  id="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={(e) => {
                    console.log('Cambiando nombre_completo a:', e.target.value);
                    setFormData(prev => ({ ...prev, nombre_completo: e.target.value }));
                  }}
                  placeholder="Nombre y apellido"
                  className="h-7 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="whatsapp" className="mb-1.5 block text-xs">WHATSAPP</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="Número de WhatsApp"
                className="h-7 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="tratamiento" className="mb-1.5 block text-xs">TRATAMIENTO</Label>
                <Select
                  value={formData.tratamiento_id}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tratamiento_id: value }));
                    // Cargar subtratamientos cuando se selecciona un tratamiento
                    if (value) {
                      cargarSubtratamientos(value);
                    }
                  }}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar tratamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {tratamientos.map((tratamiento) => (
                      <SelectItem key={tratamiento.id} value={tratamiento.id} className="text-sm">
                        {tratamiento.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subtratamiento" className="mb-1.5 block text-xs">SUBTRATAMIENTO</Label>
                <Select
                  value={formData.subtratamiento_id}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, subtratamiento_id: value }));
                    // Actualizar precio y duración cuando se selecciona un subtratamiento
                    const subtratamiento = subtratamientos.find(st => st.id === value);
                    if (subtratamiento) {
                      setFormData(prev => ({
                        ...prev,
                        precio: subtratamiento.precio,
                        duracion: subtratamiento.duracion
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar sub-tratamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtratamientos.map((subtratamiento) => (
                      <SelectItem key={subtratamiento.id} value={subtratamiento.id} className="text-sm">
                        {subtratamiento.nombre} - ${subtratamiento.precio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="fecha" className="mb-1.5 block text-xs">FECHA</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  required
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="hora" className="mb-1.5 block text-xs">HORA</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                  required
                  className="h-7 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="box" className="mb-1.5 block text-xs">BOX</Label>
                <Input
                  id="box"
                  type="number"
                  min={1}
                  max={8}
                  value={formData.box}
                  onChange={(e) => setFormData(prev => ({ ...prev, box: parseInt(e.target.value) || 1 }))}
                  required
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="estado" className="mb-1.5 block text-xs">ESTADO</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value as NuevaCita['estado'] }))}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reservado" className="text-sm">Reservado</SelectItem>
                    <SelectItem value="confirmado" className="text-sm">Confirmado</SelectItem>
                    <SelectItem value="cancelado" className="text-sm">Cancelado</SelectItem>
                    <SelectItem value="completado" className="text-sm">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="precio" className="mb-1.5 block text-xs">PRECIO</Label>
                <Input
                  id="precio"
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                  required
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="sena" className="mb-1.5 block text-xs">SEÑA</Label>
                <Input
                  id="sena"
                  type="number"
                  value={formData.sena}
                  onChange={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    if (valor <= formData.precio) {
                      setFormData(prev => ({ ...prev, sena: valor }));
                    }
                  }}
                  max={formData.precio}
                  className="h-7 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notas" className="mb-1.5 block text-xs">NOTAS</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Observaciones adicionales"
                className="min-h-[80px] text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 