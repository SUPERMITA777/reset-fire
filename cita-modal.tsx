import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { debounce } from "lodash"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import type { CitaWithRelations } from "@/types/cita"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/db"

interface CitaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormData) => void
  cita?: CitaWithRelations | null
  tratamientos: Tratamiento[]
  fechaSeleccionada?: string
  horaSeleccionada?: string
  boxSeleccionado?: number
  title?: string
  description?: string
}

const ESTADOS = [
  { value: "reservado", label: "Reservado", color: "bg-sky-100 text-sky-800" },
  { value: "confirmado", label: "Confirmado", color: "bg-orange-100 text-orange-800" },
  { value: "completado", label: "Completado", color: "bg-green-100 text-green-800" },
  { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-800" }
] as const;

type EstadoCita = typeof ESTADOS[number]["value"];

type FormData = {
  dni: string
  nombre_completo: string
  whatsapp?: string
  tratamiento_id: string
  subtratamiento_id: string
  fecha: string
  hora: string
  box: number
  precio: number
  sena: number
  estado: 'reservado' | 'confirmado' | 'completado' | 'cancelado'
  notas?: string
  paciente_id?: string
}

interface Cita {
  id: string
  cliente_id: string
  tratamiento_id: string
  subtratamiento_id: string
  fecha: string
  hora: string
  box: number
  estado: EstadoCita
  notas?: string
  es_multiple: boolean
  dni: string
  nombre_completo: string
  whatsapp: string
  precio: number
  sena: number
}

interface Cliente {
  id: string
  dni: string
  nombre_completo: string
  whatsapp: string
}

interface Tratamiento {
  id: string
  nombre_tratamiento: string
  rf_subtratamientos?: SubTratamiento[]
}

interface SubTratamiento {
  id: string;
  nombre_subtratamiento: string;
  precio: number;
}

interface ClienteMultiple {
  paciente_id?: string;
  dni: string;
  nombre_completo: string;
  whatsapp: string;
  precio: number;
  sena: number;
}

interface FormDataMultiple {
  tratamiento_id: string;
  subtratamiento_id: string;
  fecha: string;
  hora: string;
  box: number;
  notas: string;
  clientes: ClienteMultiple[];
}

interface ClienteCitaDB {
  id: string;
  total: number;
  sena: number;
  rf_clientes: {
    id: string;
    dni: string;
    nombre_completo: string;
    whatsapp: string | null;
  } | null;
}

const getEstadoColor = (estado: FormData['estado']) => {
  switch (estado) {
    case 'reservado':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'confirmado':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'completado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function CitaModal({
  open,
  onOpenChange,
  onSubmit,
  cita,
  tratamientos,
  fechaSeleccionada,
  horaSeleccionada,
  boxSeleccionado,
  title = cita ? "Editar Cita" : "Nueva Cita",
  description = cita 
    ? "Modifica los detalles de la cita" 
    : "Complete los datos para crear una nueva cita"
}: CitaModalProps) {
  const [activeTab, setActiveTab] = useState(cita?.es_multiple ? "multiple" : "individual")
  const getDni = useCallback((c:any) => c?.dni ?? c?.rf_clientes?.dni ?? "", [])
  const getNombre = useCallback((c:any) => c?.nombre_completo ?? c?.rf_clientes?.nombre_completo ?? "", [])
  const getWhatsapp = useCallback((c:any) => c?.whatsapp ?? c?.rf_clientes?.whatsapp ?? "", [])
  const getSubtratamientoId = useCallback((c:any) => c?.subtratamiento_id ?? c?.rf_subtratamientos?.id ?? "", [])

  const [formMultiple, setFormMultiple] = useState<FormDataMultiple>({
    tratamiento_id: cita?.tratamiento_id || "",
    subtratamiento_id: getSubtratamientoId(cita),
    fecha: cita?.fecha || fechaSeleccionada || "",
    hora: cita?.hora || horaSeleccionada || "",
    box: cita?.box || boxSeleccionado || 1,
    notas: cita?.notas || "",
    clientes: cita?.es_multiple ? [
      {
        dni: getDni(cita),
        nombre_completo: getNombre(cita),
        whatsapp: getWhatsapp(cita),
        precio: cita?.precio || 0,
        sena: cita?.sena || 0
      }
    ] : [{ dni: "", nombre_completo: "", whatsapp: "", precio: 0, sena: 0 }]
  })

  const [subtratamientos, setSubtratamientos] = useState<SubTratamiento[]>([])
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const form = useForm<FormData>({
    resolver: zodResolver(z.object({
      dni: z.string().min(8, "El DNI debe tener 8 dígitos").max(8),
      nombre_completo: z.string().min(1, "El nombre es requerido"),
      whatsapp: z.string().optional(),
      tratamiento_id: z.string().uuid("ID de tratamiento inválido"),
      subtratamiento_id: z.string().uuid("ID de subtratamiento inválido"),
      fecha: z.string().min(1, "La fecha es requerida"),
      hora: z.string().min(1, "La hora es requerida"),
      box: z.number().min(1, "El box es requerido"),
      precio: z.number().min(0, "El precio debe ser mayor o igual a 0"),
      sena: z.number().min(0, "La seña debe ser mayor o igual a 0"),
      estado: z.enum(["reservado", "confirmado", "completado", "cancelado"]),
      notas: z.string().optional(),
      paciente_id: z.string().optional()
    })),
    defaultValues: {
      dni: getDni(cita),
      nombre_completo: getNombre(cita),
      whatsapp: getWhatsapp(cita),
      tratamiento_id: cita?.tratamiento_id || "",
      subtratamiento_id: getSubtratamientoId(cita),
      fecha: cita?.fecha || fechaSeleccionada || "",
      hora: cita?.hora || horaSeleccionada || "",
      box: cita?.box || boxSeleccionado || 0,
      precio: cita?.precio || 0,
      sena: cita?.sena || 0,
      estado: cita?.estado || "reservado",
      notas: cita?.notas || "",
      paciente_id: cita?.cliente_id || ""
    }
  })

  // Actualizar el formulario cuando cambia la cita
  useEffect(() => {
    if (cita) {
      form.reset({
        dni: getDni(cita),
        nombre_completo: getNombre(cita),
        whatsapp: getWhatsapp(cita),
        tratamiento_id: cita.tratamiento_id,
        subtratamiento_id: getSubtratamientoId(cita),
        fecha: cita.fecha,
        hora: cita.hora,
        box: cita.box,
        precio: cita.precio,
        sena: cita.sena,
        estado: cita.estado,
        notas: cita.notas || "",
        paciente_id: cita.cliente_id
      })
    }
  }, [cita, form, getDni, getNombre, getWhatsapp, getSubtratamientoId])

  // Actualizar el formulario cuando cambian las fechas/horas seleccionadas
  useEffect(() => {
    if (fechaSeleccionada || horaSeleccionada || boxSeleccionado) {
      form.setValue('fecha', fechaSeleccionada || form.getValues('fecha'))
      form.setValue('hora', horaSeleccionada || form.getValues('hora'))
      form.setValue('box', boxSeleccionado || form.getValues('box'))
    }
  }, [fechaSeleccionada, horaSeleccionada, boxSeleccionado, form])

  const fetchSubtratamientos = async (tratamientoId: string) => {
    try {
      const { data, error } = await supabase
        .from('rf_subtratamientos')
        .select('*')
        .eq('tratamiento_id', tratamientoId)
        .order('nombre_subtratamiento')

      if (error) throw error

      setSubtratamientos(data || [])
    } catch (error) {
      console.error('Error al cargar subtratamientos:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los subtratamientos",
        variant: "destructive"
      })
    }
  }

  // Memoizar la función de búsqueda de clientes
  const buscarCliente = useCallback(
    debounce(async (dni: string) => {
      if (!dni || dni.length < 3) {
        setClienteEncontrado(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("rf_clientes")
          .select("id, dni, nombre_completo, whatsapp")
          .eq("dni", dni)
          .maybeSingle();

        if (error) {
          if (error.code === 'PGRST116') {
            setClienteEncontrado(null);
            return;
          }
          throw new Error(`Error al buscar cliente: ${error.message}`);
        }

        if (data) {
          setClienteEncontrado(data);
          form.reset({
            ...form.getValues(),
            nombre_completo: data.nombre_completo,
            whatsapp: data.whatsapp || "",
            paciente_id: data.id
          });
        }
      } catch (error) {
        console.error("Error al buscar cliente:", error);
        toast({
          title: "Error",
          description: "No se pudo buscar el cliente. Por favor, intente nuevamente.",
          variant: "destructive"
        });
      }
    }, 300),
    []
  );

  // Memoizar los manejadores de eventos
  const handleClienteChange = useCallback((index: number, field: keyof ClienteMultiple, value: string | number) => {
    setFormMultiple(prev => ({
      ...prev,
      clientes: prev.clientes.map((cliente, i) => 
        i === index ? { ...cliente, [field]: value } : cliente
      )
    }));
  }, []);

  const handleAddCliente = useCallback(() => {
    const subtratamiento = subtratamientos.find(st => st.id === formMultiple.subtratamiento_id);
    const precio = subtratamiento?.precio || 0;
    setFormMultiple(prev => ({
      ...prev,
      clientes: [
        ...prev.clientes,
        { 
          dni: "", 
          nombre_completo: "", 
          whatsapp: "", 
          precio: precio,
          sena: 0 
        }
      ]
    }));
  }, [formMultiple.subtratamiento_id, subtratamientos]);

  const handleRemoveCliente = useCallback((index: number) => {
    setFormMultiple(prev => ({
      ...prev,
      clientes: prev.clientes.filter((_, i) => i !== index)
    }));
  }, []);

  // Memoizar la función de búsqueda de clientes múltiples
  const buscarClienteMultiple = useCallback(
    debounce(async (dni: string, index: number) => {
      if (!dni || dni.length < 3) return;

    try {
      const { data, error } = await supabase
          .from("rf_clientes")
          .select("id, dni, nombre_completo, whatsapp")
          .eq("dni", dni)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw new Error(`Error al buscar cliente: ${error.message}`);
        }

        if (data) {
          setFormMultiple(prev => ({
            ...prev,
            clientes: prev.clientes.map((cliente, i) => 
              i === index ? {
                ...cliente,
                paciente_id: data.id,
                nombre_completo: data.nombre_completo,
                whatsapp: data.whatsapp || ""
              } : cliente
            )
          }));
        }
    } catch (error) {
        console.error("Error al buscar cliente:", error);
      toast({
        title: "Error",
          description: "No se pudo buscar el cliente. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    }
    }, 300),
    []
  );

  // Memoizar la función de reset
  const resetForm = useCallback(() => {
    const fechaInicial = fechaSeleccionada || "";
    const horaInicial = horaSeleccionada || "";
    const boxInicial = boxSeleccionado || 1;

    form.reset({
      dni: "",
      nombre_completo: "",
      whatsapp: "",
      tratamiento_id: "",
      subtratamiento_id: "",
      precio: 0,
      sena: 0,
      fecha: fechaInicial,
      hora: horaInicial,
      box: boxInicial,
      estado: "reservado" as const,
      notas: "",
      paciente_id: undefined
    });

    setFormMultiple({
      tratamiento_id: "",
      subtratamiento_id: "",
      fecha: fechaInicial,
      hora: horaInicial,
      box: boxInicial,
      notas: "",
      clientes: [{ 
        dni: "", 
        nombre_completo: "", 
        whatsapp: "", 
        precio: 0, 
        sena: 0 
      }]
    });

    setClienteEncontrado(null);
    setSubtratamientos([]);
  }, [fechaSeleccionada, horaSeleccionada, boxSeleccionado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.formState.isValid) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const formData = form.getValues()

      // Validar que los IDs no estén vacíos
      if (!formData.tratamiento_id || !formData.subtratamiento_id) {
        throw new Error("ID de tratamiento o subtratamiento inválido")
      }

      // Verificar disponibilidad solo si no estamos editando una cita existente
      if (!cita?.id) {
        console.log('Verificando disponibilidad para:', {
          fecha: formData.fecha,
          hora: formData.hora,
          box: formData.box,
          tratamiento_id: formData.tratamiento_id
        })

        const { data: citasExistentes, error: errorDisponibilidad } = await supabase
          .from('rf_citas')
          .select('id')
          .eq('fecha', formData.fecha)
          .eq('hora', formData.hora)
          .eq('box', formData.box)
          .neq('id', cita?.id || '') // Solo excluir el ID si existe
          .single()

        if (errorDisponibilidad && errorDisponibilidad.code !== 'PGRST116') {
          console.error('Error al verificar disponibilidad:', errorDisponibilidad)
          throw new Error(`Error al verificar disponibilidad: ${errorDisponibilidad.message}`)
        }

        if (citasExistentes) {
          toast({
            title: "Error",
            description: "Ya existe una cita en este horario y box",
            variant: "destructive"
          })
          return
        }
      }

      let pacienteId = formData.paciente_id;

      // Si no hay paciente_id, buscar o crear el cliente
      if (!pacienteId) {
        try {
        // Primero buscar si existe un cliente con ese DNI
        const { data: existingClient, error: searchError } = await supabase
          .from('rf_clientes')
            .select('id, nombre_completo, whatsapp')
          .eq('dni', formData.dni)
          .single();

          if (searchError && searchError.code !== 'PGRST116') {
          throw new Error(`Error al buscar cliente: ${searchError.message}`);
        }

        if (existingClient) {
            // Si existe, actualizar datos del cliente solo si han cambiado
            if (existingClient.nombre_completo !== formData.nombre_completo || 
                existingClient.whatsapp !== formData.whatsapp) {
              const { error: updateError } = await supabase
            .from("rf_clientes")
            .update({
              nombre_completo: formData.nombre_completo,
              whatsapp: formData.whatsapp || null
            })
                .eq("id", existingClient.id);

          if (updateError) {
            throw new Error(`Error al actualizar cliente: ${updateError.message}`);
          }
          }
            pacienteId = existingClient.id;
        } else {
          // Si no existe, crear nuevo cliente
          const { data: newClient, error: createError } = await supabase
            .from('rf_clientes')
            .insert([{
              dni: formData.dni,
              nombre_completo: formData.nombre_completo,
              whatsapp: formData.whatsapp || null
            }])
            .select('id')
            .single();

          if (createError) {
            throw new Error(`Error al crear cliente: ${createError.message}`);
          }

          if (!newClient) {
            throw new Error("No se pudo crear el cliente");
          }

          pacienteId = newClient.id;
          }
        } catch (error) {
          console.error("Error en el proceso de cliente:", error);
          throw error;
        }
      }

      // Preparar datos de la cita
      const citaData = {
        paciente_id: pacienteId,
        tratamiento_id: formData.tratamiento_id,
        subtratamiento_id: formData.subtratamiento_id,
        precio: formData.precio,
        sena: formData.sena,
        fecha: formData.fecha,
        hora: formData.hora,
        box: formData.box,
        estado: formData.estado,
        notas: formData.notas || null,
        es_multiple: false
      };

      // Crear o actualizar la cita
      let citaGuardada;
      if (cita?.id) {
        const { data, error: updateError } = await supabase
          .from("rf_citas")
          .update(citaData)
          .eq("id", cita.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Error al actualizar cita: ${updateError.message}`);
        }

        citaGuardada = data;
      } else {
        const { data, error: createError } = await supabase
          .from("rf_citas")
          .insert(citaData)
        .select()
        .single();

        if (createError) {
          throw new Error(`Error al crear cita: ${createError.message}`);
      }

        citaGuardada = data;
      }

      // Éxito
      toast({
        title: "Éxito",
        description: cita?.id ? "Cita actualizada correctamente" : "Cita creada correctamente"
      });

      // Cerrar el modal y limpiar el formulario
      onOpenChange(false);
      resetForm();

      // Notificar al componente padre
      if (onSubmit) {
        await onSubmit(citaGuardada);
      }

    } catch (error) {
      console.error('Error al guardar cita:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la cita",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  };

  const handleSubmitMultiple = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Iniciando guardado de cita múltiple");
      console.log("Datos del formulario:", formMultiple);
      console.log("Tratamientos disponibles:", tratamientos);

      // Validaciones básicas
      const camposRequeridos = {
        tratamiento_id: "Tratamiento",
        subtratamiento_id: "Subtratamiento",
        fecha: "Fecha",
        hora: "Hora",
        box: "Box"
      };

      const camposFaltantes = Object.entries(camposRequeridos)
        .filter(([key]) => !formMultiple[key as keyof FormDataMultiple])
        .map(([_, label]) => label);

      if (camposFaltantes.length > 0) {
        toast({
          title: "Campos requeridos",
          description: `Por favor complete los siguientes campos: ${camposFaltantes.join(", ")}`,
          variant: "destructive"
        });
        return;
      }

      // Validar que haya al menos un cliente
      if (!formMultiple.clientes.length) {
        toast({
          title: "Error de validación",
          description: "Debe agregar al menos un cliente",
          variant: "destructive"
        });
        return;
      }

      // Validar datos de cada cliente
      for (let i = 0; i < formMultiple.clientes.length; i++) {
        const cliente = formMultiple.clientes[i];
        if (!cliente.dni || !cliente.nombre_completo) {
          toast({
            title: "Datos incompletos",
            description: `Complete el DNI y nombre del cliente ${i + 1}`,
            variant: "destructive"
          });
          return;
        }

        if (!/^\d{8}$/.test(cliente.dni)) {
          toast({
            title: "Error de formato",
            description: `El DNI del cliente ${i + 1} debe tener 8 dígitos`,
            variant: "destructive"
          });
            return;
        }

        if (cliente.whatsapp && !/^\d{9,10}$/.test(cliente.whatsapp)) {
          toast({
            title: "Error de formato",
            description: `El WhatsApp del cliente ${i + 1} debe tener 9 o 10 dígitos`,
            variant: "destructive"
          });
          return;
        }

        if (cliente.sena > cliente.precio) {
        toast({
            title: "Error de validación",
            description: `La seña del cliente ${i + 1} no puede ser mayor al precio total`,
          variant: "destructive"
        });
          return;
        }
      }

      // Validar disponibilidad del horario
      const { data: citasExistentes, error: errorCitas } = await supabase
        .from('rf_citas')
        .select('id')
        .eq('fecha', formMultiple.fecha)
        .eq('hora', formMultiple.hora)
        .eq('box', formMultiple.box)
        .neq('id', cita?.id || '');

      if (errorCitas) {
        throw new Error(`Error al verificar disponibilidad: ${errorCitas.message}`);
      }

      if (citasExistentes && citasExistentes.length > 0) {
        toast({
          title: "Horario no disponible",
          description: "Ya existe una cita programada para este horario y box",
          variant: "destructive"
        });
        return;
      }

      // Obtener el subtratamiento seleccionado
      const tratamientoSeleccionado = tratamientos.find(t => t.id === formMultiple.tratamiento_id);
      console.log("Tratamiento seleccionado:", tratamientoSeleccionado);

      if (!tratamientoSeleccionado) {
        throw new Error("No se encontró el tratamiento seleccionado");
      }

      // Buscar el subtratamiento en todas las fuentes posibles
      const subtratamientoEnTratamiento = tratamientoSeleccionado.rf_subtratamientos?.find(
        st => st.id === formMultiple.subtratamiento_id
      );
      const subtratamientoEnLista = subtratamientos.find(
        st => st.id === formMultiple.subtratamiento_id
      );

      console.log("Subtratamiento en tratamiento:", subtratamientoEnTratamiento);
      console.log("Subtratamiento en lista:", subtratamientoEnLista);

      const subtratamientoSeleccionado = subtratamientoEnTratamiento || subtratamientoEnLista;

      if (!subtratamientoSeleccionado) {
        throw new Error(`No se encontró el subtratamiento seleccionado (ID: ${formMultiple.subtratamiento_id})`);
      }

      let citaGuardada;

      if (cita?.id) {
        // Actualizar cita existente
        const { data, error: updateError } = await supabase
          .from("rf_citas")
          .update({
            tratamiento_id: formMultiple.tratamiento_id,
            subtratamiento_id: formMultiple.subtratamiento_id,
            fecha: formMultiple.fecha,
            hora: formMultiple.hora,
            box: formMultiple.box,
            estado: "reservado",
            notas: formMultiple.notas || null,
            es_multiple: true,
            precio: subtratamientoSeleccionado.precio
          })
          .eq("id", cita.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Error al actualizar la cita: ${updateError.message}`);
        }

        if (!data) {
          throw new Error("No se pudo actualizar la cita");
        }

        citaGuardada = data;

        // Eliminar relaciones cliente-cita existentes
        const { error: deleteError } = await supabase
          .from("rf_citas_clientes")
          .delete()
          .eq("cita_id", cita.id);

        if (deleteError) {
          throw new Error(`Error al eliminar relaciones cliente-cita: ${deleteError.message}`);
        }
      } else {
        // Crear nueva cita
        const { data, error: citaError } = await supabase
        .from("rf_citas")
        .insert({
          tratamiento_id: formMultiple.tratamiento_id,
          subtratamiento_id: formMultiple.subtratamiento_id,
          fecha: formMultiple.fecha,
          hora: formMultiple.hora,
          box: formMultiple.box,
          estado: "reservado",
            notas: formMultiple.notas || null,
            es_multiple: true,
            precio: subtratamientoSeleccionado.precio
        })
        .select()
        .single();

        if (citaError) {
          throw new Error(`Error al crear la cita: ${citaError.message}`);
        }

        if (!data) {
          throw new Error("No se pudo crear la cita");
        }

        citaGuardada = data;
      }

      // Procesar cada cliente
      for (const cliente of formMultiple.clientes) {
        try {
          // Buscar o crear cliente
          let pacienteId: string;

          const { data: existingClient, error: searchError } = await supabase
            .from('rf_clientes')
            .select('id, nombre_completo, whatsapp')
            .eq('dni', cliente.dni)
            .single();

          if (searchError && searchError.code !== 'PGRST116') {
            throw new Error(`Error al buscar cliente ${cliente.dni}: ${searchError.message}`);
          }

          if (existingClient) {
            // Actualizar datos del cliente si han cambiado
            if (existingClient.nombre_completo !== cliente.nombre_completo || 
                existingClient.whatsapp !== cliente.whatsapp) {
              const { error: updateError } = await supabase
              .from("rf_clientes")
                .update({
                nombre_completo: cliente.nombre_completo,
                  whatsapp: cliente.whatsapp || null
                })
                .eq("id", existingClient.id);

              if (updateError) {
                throw new Error(`Error al actualizar cliente ${cliente.dni}: ${updateError.message}`);
              }
            }
            pacienteId = existingClient.id;
          } else {
            // Crear nuevo cliente
            const { data: newClient, error: createError } = await supabase
              .from('rf_clientes')
              .insert([{
                dni: cliente.dni,
                nombre_completo: cliente.nombre_completo,
                whatsapp: cliente.whatsapp || null
              }])
              .select('id')
              .single();

            if (createError) {
              throw new Error(`Error al crear cliente ${cliente.dni}: ${createError.message}`);
            }

            if (!newClient) {
              throw new Error(`No se pudo crear el cliente ${cliente.dni}`);
            }

            pacienteId = newClient.id;
          }

          // Crear la relación cliente-cita
          const { error: relacionError } = await supabase
            .from('rf_citas_clientes')
            .insert({
              cita_id: citaGuardada.id,
              cliente_id: pacienteId,
              total: cliente.precio,
              sena: cliente.sena
            });

          if (relacionError) {
            throw new Error(`Error al relacionar cliente ${cliente.dni} con la cita: ${relacionError.message}`);
          }

        } catch (error) {
          console.error(`Error procesando cliente ${cliente.dni}:`, error);
          throw error;
        }
      }

      // Éxito
      toast({
        title: "Éxito",
        description: cita?.id ? "Cita múltiple actualizada correctamente" : "Cita múltiple creada correctamente"
      });

      // Cerrar el modal y limpiar el formulario
      onOpenChange(false);
      resetForm();

      // Notificar al componente padre
      if (onSubmit) {
        await onSubmit(citaGuardada);
      }

    } catch (error) {
      console.error("Error al guardar cita múltiple:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error inesperado al guardar la cita múltiple",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <div className="w-full pr-2">
          <DialogHeader className="space-y-2 sticky top-0 bg-white z-10 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">{title}</DialogTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={activeTab === "individual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("individual")}
                  className="h-7 text-xs"
                >
                  Cita Individual
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "multiple" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("multiple")}
                  className="h-7 text-xs"
                >
                  Cita Múltiple
                </Button>
              </div>
            </div>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {activeTab === "individual" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1/3">
                    <Label htmlFor="fecha" className="mb-1.5 block text-xs">FECHA</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={form.fecha}
                      onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                      className="h-7 text-xs"
                      disabled={!!fechaSeleccionada}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="hora" className="mb-1.5 block text-xs">HORA</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={form.hora}
                      onChange={(e) => setForm({ ...form, hora: e.target.value })}
                      className="h-7 text-xs"
                      disabled={!!horaSeleccionada}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="box" className="mb-1.5 block text-xs">BOX</Label>
                    <Input
                      id="box"
                      type="number"
                      min="1"
                      max="8"
                      value={form.box}
                      onChange={(e) => setForm({ ...form, box: parseInt(e.target.value) || 1 })}
                      className="h-7 text-xs"
                      disabled={!!boxSeleccionado}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="dni" className="mb-1.5 block">DNI</Label>
                    <Input
                      id="dni"
                      value={form.dni}
                      onChange={(e) => {
                        const dni = e.target.value;
                        setForm({ ...form, dni });
                        if (dni.length >= 3) {
                          buscarCliente(dni);
                        }
                      }}
                      placeholder="8 dígitos"
                      className="h-8"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="whatsapp" className="mb-1.5 block">WHATSAPP</Label>
                    <Input
                      id="whatsapp"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="9 dígitos"
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nombre_completo" className="mb-1.5 block">NOMBRE Y APELLIDO</Label>
                  <Input
                    id="nombre_completo"
                    value={form.nombre_completo}
                    onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
                    placeholder="Ingrese nombre completo"
                    className="h-8"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="tratamiento" className="mb-1.5 block">TRATAMIENTO</Label>
                    <Select
                      value={form.tratamiento_id}
                      onValueChange={(value) => {
                        setForm({ ...form, tratamiento_id: value, subtratamiento_id: "", precio: 0 });
                        fetchSubtratamientos(value);
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Seleccione tratamiento" />
                      </SelectTrigger>
                      <SelectContent>
                        {tratamientos.map((tratamiento) => (
                          <SelectItem key={tratamiento.id} value={tratamiento.id} className="text-sm">
                            {tratamiento.nombre_tratamiento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="subtratamiento" className="mb-1.5 block">SUBTRATAMIENTO</Label>
                    <Select
                      value={String(form.subtratamiento_id)}
                      onValueChange={(value) => {
                        setForm(prev => ({ ...prev, subtratamiento_id: value }));
                        const subtratamiento = subtratamientos.find(st => st.id === value);
                        if (subtratamiento) {
                          setForm(prev => ({ ...prev, precio: subtratamiento.precio }));
                        }
                      }}
                      disabled={!form.tratamiento_id}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Seleccione subtratamiento" />
                      </SelectTrigger>
                      <SelectContent>
                        {subtratamientos.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.nombre_subtratamiento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1/3">
                    <Label htmlFor="precio" className="mb-1.5 block text-xs">PRECIO</Label>
                    <Input
                      id="precio"
                      type="number"
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="sena" className="mb-1.5 block text-xs">SEÑA</Label>
                    <Input
                      id="sena"
                      type="number"
                      value={form.sena}
                      onChange={(e) => setForm({ ...form, sena: parseFloat(e.target.value) || 0 })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="estado" className="mb-1.5 block text-xs">ESTADO</Label>
                    <Select
                      value={form.estado}
                      onValueChange={(value: FormData['estado']) => setForm({ ...form, estado: value })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value} className={getEstadoColor(estado.value)}>
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notas" className="mb-1.5 block">NOTAS</Label>
                  <Textarea
                    id="notas"
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    placeholder="Observaciones adicionales"
                    className="min-h-[80px] text-xs"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full h-9">
                    {cita ? "Actualizar" : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <form onSubmit={handleSubmitMultiple} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1/3">
                    <Label htmlFor="fecha" className="mb-1.5 block text-xs">FECHA</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formMultiple.fecha}
                      onChange={(e) => setFormMultiple(prev => ({ ...prev, fecha: e.target.value }))}
                      required
                      className="h-8 text-sm"
                      disabled={!!fechaSeleccionada}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="hora" className="mb-1.5 block text-xs">HORA</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={formMultiple.hora}
                      onChange={(e) => setFormMultiple(prev => ({ ...prev, hora: e.target.value }))}
                      required
                      className="h-8 text-sm"
                      disabled={!!horaSeleccionada}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="box" className="mb-1.5 block text-xs">BOX</Label>
                    <Input
                      id="box"
                      type="number"
                      value={formMultiple.box}
                      onChange={(e) => setFormMultiple(prev => ({ ...prev, box: parseInt(e.target.value) || 1 }))}
                      required
                      className="h-8 text-sm"
                      disabled={!!boxSeleccionado}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="tratamiento" className="mb-1.5 block text-xs">TRATAMIENTO</Label>
                    <Select
                      value={formMultiple.tratamiento_id}
                      onValueChange={(value) => {
                        setFormMultiple(prev => ({ 
                          ...prev, 
                          tratamiento_id: value, 
                          subtratamiento_id: "",
                          clientes: prev.clientes.map(cliente => ({
                            ...cliente,
                            precio: 0
                          }))
                        }));
                        fetchSubtratamientos(value);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Seleccionar tratamiento" />
                      </SelectTrigger>
                      <SelectContent>
                        {tratamientos.map((tratamiento) => (
                          <SelectItem key={tratamiento.id} value={tratamiento.id} className="text-sm">
                            {tratamiento.nombre_tratamiento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="subtratamiento" className="mb-1.5 block text-xs">SUB-TRATAMIENTO</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formMultiple.subtratamiento_id}
                        onValueChange={(value) => {
                          const subtratamiento = subtratamientos.find(st => st.id === value);
                          const precio = subtratamiento?.precio || 0;
                          setFormMultiple(prev => ({ 
                            ...prev, 
                            subtratamiento_id: value,
                            clientes: prev.clientes.map(cliente => ({
                              ...cliente,
                              precio: precio
                            }))
                          }));
                        }}
                        disabled={!formMultiple.tratamiento_id}
                      >
                        <SelectTrigger className="h-8 text-sm w-full">
                          <SelectValue placeholder="Seleccionar sub-tratamiento" />
                        </SelectTrigger>
                        <SelectContent>
                          {subtratamientos.map((subtratamiento) => (
                            <SelectItem key={subtratamiento.id} value={subtratamiento.id} className="text-sm">
                              {subtratamiento.nombre_subtratamiento} - S/. {subtratamiento.precio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">CLIENTES</Label>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {formMultiple.clientes.map((cliente, index) => (
                      <div key={index} className="p-2 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">DNI</Label>
                            <Input
                              value={cliente.dni}
                              onChange={(e) => {
                                const newDni = e.target.value;
                                handleClienteChange(index, "dni", newDni);
                                buscarClienteMultiple(newDni, index);
                              }}
                              placeholder="DNI"
                              className="h-7 text-sm"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Label className="text-xs">NOMBRE</Label>
                            <Input
                              value={cliente.nombre_completo}
                              onChange={(e) => handleClienteChange(index, "nombre_completo", e.target.value)}
                              placeholder="Nombre"
                              className="h-7 text-sm"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Label className="text-xs">WHATSAPP</Label>
                            <Input
                              value={cliente.whatsapp || ""}
                              onChange={(e) => handleClienteChange(index, "whatsapp", e.target.value)}
                              placeholder="WhatsApp"
                              className="h-7 text-sm"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Label className="text-xs">SEÑA</Label>
                            <Input
                              type="number"
                              value={cliente.sena}
                              onChange={(e) => handleClienteChange(index, "sena", parseFloat(e.target.value) || 0)}
                              placeholder="Seña"
                              className="h-7 text-sm"
                            />
                          </div>

                          <div className="flex-1">
                            <Label className="text-xs">PRECIO</Label>
                            <Input
                              type="number"
                              value={cliente.precio}
                              onChange={(e) => handleClienteChange(index, "precio", parseFloat(e.target.value) || 0)}
                              placeholder="Precio"
                              className="h-7 text-sm"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCliente(index)}
                            disabled={formMultiple.clientes.length === 1}
                            className="h-7 text-xs mt-6"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCliente}
                    disabled={formMultiple.clientes.length >= 10}
                    className="h-7 text-xs w-full mt-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar Cliente
                  </Button>
                </div>

                <div>
                  <Label htmlFor="notas" className="mb-1.5 block text-xs">NOTAS</Label>
                  <Textarea
                    id="notas"
                    value={formMultiple.notas}
                    onChange={(e) => setFormMultiple(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Notas adicionales..."
                    className="h-20 text-sm"
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" className="h-8 text-sm">Guardar Cita Múltiple</Button>
                </DialogFooter>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 