import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useCallback } from "react"
import { format, parse, isWithinInterval, addDays, addMinutes, isBefore, isAfter, startOfDay, endOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { debounce } from "lodash"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Loader2 } from "lucide-react"
import type { CitaWithRelations } from "@/types/cita"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/db"

interface CitaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CitaData | CitaData[]) => void
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

interface FormData {
  fecha: string
  hora: string
  box: number
  tratamiento_id: string
  subtratamiento_id: string
  dni?: string
  nombre_completo: string
  whatsapp: string
  precio: number
  sena: number
  notas: string
  paciente_id?: string
  estado: EstadoCita
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
  dni?: string
  nombre_completo: string
  whatsapp: string
  precio: number
  sena: number
}

interface Cliente {
  id: string
  dni?: string
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
  duracion: number;
}

interface ClienteMultiple {
  paciente_id?: string;
  dni?: string;
  nombre_completo: string;
  whatsapp: string;
  precio: number;
  sena: number;
}

interface FormDataMultiple {
  fecha: string
  hora: string
  box: number
  tratamiento_id: string
  subtratamiento_id: string
  precio: number
  sena: number
  notas: string
  clientes: ClienteMultiple[]
}

interface ClienteCitaDB {
  id: string;
  total: number;
  sena: number;
  rf_clientes: {
    id: string;
    dni?: string;
    nombre_completo: string;
    whatsapp: string | null;
  } | null;
}

interface HorarioDisponible {
  fecha: string;
  hora: string;
  box: number;
}

interface ClienteFormData {
  dni?: string;
  nombre_completo: string;
  whatsapp: string;
}

interface CitaData {
  tratamiento_id: string
  subtratamiento_id: string
  fecha: string
  hora: string
  box: number
  estado: EstadoCita
  precio: number
  sena: number
  notas: string | null
  paciente_id: string
  es_multiple: boolean
  cliente_data?: ClienteFormData
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
  const form = useForm<FormData>({
    defaultValues: {
      fecha: '',
      hora: '',
      box: 1,
      tratamiento_id: '',
      subtratamiento_id: '',
      dni: '',
      nombre_completo: '',
      whatsapp: '',
      precio: 0,
      sena: 0,
      notas: '',
      paciente_id: undefined,
      estado: 'reservado'
    }
  })

  const formMultiple = useForm<FormDataMultiple>({
    defaultValues: {
      fecha: '',
      hora: '',
      box: 1,
      tratamiento_id: '',
      subtratamiento_id: '',
      precio: 0,
      sena: 0,
      notas: '',
      clientes: []
    }
  })

