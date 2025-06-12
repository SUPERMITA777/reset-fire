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
  duracion: number;
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

interface HorarioDisponible {
  fecha: string;
  hora: string;
  box: number;
}

interface ClienteFormData {
  dni: string;
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
  paciente_id?: string
  es_multiple: boolean
  duracion: number
  dni: string
  nombre_completo: string
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
  const [form, setForm] = useState<FormData>({
    dni: cita?.rf_clientes?.dni || "",
    nombre_completo: cita?.rf_clientes?.nombre_completo || "",
    whatsapp: cita?.rf_clientes?.whatsapp || "",
    tratamiento_id: cita?.tratamiento_id || "",
    subtratamiento_id: cita?.subtratamiento_id || "",
    fecha: cita?.fecha || fechaSeleccionada || "",
    hora: cita?.hora || horaSeleccionada || "",
    box: cita?.box || boxSeleccionado || 1,
    precio: cita?.precio || 0,
    sena: cita?.sena || 0,
    estado: cita?.estado || "reservado",
    notas: cita?.notas || "",
    paciente_id: cita?.cliente_id || ""
  })

  const [formMultiple, setFormMultiple] = useState<FormDataMultiple>({
    tratamiento_id: cita?.tratamiento_id || "",
    subtratamiento_id: cita?.subtratamiento_id || "",
    fecha: cita?.fecha || fechaSeleccionada || "",
    hora: cita?.hora || horaSeleccionada || "",
    box: cita?.box || boxSeleccionado || 1,
    notas: cita?.notas || "",
    clientes: cita?.es_multiple ? [
      {
        dni: cita?.rf_clientes?.dni || "",
        nombre_completo: cita?.rf_clientes?.nombre_completo || "",
        whatsapp: cita?.rf_clientes?.whatsapp || "",
        precio: cita?.precio || 0,
        sena: cita?.sena || 0,
        paciente_id: cita?.cliente_id
      }
    ] : [{ dni: "", nombre_completo: "", whatsapp: "", precio: 0, sena: 0 }]
  })