  const [subtratamientos, setSubtratamientos] = useState<SubTratamiento[]>([])
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const fetchSubtratamientos = useCallback(async (tratamientoId: string) => {
    try {
      const { data, error } = await supabase
        .from('rf_subtratamientos')
        .select('*')
        .eq('tratamiento_id', tratamientoId)

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
  }, [supabase])

  // Asegurar que se hereden los datos seleccionados
  useEffect(() => {
    if (fechaSeleccionada) {
      form.setValue('fecha', fechaSeleccionada)
    }
  }, [fechaSeleccionada, form])

  useEffect(() => {
    if (horaSeleccionada) {
      form.setValue('hora', horaSeleccionada)
    }
  }, [horaSeleccionada, form])

  useEffect(() => {
    if (boxSeleccionado) {
      form.setValue('box', boxSeleccionado)
    }
  }, [boxSeleccionado, form])

  // Efecto para cargar subtratamientos cuando se selecciona un tratamiento
  useEffect(() => {
    const tratamientoId = form.watch('tratamiento_id')
    if (tratamientoId) {
      fetchSubtratamientos(tratamientoId)
    }
  }, [form.watch('tratamiento_id'), fetchSubtratamientos])

  // Efecto para cargar subtratamientos en el formulario múltiple
  useEffect(() => {
    const tratamientoId = formMultiple.watch('tratamiento_id')
    if (tratamientoId) {
      fetchSubtratamientos(tratamientoId)
    }
  }, [formMultiple.watch('tratamiento_id'), fetchSubtratamientos])

  // Efecto para inicializar el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (cita) {
        // Si es una cita existente, cargar sus datos
        form.setValue('fecha', cita.fecha)
        form.setValue('hora', cita.hora)
        form.setValue('box', cita.box)
        form.setValue('tratamiento_id', cita.tratamiento_id)
        form.setValue('subtratamiento_id', cita.subtratamiento_id)
        form.setValue('dni', cita.rf_clientes?.dni || '')
        form.setValue('nombre_completo', cita.rf_clientes?.nombre_completo || '')
        form.setValue('whatsapp', cita.rf_clientes?.whatsapp || '')
        form.setValue('precio', cita.precio || 0)
        form.setValue('sena', cita.sena || 0)
        form.setValue('notas', cita.notas || '')
        form.setValue('paciente_id', cita.cliente_id)
        form.setValue('estado', cita.estado)
      } else {
        // Si es una nueva cita, inicializar con los datos seleccionados
        form.setValue('fecha', fechaSeleccionada || '')
        form.setValue('hora', horaSeleccionada || '')
        form.setValue('box', boxSeleccionado || 1)
        form.setValue('tratamiento_id', '')
        form.setValue('subtratamiento_id', '')
        form.setValue('dni', '')
        form.setValue('nombre_completo', '')
        form.setValue('whatsapp', '')
        form.setValue('precio', 0)
        form.setValue('sena', 0)
        form.setValue('notas', '')
        form.setValue('paciente_id', '')
        form.setValue('estado', 'reservado')

        // Inicializar el formulario múltiple también
        formMultiple.setValue('fecha', fechaSeleccionada || '')
        formMultiple.setValue('hora', horaSeleccionada || '')
        formMultiple.setValue('box', boxSeleccionado || 1)
        formMultiple.setValue('tratamiento_id', '')
        formMultiple.setValue('subtratamiento_id', '')
        formMultiple.setValue('clientes', [{
          dni: '',
          nombre_completo: '',
          whatsapp: '',
          precio: 0,
          sena: 0,
          paciente_id: ''
        }])
        formMultiple.setValue('notas', '')
      }
    }
  }, [open, cita, fechaSeleccionada, horaSeleccionada, boxSeleccionado])

  // En el componente CitaModal, actualizar el useEffect para limpiar el estado
  useEffect(() => {
    if (!open) {
      // Limpiar el estado cuando se cierra el modal
      form.reset()
      formMultiple.reset()
      setActiveTab('individual')
      setSubtratamientos([])
      setLoading(false) // Asegurarse de que el estado de carga se resetee
    }
  }, [open, form, formMultiple])

  // Memoizar la función de búsqueda de clientes
  const buscarCliente = async (whatsapp: string) => {
    console.log('🔍 Buscando cliente con WhatsApp:', whatsapp);
    if (!whatsapp || whatsapp.length < 9) {
      console.log('❌ WhatsApp muy corto, no se busca');
      return;
    }
    
    try {
      console.log('📡 Consultando base de datos...');
      console.log('🔧 URL de consulta:', `rf_clientes?select=id,dni,nombre_completo,whatsapp&whatsapp=eq.${whatsapp}`);
      
      // Verificar que supabase esté disponible
      console.log('🔧 Verificando cliente Supabase:', !!supabase);
      
      // Verificar qué tablas están disponibles
      console.log('🧪 Verificando tablas disponibles...');
      try {
        const { data: tratamientosData, error: tratamientosError } = await supabase
          .from('rf_tratamientos')
          .select('id')
          .limit(1);
        console.log('🧪 Tabla rf_tratamientos:', { data: tratamientosData, error: tratamientosError });
      } catch (e) {
        console.log('🧪 Error al verificar rf_tratamientos:', e);
      }
      
      try {
        const { data: citasData, error: citasError } = await supabase
          .from('rf_citas')
          .select('id')
          .limit(1);
        console.log('🧪 Tabla rf_citas:', { data: citasData, error: citasError });
      } catch (e) {
        console.log('🧪 Error al verificar rf_citas:', e);
      }
      
      // Hacer una consulta simple primero
      console.log('🧪 Haciendo consulta simple...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('rf_clientes')
        .select('*')
        .limit(1);
      
      console.log('🧪 Resultado de consulta simple:', { simpleData, simpleError });

      if (simpleError) {
        console.error('❌ Error en consulta simple:', simpleError);
        console.error('❌ Código de error:', simpleError.code);
        console.error('❌ Mensaje de error:', simpleError.message);
        throw new Error(`Error de conexión: ${simpleError.message}`);
      }
      
      // Ahora hacer la consulta específica
      console.log('🔍 Haciendo consulta específica...');
      const { data: cliente, error } = await supabase
        .from('rf_clientes')
        .select('id, dni, nombre_completo, whatsapp')
        .eq('whatsapp', whatsapp)
        .maybeSingle()

      console.log('📊 Respuesta de la consulta específica:', { data: cliente, error });

      if (error) {
        console.error('❌ Error en consulta específica:', error);
        console.error('❌ Detalles del error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error
      }

      if (cliente) {
        console.log('✅ Cliente encontrado:', cliente);
        form.setValue('dni', cliente.dni || '')
        form.setValue('nombre_completo', cliente.nombre_completo)
        form.setValue('whatsapp', cliente.whatsapp || '')
        form.setValue('paciente_id', cliente.id)
        console.log('✅ Datos del cliente cargados en el formulario');
      } else {
        console.log('❌ Cliente no encontrado');
      }
    } catch (error) {
      console.error('❌ Error al buscar cliente:', error)
      console.error('❌ Tipo de error:', typeof error);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
      
      toast({
        title: "Error",
        description: "No se pudo buscar el cliente",
        variant: "destructive"
      })
    }
  }

  // Actualizar el manejador de cambios de cliente
  const handleClienteChange = (index: number, field: keyof ClienteMultiple, value: string | number) => {
    const clientes = formMultiple.watch('clientes')
    const updatedClientes = clientes.map((cliente, i) => 
        i === index ? { ...cliente, [field]: value } : cliente
      )
    formMultiple.setValue(`clientes.${index}.${field}`, value)
  }

  const handleAddCliente = () => {
    const subtratamiento = subtratamientos.find(st => st.id === formMultiple.watch('subtratamiento_id'))
    const precio = subtratamiento?.precio || 0
    formMultiple.setValue('clientes', [
      ...formMultiple.watch('clientes'),
        { 
          dni: "", 
          nombre_completo: "", 
          whatsapp: "", 
          precio: precio,
          sena: 0 
        }
    ])
  }

  const handleRemoveCliente = (index: number) => {
    formMultiple.setValue('clientes', formMultiple.watch('clientes').filter((_, i) => i !== index))
  }

  // Memoizar la función de búsqueda de clientes múltiples
  const buscarClienteMultiple = async (whatsapp: string, index: number) => {
    if (!whatsapp || whatsapp.length < 9) return;
    
    try {
      const { data: cliente, error } = await supabase
        .from('rf_clientes')
        .select('id, dni, nombre_completo, whatsapp')
        .eq('whatsapp', whatsapp)
        .maybeSingle()

      if (error) {
        console.error('Error en consulta múltiple:', error);
        throw error
      }

      if (cliente) {
        formMultiple.setValue('clientes', formMultiple.watch('clientes').map((c, i) => 
              i === index ? {
            ...c,
            dni: cliente.dni || '',
            nombre_completo: cliente.nombre_completo,
            whatsapp: cliente.whatsapp || '',
            paciente_id: cliente.id
          } : c
        ))
        }
    } catch (error) {
      console.error('Error al buscar cliente:', error)
      toast({
        title: "Error",
        description: "No se pudo buscar el cliente",
        variant: "destructive"
      })
    }
  }

  // Funciones de manejo de citas
  async function verificarDisponibilidad(fecha: string, hora: string, box: number, citaId?: string) {
    try {
      // Construir la consulta base
      let query = supabase
        .from('rf_citas')
        .select('id')
        .eq('fecha', fecha)
        .eq('hora', hora)
        .eq('box', box)
        .eq('estado', 'reservado')

      // Si es una actualización, excluir la cita actual
      if (citaId) {
        query = query.neq('id', citaId)
      }

      const { data: citasExistentes, error } = await query

      if (error) {
        console.error('Error en consulta de disponibilidad:', error)
        throw new Error(`Error al verificar disponibilidad: ${error.message}`)
      }

      return !citasExistentes || citasExistentes.length === 0
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error)
      throw error
    }
  }

  // Memoizar la función de reset
  const resetForm = () => {
    const fechaInicial = fechaSeleccionada || ""
    const horaInicial = horaSeleccionada || ""
    const boxInicial = boxSeleccionado || 1

    form.reset({
      fecha: fechaInicial,
      hora: horaInicial,
      box: boxInicial,
      tratamiento_id: "",
      subtratamiento_id: "",
      precio: 0,
      sena: 0,
      dni: "",
      nombre_completo: "",
      whatsapp: "",
      notas: "",
      paciente_id: undefined,
      estado: "reservado"
    })

    formMultiple.reset({
      fecha: fechaInicial,
      hora: horaInicial,
      box: boxInicial,
      tratamiento_id: "",
      subtratamiento_id: "",
      precio: 0,
      sena: 0,
      notas: "",
      clientes: [{ 
        dni: "", 
        nombre_completo: "", 
        whatsapp: "", 
        precio: 0, 
        sena: 0 
      }]
    })

    setClienteEncontrado(null)
    setSubtratamientos([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loading) return
    
    try {
      setLoading(true)
      const formData = form.getValues()
      
      // Validar campos requeridos
      if (!formData.fecha || !formData.hora || !formData.box || 
          !formData.tratamiento_id || !formData.subtratamiento_id || 
          !formData.nombre_completo || !formData.whatsapp) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive"
        })
        return
      }

      // Verificar disponibilidad
      try {
        const disponible = await verificarDisponibilidad(
          formData.fecha, 
          formData.hora, 
          formData.box, 
          cita?.id
        )
        if (!disponible) {
          toast({
            title: "Error",
            description: "El horario seleccionado no está disponible",
            variant: "destructive"
          })
          return
        }
      } catch (error) {
        console.error('Error al verificar disponibilidad:', error)
        toast({
          title: "Error",
          description: "No se pudo verificar la disponibilidad del horario",
          variant: "destructive"
        })
        return
      }

      // Preparar datos de la cita para pasar al componente padre
      const citaData: CitaData = {
        tratamiento_id: formData.tratamiento_id,
        subtratamiento_id: formData.subtratamiento_id,
        fecha: formData.fecha,
        hora: formData.hora,
        box: formData.box,
        estado: formData.estado,
        precio: formData.precio,
        sena: formData.sena,
        notas: formData.notas || null,
        paciente_id: formData.paciente_id || "",
        es_multiple: false,
        // Agregar datos del cliente para que el componente padre los maneje
        cliente_data: {
          dni: formData.dni || "",
          nombre_completo: formData.nombre_completo,
          whatsapp: formData.whatsapp
        }
      }

      // Cerrar el modal y limpiar el formulario
      onOpenChange(false)
      resetForm()

      // Notificar al componente padre con los datos preparados
      if (onSubmit) {
        await onSubmit(citaData)
      }

    } catch (error) {
      console.error('Error al preparar datos de cita:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al preparar los datos de la cita",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMultiple = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      // Validar campos requeridos
      if (!formMultiple.watch('fecha') || !formMultiple.watch('hora') || !formMultiple.watch('box') || 
          !formMultiple.watch('tratamiento_id') || !formMultiple.watch('subtratamiento_id') || 
          formMultiple.watch('clientes').length === 0) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive"
        })
        return
      }

      // Verificar disponibilidad
      try {
        const disponible = await verificarDisponibilidad(
          formMultiple.watch('fecha'), 
          formMultiple.watch('hora'), 
          formMultiple.watch('box')
        )
        if (!disponible) {
        toast({
            title: "Error",
            description: "El horario seleccionado no está disponible",
          variant: "destructive"
          })
          return
        }
      } catch (error) {
        console.error('Error al verificar disponibilidad:', error)
          toast({
          title: "Error",
          description: "No se pudo verificar la disponibilidad del horario",
            variant: "destructive"
        })
        return
      }

      // Procesar cada cliente y crear sus citas
      const citasData: CitaData[] = []
      
      for (const cliente of formMultiple.watch('clientes')) {
        // Buscar o crear cliente
        let pacienteId = cliente.paciente_id
        if (!pacienteId && cliente.dni) {
          try {
            const { data: clienteData, error: clienteError } = await supabase
              .from('rf_clientes')
              .upsert({
                dni: cliente.dni,
                nombre_completo: cliente.nombre_completo,
                whatsapp: cliente.whatsapp || null
              })
              .select()
              .single()

            if (clienteError) {
              console.error('Error al crear/actualizar cliente:', clienteError)
              throw new Error(`Error al procesar cliente: ${clienteError.message}`)
            }

            pacienteId = clienteData.id
          } catch (error) {
            console.error('Error al procesar cliente:', error)
        toast({
              title: "Error",
              description: `No se pudo procesar la información del cliente ${cliente.nombre_completo}`,
          variant: "destructive"
            })
            continue
          }
        }

        if (!pacienteId) {
        toast({
            title: "Error",
            description: `No se pudo obtener el ID del paciente ${cliente.nombre_completo}`,
          variant: "destructive"
          })
          continue
        }

        // Agregar cita para este cliente (sin duracion)
        citasData.push({
          tratamiento_id: formMultiple.watch('tratamiento_id'),
          subtratamiento_id: formMultiple.watch('subtratamiento_id'),
          fecha: formMultiple.watch('fecha'),
          hora: formMultiple.watch('hora'),
          box: formMultiple.watch('box'),
          estado: 'reservado',
          precio: cliente.precio,
          sena: cliente.sena,
          notas: formMultiple.watch('notas') || null,
          paciente_id: pacienteId,
          es_multiple: true,
          cliente_data: {
            dni: cliente.dni || "",
            nombre_completo: cliente.nombre_completo,
            whatsapp: cliente.whatsapp || ""
          }
        })
      }

      if (citasData.length === 0) {
        toast({
          title: "Error",
          description: "No se pudo procesar ningún cliente",
          variant: "destructive"
        })
        return
      }

      try {
        // Crear nuevas citas
        const { error: createError } = await supabase
          .from('rf_citas')
          .insert(citasData)

            if (createError) {
          console.error('Error al crear citas:', createError)
          throw new Error(`Error al crear citas: ${createError.message}`)
        }

      toast({
        title: "Éxito",
          description: "Citas creadas correctamente"
        })

        // Cerrar modal y notificar
        onOpenChange(false)
        onSubmit(citasData)

      } catch (error) {
        console.error('Error al guardar citas:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo guardar las citas",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('Error general:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                      value={form.watch('fecha')}
                      onChange={(e) => form.setValue('fecha', e.target.value)}
                      className="h-7 text-xs"
                      disabled={!!fechaSeleccionada}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="hora" className="mb-1.5 block text-xs">HORA</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={form.watch('hora')}
                      onChange={(e) => form.setValue('hora', e.target.value)}
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
                      value={form.watch('box')}
                      onChange={(e) => form.setValue('box', parseInt(e.target.value) || 1)}
                      className="h-7 text-xs"
                      disabled={!!boxSeleccionado}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="whatsapp" className="mb-1.5 block">WHATSAPP *</Label>
                    <Input
                      id="whatsapp"
                      value={form.watch('whatsapp')}
                      onChange={(e) => {
                        const whatsapp = e.target.value
                        console.log('📱 Campo WhatsApp cambiado:', whatsapp);
                        form.setValue('whatsapp', whatsapp)
                        if (whatsapp.length >= 9) {
                          console.log('🚀 Llamando a buscarCliente con:', whatsapp);
                          buscarCliente(whatsapp)
                        }
                      }}
                      placeholder="9 dígitos"
                      className="h-8"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="dni" className="mb-1.5 block">DNI (Opcional)</Label>
                    <Input
                      id="dni"
                      value={form.watch('dni')}
                      onChange={(e) => form.setValue('dni', e.target.value)}
                      placeholder="8 dígitos"
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="nombre_completo" className="mb-1.5 block">NOMBRE Y APELLIDO</Label>
                  <Input
                    id="nombre_completo"
                    value={form.watch('nombre_completo')}
                    onChange={(e) => form.setValue('nombre_completo', e.target.value)}
                    placeholder="Ingrese nombre completo"
                    className="h-8"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="tratamiento" className="mb-1.5 block">TRATAMIENTO</Label>
                    <Select
                      value={form.watch('tratamiento_id')}
                      onValueChange={(value) => {
                        form.setValue('tratamiento_id', value)
                        form.setValue('subtratamiento_id', '')
                        form.setValue('precio', 0)
                        fetchSubtratamientos(value)
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
                      value={String(form.watch('subtratamiento_id'))}
                      onValueChange={(value) => {
                        form.setValue('subtratamiento_id', value)
                        const subtratamiento = subtratamientos.find(st => st.id === value)
                        if (subtratamiento) {
                          form.setValue('precio', subtratamiento.precio)
                        }
                      }}
                      disabled={!form.watch('tratamiento_id')}
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

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor="precio" className="mb-1.5 block text-xs">PRECIO</Label>
                    <Input
                      id="precio"
                      type="number"
                      min="0"
                      value={form.watch('precio')}
                      onChange={(e) => form.setValue('precio', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="sena" className="mb-1.5 block text-xs">SEÑA</Label>
                    <Input
                      id="sena"
                      type="number"
                      min="0"
                      value={form.watch('sena')}
                      onChange={(e) => form.setValue('sena', parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="estado" className="mb-1.5 block text-xs">ESTADO</Label>
                    <Select
                      value={form.watch('estado')}
                      onValueChange={(value: "reservado" | "confirmado" | "cancelado" | "completado") => form.setValue('estado', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reservado">Reservado</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notas" className="mb-1.5 block">NOTAS</Label>
                  <Textarea
                    id="notas"
                    value={form.watch('notas')}
                    onChange={(e) => form.setValue('notas', e.target.value)}
                    placeholder="Ingrese notas adicionales"
                    className="h-20"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : cita ? (
                      'Actualizar Cita'
                    ) : (
                      'Crear Cita'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <form onSubmit={handleSubmitMultiple} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1/3">
                    <Label htmlFor="fecha_multiple" className="mb-1.5 block text-xs">FECHA</Label>
                    <Input
                      id="fecha_multiple"
                      type="date"
                      value={formMultiple.watch('fecha')}
                      onChange={(e) => formMultiple.setValue('fecha', e.target.value)}
                      className="h-7 text-xs"
                      disabled={!!fechaSeleccionada}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="hora_multiple" className="mb-1.5 block text-xs">HORA</Label>
                    <Input
                      id="hora_multiple"
                      type="time"
                      value={formMultiple.watch('hora')}
                      onChange={(e) => formMultiple.setValue('hora', e.target.value)}
                      className="h-7 text-xs"
                      disabled={!!horaSeleccionada}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="box_multiple" className="mb-1.5 block text-xs">BOX</Label>
                    <Input
                      id="box_multiple"
                      type="number"
                      min="1"
                      max="8"
                      value={formMultiple.watch('box')}
                      onChange={(e) => formMultiple.setValue('box', parseInt(e.target.value) || 1)}
                      className="h-7 text-xs"
                      disabled={!!boxSeleccionado}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="tratamiento_multiple" className="mb-1.5 block">TRATAMIENTO</Label>
                    <Select
                      value={formMultiple.watch('tratamiento_id')}
                      onValueChange={(value) => {
                        formMultiple.setValue('tratamiento_id', value)
                        formMultiple.setValue('subtratamiento_id', '')
                        fetchSubtratamientos(value)
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
                    <Label htmlFor="subtratamiento_multiple" className="mb-1.5 block">SUBTRATAMIENTO</Label>
                      <Select
                      value={String(formMultiple.watch('subtratamiento_id'))}
                        onValueChange={(value) => {
                        formMultiple.setValue('subtratamiento_id', value)
                        const subtratamiento = subtratamientos.find(st => st.id === value)
                        if (subtratamiento) {
                          formMultiple.setValue('clientes', formMultiple.watch('clientes').map(c => ({
                            ...c,
                            precio: subtratamiento.precio
                          })))
                        }
                      }}
                      disabled={!formMultiple.watch('tratamiento_id')}
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

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">CLIENTES</Label>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {formMultiple.watch('clientes').map((cliente, index) => (
                      <div key={index} className="p-2 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">WHATSAPP *</Label>
                            <Input
                              value={cliente.whatsapp}
                              onChange={(e) => {
                                const newWhatsapp = e.target.value
                                handleClienteChange(index, "whatsapp", newWhatsapp)
                                buscarClienteMultiple(newWhatsapp, index)
                              }}
                              placeholder="WhatsApp"
                              className="h-7 text-sm"
                              required
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Label className="text-xs">NOMBRE *</Label>
                            <Input
                              value={cliente.nombre_completo}
                              onChange={(e) => handleClienteChange(index, "nombre_completo", e.target.value)}
                              placeholder="Nombre"
                              className="h-7 text-sm"
                              required
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Label className="text-xs">DNI (Opcional)</Label>
                            <Input
                              value={cliente.dni}
                              onChange={(e) => handleClienteChange(index, "dni", e.target.value)}
                              placeholder="DNI"
                              className="h-7 text-sm"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Label className="text-xs">PRECIO</Label>
                            <Input
                              type="number"
                              min="0"
                              value={cliente.precio}
                              onChange={(e) => handleClienteChange(index, "precio", parseFloat(e.target.value) || 0)}
                              className="h-7 text-sm"
                            />
                          </div>

                          <div className="flex-1">
                            <Label className="text-xs">SEÑA</Label>
                            <Input
                              type="number"
                              min="0"
                              value={cliente.sena}
                              onChange={(e) => handleClienteChange(index, "sena", parseFloat(e.target.value) || 0)}
                              className="h-7 text-sm"
                            />
                          </div>

                          {index > 0 && (
                          <Button
                            type="button"
                              variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveCliente(index)}
                              className="h-7 mt-6"
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCliente}
                    className="w-full h-8 mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cliente
                  </Button>
                </div>

                <div>
                  <Label htmlFor="notas_multiple" className="mb-1.5 block">NOTAS</Label>
                  <Textarea
                    id="notas_multiple"
                    value={formMultiple.watch('notas')}
                    onChange={(e) => formMultiple.setValue('notas', e.target.value)}
                    placeholder="Ingrese notas adicionales"
                    className="h-20"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : cita ? (
                      'Actualizar Cita Múltiple'
                    ) : (
                      'Crear Cita Múltiple'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 