  const [subtratamientos, setSubtratamientos] = useState<SubTratamiento[]>([])
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  // Memoizar la función de búsqueda de clientes
  const buscarCliente = useCallback(async (dni: string) => {
    try {
      const { data: cliente, error } = await supabase
        .from('rf_clientes')
        .select('*')
        .eq('dni', dni)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Cliente no encontrado, no es un error
          return
        }
        throw error
      }

      if (cliente) {
        setForm(prev => ({
          ...prev,
          nombre_completo: cliente.nombre_completo,
          whatsapp: cliente.whatsapp || '',
          paciente_id: cliente.id
        }))
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error)
      toast({
        title: "Error",
        description: "No se pudo buscar el cliente",
        variant: "destructive"
      })
    }
  }, [])

  // Memoizar los manejadores de eventos
  const handleClienteChange = useCallback((index: number, field: keyof ClienteMultiple, value: string | number) => {
    setFormMultiple(prev => ({
      ...prev,
      clientes: prev.clientes.map((cliente, i) => 
        i === index ? { ...cliente, [field]: value } : cliente
      )
    }))
  }, [])

  const handleAddCliente = useCallback(() => {
    const subtratamiento = subtratamientos.find(st => st.id === formMultiple.subtratamiento_id)
    const precio = subtratamiento?.precio || 0
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
    }))
  }, [formMultiple.subtratamiento_id, subtratamientos])

  const handleRemoveCliente = useCallback((index: number) => {
    setFormMultiple(prev => ({
      ...prev,
      clientes: prev.clientes.filter((_, i) => i !== index)
    }))
  }, [])

  // Memoizar la función de búsqueda de clientes múltiples
  const buscarClienteMultiple = useCallback(async (dni: string, index: number) => {
    try {
      const { data: cliente, error } = await supabase
        .from('rf_clientes')
        .select('*')
        .eq('dni', dni)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Cliente no encontrado, no es un error
          return
        }
        throw error
      }

      if (cliente) {
        setFormMultiple(prev => ({
          ...prev,
          clientes: prev.clientes.map((c, i) => 
            i === index ? {
              ...c,
              nombre_completo: cliente.nombre_completo,
              whatsapp: cliente.whatsapp || '',
              paciente_id: cliente.id
            } : c
          )
        }))
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error)
      toast({
        title: "Error",
        description: "No se pudo buscar el cliente",
        variant: "destructive"
      })
    }
  }, [])

  // Memoizar la función de reset
  const resetForm = useCallback(() => {
    const fechaInicial = fechaSeleccionada || ""
    const horaInicial = horaSeleccionada || ""
    const boxInicial = boxSeleccionado || 1

    setForm({
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
      estado: "reservado",
      notas: "",
      paciente_id: undefined
    })

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
    })

    setClienteEncontrado(null)
    setSubtratamientos([])
  }, [fechaSeleccionada, horaSeleccionada, boxSeleccionado])

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
      setForm(prev => ({
        ...prev,
        fecha: fechaSeleccionada
      }))
    }
  }, [fechaSeleccionada])

  useEffect(() => {
    if (horaSeleccionada) {
      setForm(prev => ({
        ...prev,
        hora: horaSeleccionada
      }))
    }
  }, [horaSeleccionada])

  useEffect(() => {
    if (boxSeleccionado) {
      setForm(prev => ({
        ...prev,
        box: boxSeleccionado
      }))
    }
  }, [boxSeleccionado])

  // Efecto para cargar subtratamientos cuando se selecciona un tratamiento
  useEffect(() => {
    if (form.tratamiento_id) {
      fetchSubtratamientos(form.tratamiento_id)
    }
  }, [form.tratamiento_id, fetchSubtratamientos])

  // Efecto para cargar subtratamientos en el formulario múltiple
  useEffect(() => {
    if (formMultiple.tratamiento_id) {
      fetchSubtratamientos(formMultiple.tratamiento_id)
    }
  }, [formMultiple.tratamiento_id, fetchSubtratamientos])

  // Efecto para inicializar el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (cita) {
        // Si es una cita existente, cargar sus datos
        setForm({
          fecha: cita.fecha,
          hora: cita.hora,
          box: cita.box,
          tratamiento_id: cita.tratamiento_id,
          subtratamiento_id: cita.subtratamiento_id,
          dni: cita.rf_clientes?.dni || '',
          nombre_completo: cita.rf_clientes?.nombre_completo || '',
          whatsapp: cita.rf_clientes?.whatsapp || '',
          precio: cita.precio || 0,
          sena: cita.sena || 0,
          notas: cita.notas || '',
          paciente_id: cita.cliente_id,
          estado: cita.estado
        })
      } else {
        // Si es una nueva cita, inicializar con los datos seleccionados
        setForm({
          fecha: fechaSeleccionada || '',
          hora: horaSeleccionada || '',
          box: boxSeleccionado || 1,
          tratamiento_id: '',
          subtratamiento_id: '',
          dni: '',
          nombre_completo: '',
          whatsapp: '',
          precio: 0,
          sena: 0,
          notas: '',
          paciente_id: '',
          estado: 'reservado'
        })

        // Inicializar el formulario múltiple también
        setFormMultiple({
          fecha: fechaSeleccionada || '',
          hora: horaSeleccionada || '',
          box: boxSeleccionado || 1,
          tratamiento_id: '',
          subtratamiento_id: '',
          clientes: [{
            dni: '',
            nombre_completo: '',
            whatsapp: '',
            precio: 0,
            sena: 0,
            paciente_id: ''
          }],
          notas: ''
        })
      }
    }
  }, [open, cita, fechaSeleccionada, horaSeleccionada, boxSeleccionado, fetchSubtratamientos])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      // Validar campos requeridos
      if (!form.fecha || !form.hora || !form.box || !form.tratamiento_id || !form.subtratamiento_id || !form.nombre_completo) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive"
        })
        return
      }

      // Verificar disponibilidad
      try {
        const disponible = await verificarDisponibilidad(form.fecha, form.hora, form.box, cita?.id)
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

      // Buscar o crear cliente
      let pacienteId = form.paciente_id
      if (!pacienteId && form.dni) {
        try {
          const { data: cliente, error: clienteError } = await supabase
            .from('rf_clientes')
            .upsert({
              dni: form.dni,
              nombre_completo: form.nombre_completo,
              whatsapp: form.whatsapp || null
            })
            .select()
            .single()

          if (clienteError) {
            console.error('Error al crear/actualizar cliente:', clienteError)
            throw new Error(`Error al procesar cliente: ${clienteError.message}`)
          }

          pacienteId = cliente.id
        } catch (error) {
          console.error('Error al procesar cliente:', error)
          toast({
            title: "Error",
            description: "No se pudo procesar la información del cliente",
            variant: "destructive"
          })
          return
        }
      }

      // Preparar datos de la cita
      const citaData: CitaData = {
        tratamiento_id: form.tratamiento_id,
        subtratamiento_id: form.subtratamiento_id,
        fecha: form.fecha,
        hora: form.hora,
        box: form.box,
        estado: form.estado || 'reservado',
        precio: form.precio,
        sena: form.sena,
        notas: form.notas || null,
        paciente_id: pacienteId,
        es_multiple: false,
        duracion: subtratamientos.find(st => st.id === form.subtratamiento_id)?.duracion || 30,
        dni: form.dni,
        nombre_completo: form.nombre_completo
      }

      try {
        if (cita?.id) {
          // Actualizar cita existente
          const { error: updateError } = await supabase
            .from('rf_citas')
            .update(citaData)
            .eq('id', cita.id)

          if (updateError) {
            console.error('Error al actualizar cita:', updateError)
            throw new Error(`Error al actualizar cita: ${updateError.message}`)
          }

          toast({
            title: "Éxito",
            description: "Cita actualizada correctamente"
          })
        } else {
          // Crear nueva cita
          const { error: createError } = await supabase
            .from('rf_citas')
            .insert(citaData)

          if (createError) {
            console.error('Error al crear cita:', createError)
            throw new Error(`Error al crear cita: ${createError.message}`)
          }

          toast({
            title: "Éxito",
            description: "Cita creada correctamente"
          })
        }

        // Cerrar modal y notificar
        onOpenChange(false)
        onSubmit(citaData)

      } catch (error) {
        console.error('Error al guardar cita:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo guardar la cita",
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

  const handleSubmitMultiple = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      // Validar campos requeridos
      if (!formMultiple.fecha || !formMultiple.hora || !formMultiple.box || 
          !formMultiple.tratamiento_id || !formMultiple.subtratamiento_id || 
          formMultiple.clientes.length === 0) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive"
        })
        return
      }

      // Verificar disponibilidad
      const disponible = await verificarDisponibilidad(formMultiple.fecha, formMultiple.hora, formMultiple.box)
      if (!disponible) {
        toast({
          title: "Error",
          description: "El horario seleccionado no está disponible",
          variant: "destructive"
        })
        return
      }

      // Preparar datos de las citas múltiples
      const citasData: CitaData[] = formMultiple.clientes.map(cliente => ({
        tratamiento_id: formMultiple.tratamiento_id,
        subtratamiento_id: formMultiple.subtratamiento_id,
        fecha: formMultiple.fecha,
        hora: formMultiple.hora,
        box: formMultiple.box,
        estado: 'reservado',
        precio: cliente.precio,
        sena: cliente.sena,
        notas: formMultiple.notas || null,
        paciente_id: cliente.paciente_id,
        es_multiple: true,
        duracion: subtratamientos.find(st => st.id === formMultiple.subtratamiento_id)?.duracion || 30,
        dni: cliente.dni,
        nombre_completo: cliente.nombre_completo
      }))

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
                        const dni = e.target.value
                        setForm({ ...form, dni })
                        if (dni.length >= 3) {
                          buscarCliente(dni)
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
                        setForm({ ...form, tratamiento_id: value, subtratamiento_id: "", precio: 0 })
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
                      value={String(form.subtratamiento_id)}
                      onValueChange={(value) => {
                        setForm(prev => ({ ...prev, subtratamiento_id: value }))
                        const subtratamiento = subtratamientos.find(st => st.id === value)
                        if (subtratamiento) {
                          setForm(prev => ({ ...prev, precio: subtratamiento.precio }))
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

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="precio" className="mb-1.5 block">PRECIO</Label>
                    <Input
                      id="precio"
                      type="number"
                      min="0"
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
                      className="h-8"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="sena" className="mb-1.5 block">SEÑA</Label>
                    <Input
                      id="sena"
                      type="number"
                      min="0"
                      value={form.sena}
                      onChange={(e) => setForm({ ...form, sena: parseFloat(e.target.value) || 0 })}
                      className="h-8"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notas" className="mb-1.5 block">NOTAS</Label>
                  <Textarea
                    id="notas"
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
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
                      value={formMultiple.fecha}
                      onChange={(e) => setFormMultiple(prev => ({ ...prev, fecha: e.target.value }))}
                      className="h-7 text-xs"
                      disabled={!!fechaSeleccionada}
                    />
                  </div>
                  <div className="w-1/3">
                    <Label htmlFor="hora_multiple" className="mb-1.5 block text-xs">HORA</Label>
                    <Input
                      id="hora_multiple"
                      type="time"
                      value={formMultiple.hora}
                      onChange={(e) => setFormMultiple(prev => ({ ...prev, hora: e.target.value }))}
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
                      value={formMultiple.box}
                      onChange={(e) => setFormMultiple(prev => ({ ...prev, box: parseInt(e.target.value) || 1 }))}
                      className="h-7 text-xs"
                      disabled={!!boxSeleccionado}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor="tratamiento_multiple" className="mb-1.5 block">TRATAMIENTO</Label>
                    <Select
                      value={formMultiple.tratamiento_id}
                      onValueChange={(value) => {
                        setFormMultiple(prev => ({
                          ...prev,
                          tratamiento_id: value,
                          subtratamiento_id: ""
                        }))
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
                      value={formMultiple.subtratamiento_id}
                      onValueChange={(value) => {
                        setFormMultiple(prev => ({ ...prev, subtratamiento_id: value }))
                        const subtratamiento = subtratamientos.find(st => st.id === value)
                        if (subtratamiento) {
                          setFormMultiple(prev => ({
                            ...prev,
                            clientes: prev.clientes.map(c => ({
                              ...c,
                              precio: subtratamiento.precio
                            }))
                          }))
                        }
                      }}
                      disabled={!formMultiple.tratamiento_id}
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
                    {formMultiple.clientes.map((cliente, index) => (
                      <div key={index} className="p-2 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">DNI</Label>
                            <Input
                              value={cliente.dni}
                              onChange={(e) => {
                                const newDni = e.target.value
                                handleClienteChange(index, "dni", newDni)
                                buscarClienteMultiple(newDni, index)
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
                              value={cliente.whatsapp}
                              onChange={(e) => handleClienteChange(index, "whatsapp", e.target.value)}
                              placeholder="WhatsApp"
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
                    value={formMultiple.notas}
                    onChange={(e) => setFormMultiple(prev => ({ ...prev, notas: e.target.value }))}
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