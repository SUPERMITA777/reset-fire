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
import { Plus, Trash2, Loader2, ShoppingCart, MessageCircle } from "lucide-react"
import type { CitaWithRelations } from "@/types/cita"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/db"
import { useCarrito } from "@/contexts/CarritoContext"
import { CarritoModal } from "@/components/modals/carrito-modal"

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
  const [carritoOpen, setCarritoOpen] = useState(false)
  const { cantidadItems } = useCarrito()
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
      clientes: [{
        paciente_id: '',
        dni: '',
        nombre_completo: '',
        whatsapp: '',
        precio: 0,
        sena: 0
      }]
    }
  })

  const [loading, setLoading] = useState(false)
  const [subtratamientos, setSubtratamientos] = useState<SubTratamiento[]>([])
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(null)

  const buscarCliente = async (whatsapp: string) => {
    console.log('🔍 Buscando cliente con WhatsApp:', whatsapp)
    
    if (!whatsapp || whatsapp.length < 8) {
      console.log('❌ WhatsApp inválido o muy corto')
      setClienteEncontrado(null)
      return
    }

    try {
      console.log('📡 Consultando tabla rf_clientes...')
      
      // Limpiar el número de WhatsApp (remover espacios, guiones, etc.)
      const whatsappLimpio = whatsapp.replace(/[\s\-\(\)]/g, '')
      console.log('📱 WhatsApp limpio:', whatsappLimpio)
      
      // Intentar buscar con diferentes formatos
      let { data, error } = await supabase
        .from('rf_clientes')
        .select('*')
        .eq('whatsapp', whatsappLimpio)

      // Si no se encuentra, intentar con el formato original
      if (error) {
        console.log('🔄 Intentando con formato original...')
        const { data: data2, error: error2 } = await supabase
          .from('rf_clientes')
          .select('*')
          .eq('whatsapp', whatsapp)
        
        data = data2
        error = error2
      }

      console.log('📊 Respuesta de Supabase:', { data, error })

      // Manejar múltiples resultados
      let clienteData = null
      if (data && Array.isArray(data) && data.length > 0) {
        clienteData = data[0] // Tomar el primer registro
        console.log(`⚠️ Se encontraron ${data.length} registros con el mismo WhatsApp, usando el primero`)
      } else if (data && !Array.isArray(data)) {
        clienteData = data
      }

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error buscando cliente:', error)
        return
      }

      if (clienteData) {
        console.log('✅ Cliente encontrado:', clienteData)
        setClienteEncontrado(clienteData)
        form.setValue('nombre_completo', clienteData.nombre_completo)
        form.setValue('dni', clienteData.dni || '')
        form.setValue('paciente_id', clienteData.id)
        console.log('✅ Campos actualizados en el formulario')
      } else {
        console.log('❌ No se encontró cliente con ese WhatsApp')
        setClienteEncontrado(null)
        form.setValue('paciente_id', '')
      }
    } catch (error) {
      console.error('❌ Error en try/catch:', error)
      setClienteEncontrado(null)
    }
  }

  const buscarClienteDebounced = useCallback(
    debounce(buscarCliente, 500),
    [form]
  )

  const handleClienteChange = (index: number, field: keyof ClienteMultiple, value: string | number) => {
    const clientes = formMultiple.watch('clientes')
    const nuevosClientes = [...clientes]
    nuevosClientes[index] = { ...nuevosClientes[index], [field]: value }
    formMultiple.setValue('clientes', nuevosClientes)
  }

  const handleAddCliente = () => {
    const clientes = formMultiple.watch('clientes')
    formMultiple.setValue('clientes', [
      ...clientes,
      {
        paciente_id: '',
        dni: '',
        nombre_completo: '',
        whatsapp: '',
        precio: formMultiple.watch('precio'),
        sena: 0
      }
    ])
  }

  const handleRemoveCliente = (index: number) => {
    const clientes = formMultiple.watch('clientes')
    formMultiple.setValue('clientes', clientes.filter((_, i) => i !== index))
  }

  const buscarClienteMultiple = async (whatsapp: string, index: number) => {
    if (!whatsapp || whatsapp.length < 8) return

    try {
      // Limpiar el número de WhatsApp
      const whatsappLimpio = whatsapp.replace(/[\s\-\(\)]/g, '')
      
      let { data, error } = await supabase
        .from('rf_clientes')
        .select('*')
        .eq('whatsapp', whatsappLimpio)

      // Si no se encuentra, intentar con el formato original
      if (error) {
        const { data: data2, error: error2 } = await supabase
          .from('rf_clientes')
          .select('*')
          .eq('whatsapp', whatsapp)
        
        data = data2
        error = error2
      }

      // Manejar múltiples resultados
      let clienteData = null
      if (data && Array.isArray(data) && data.length > 0) {
        clienteData = data[0]
      } else if (data && !Array.isArray(data)) {
        clienteData = data
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error buscando cliente:', error)
        return
      }

      if (clienteData) {
        handleClienteChange(index, 'nombre_completo', clienteData.nombre_completo)
        handleClienteChange(index, 'dni', clienteData.dni || '')
        handleClienteChange(index, 'paciente_id', clienteData.id)
      }
    } catch (error) {
      console.error('Error buscando cliente:', error)
    }
  }

  async function verificarDisponibilidad(fecha: string, hora: string, box: number, citaId?: string) {
    if (!fecha || !hora || !box) return true

    try {
      const { data, error } = await supabase
        .from('rf_citas')
        .select('id, fecha, hora, box')
        .eq('fecha', fecha)
        .eq('hora', hora)
        .eq('box', box)
        .neq('estado', 'cancelado')

      if (error) {
        console.error('Error verificando disponibilidad:', error)
        return false
      }

      // Si estamos editando, excluir la cita actual
      const citasConflictivas = citaId 
        ? data.filter(cita => cita.id !== citaId)
        : data

      return citasConflictivas.length === 0
    } catch (error) {
      console.error('Error verificando disponibilidad:', error)
      return false
    }
  }

  const resetForm = () => {
    form.reset({
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
      estado: 'reservado'
    })

    formMultiple.reset({
      fecha: fechaSeleccionada || '',
      hora: horaSeleccionada || '',
      box: boxSeleccionado || 1,
      tratamiento_id: '',
      subtratamiento_id: '',
      precio: 0,
      sena: 0,
      notas: '',
      clientes: [{
        paciente_id: '',
        dni: '',
        nombre_completo: '',
        whatsapp: '',
        precio: 0,
        sena: 0
      }]
    })

    setSubtratamientos([])
    setClienteEncontrado(null)
  }

  useEffect(() => {
    if (open) {
      resetForm()
      if (cita) {
        if (cita.es_multiple) {
          setActiveTab('multiple')
          // Cargar datos de cita múltiple
        } else {
          setActiveTab('individual')
          form.reset({
            fecha: cita.fecha,
            hora: cita.hora,
            box: cita.box,
            tratamiento_id: cita.tratamiento_id,
            subtratamiento_id: cita.subtratamiento_id,
            dni: cita.rf_clientes?.dni || '',
            nombre_completo: cita.rf_clientes?.nombre_completo || '',
            whatsapp: cita.rf_clientes?.whatsapp || '',
            precio: cita.precio,
            sena: cita.sena,
            notas: cita.notas || '',
            estado: cita.estado
          })
          
          // Cargar subtratamientos para el tratamiento seleccionado
          if (cita.tratamiento_id) {
            fetchSubtratamientos(cita.tratamiento_id)
          }
        }
      }
    }
  }, [open, cita, fechaSeleccionada, horaSeleccionada])

  const fetchSubtratamientos = async (tratamientoId: string) => {
    if (!tratamientoId) {
      setSubtratamientos([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('rf_subtratamientos')
        .select('*')
        .eq('tratamiento_id', tratamientoId)

      if (error) {
        console.error('Error fetching subtratamientos:', error)
        return
      }

      setSubtratamientos(data || [])
    } catch (error) {
      console.error('Error fetching subtratamientos:', error)
    }
  }

  // Función para generar y enviar mensaje de WhatsApp
  const enviarRecordatorioWhatsApp = () => {
    const nombreCliente = form.watch('nombre_completo')
    const fechaCita = form.watch('fecha')
    const horaCita = form.watch('hora')
    const whatsapp = form.watch('whatsapp')
    const tratamientoId = form.watch('tratamiento_id')
    const subtratamientoId = form.watch('subtratamiento_id')
    
    // Obtener nombres del tratamiento y subtratamiento
    const tratamientoSeleccionado = tratamientos.find(t => t.id === tratamientoId)
    const subtratamientoSeleccionado = subtratamientos.find(st => st.id === subtratamientoId)
    
    const nombreTratamiento = tratamientoSeleccionado?.nombre_tratamiento || 'Tratamiento'
    const nombreSubtratamiento = subtratamientoSeleccionado?.nombre_subtratamiento || 'Subtratamiento'
    
    // Formatear fecha
    const fechaFormateada = fechaCita ? new Date(fechaCita).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'FECHA'
    
    // Crear mensaje
    const mensaje = `Hola ${nombreCliente}, te recordamos que el día ${fechaFormateada}, a las ${horaCita}, tenés tu turno de ${nombreTratamiento} - ${nombreSubtratamiento}. Aguardamos tu confirmación. En caso de no poder asistir avisar con antelación mínimo de 24 hs para no perder tu seña. La tolerancia de espera es de 15 minutos, y les recordamos que no se puede asistir con acompañante. Muchas gracias!! Reset Home Spa.`
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje)
    
    // Crear URL de WhatsApp con prefijo +549
    let numeroWhatsApp = whatsapp.replace(/\D/g, '') // Remover caracteres no numéricos
    
    // Agregar prefijo +549 si no lo tiene
    if (!numeroWhatsApp.startsWith('549')) {
      numeroWhatsApp = '549' + numeroWhatsApp
    }
    
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`
    
    // Abrir WhatsApp
    window.open(urlWhatsApp, '_blank')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = form.getValues()
      
      // Verificar disponibilidad
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
        setLoading(false)
        return
      }

      // Crear o actualizar cliente si no existe
      let pacienteId = formData.paciente_id
      if (!pacienteId && formData.whatsapp) {
        try {
          // Verificar si el cliente ya existe
          const { data: clienteExistente, error: errorBusqueda } = await supabase
            .from('rf_clientes')
            .select('id')
            .eq('whatsapp', formData.whatsapp)
            .single()

          if (clienteExistente) {
            pacienteId = clienteExistente.id
          } else {
            // Crear nuevo cliente
            const datosCliente = {
              dni: formData.dni || null,
              nombre_completo: formData.nombre_completo,
              whatsapp: formData.whatsapp
            }

            console.log('Intentando crear cliente con datos:', datosCliente)

            const { data: clienteData, error: clienteError } = await supabase
              .from('rf_clientes')
              .insert(datosCliente)
              .select()
              .single()

            if (clienteError) {
              console.error('Error creando cliente:', clienteError)
              console.error('Datos del cliente:', datosCliente)
              toast({
                title: "Error",
                description: `Error al crear el cliente: ${clienteError.message}`,
                variant: "destructive"
              })
              setLoading(false)
              return
            }

            pacienteId = clienteData.id
          }
        } catch (error) {
          console.error('Error en proceso de cliente:', error)
          toast({
            title: "Error",
            description: "Error al procesar el cliente",
            variant: "destructive"
          })
          setLoading(false)
          return
        }
      }

      const citaData: CitaData = {
        tratamiento_id: formData.tratamiento_id,
        subtratamiento_id: formData.subtratamiento_id,
        fecha: formData.fecha,
        hora: formData.hora,
        box: formData.box,
        estado: formData.estado,
        precio: formData.precio,
        sena: formData.sena,
        notas: formData.notas,
        paciente_id: pacienteId || '',
        es_multiple: false,
        cliente_data: {
          dni: formData.dni,
          nombre_completo: formData.nombre_completo,
          whatsapp: formData.whatsapp
        }
      }

      onSubmit(citaData)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Error al guardar la cita",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMultiple = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = formMultiple.getValues()
      
      // Verificar disponibilidad
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
        setLoading(false)
        return
      }

      // Crear o actualizar clientes
      const clientesData = await Promise.all(
        formData.clientes.map(async (cliente) => {
          let pacienteId = cliente.paciente_id
          if (!pacienteId && cliente.whatsapp) {
            try {
              // Verificar si el cliente ya existe
              const { data: clienteExistente, error: errorBusqueda } = await supabase
                .from('rf_clientes')
                .select('id')
                .eq('whatsapp', cliente.whatsapp)
                .single()

              if (clienteExistente) {
                pacienteId = clienteExistente.id
              } else {
                // Crear nuevo cliente
                const datosCliente = {
                  dni: cliente.dni || null,
                  nombre_completo: cliente.nombre_completo,
                  whatsapp: cliente.whatsapp
                }

                console.log('Intentando crear cliente múltiple con datos:', datosCliente)

                const { data: clienteData, error: clienteError } = await supabase
                  .from('rf_clientes')
                  .insert(datosCliente)
                  .select()
                  .single()

                if (clienteError) {
                  console.error('Error creando cliente múltiple:', clienteError)
                  console.error('Datos del cliente:', datosCliente)
                  throw new Error(`Error creando cliente: ${clienteError.message}`)
                }

                pacienteId = clienteData.id
              }
            } catch (error) {
              console.error('Error en proceso de cliente múltiple:', error)
              throw error
            }
          }

          return {
            ...cliente,
            paciente_id: pacienteId
          }
        })
      )

      const citasData: CitaData[] = clientesData.map(cliente => ({
        tratamiento_id: formData.tratamiento_id,
        subtratamiento_id: formData.subtratamiento_id,
        fecha: formData.fecha,
        hora: formData.hora,
        box: formData.box,
        estado: 'reservado',
        precio: cliente.precio,
        sena: cliente.sena,
        notas: formData.notas,
        paciente_id: cliente.paciente_id || '',
        es_multiple: true,
        cliente_data: {
          dni: cliente.dni,
          nombre_completo: cliente.nombre_completo,
          whatsapp: cliente.whatsapp
        }
      }))

      onSubmit(citasData)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error submitting multiple form:', error)
      toast({
        title: "Error",
        description: "Error al guardar las citas múltiples",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de tipo de cita */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={activeTab === "individual" ? "default" : "outline"}
              onClick={() => setActiveTab("individual")}
              className="flex-1"
            >
              Cita Individual
            </Button>
            <Button
              type="button"
              variant={activeTab === "multiple" ? "default" : "outline"}
              onClick={() => setActiveTab("multiple")}
              className="flex-1"
            >
              Cita Múltiple
            </Button>
          </div>

          {/* Formulario de cita individual */}
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
                    required
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
                    required
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
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor="whatsapp" className="mb-1.5 block">WHATSAPP</Label>
                  <Input
                    id="whatsapp"
                    value={form.watch('whatsapp')}
                    onChange={(e) => {
                      form.setValue('whatsapp', e.target.value)
                      buscarClienteDebounced(e.target.value)
                    }}
                    placeholder="Ingrese número de WhatsApp"
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

              <div className="w-1/2">
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

              <DialogFooter className="flex items-center gap-2">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative rounded-full w-10 h-10 shadow-lg bg-green-50 hover:bg-green-100 border-green-200"
                  onClick={enviarRecordatorioWhatsApp}
                  disabled={!form.watch('whatsapp') || !form.watch('nombre_completo') || !form.watch('fecha') || !form.watch('hora')}
                  title="Enviar recordatorio por WhatsApp"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative rounded-full w-10 h-10 shadow-lg bg-white hover:bg-gray-50"
                  onClick={() => setCarritoOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cantidadItems > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cantidadItems}
                    </div>
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
                    required
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
                    required
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
                    required
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
      </DialogContent>

      {/* Modal del Carrito */}
      <CarritoModal
        open={carritoOpen}
        onOpenChange={setCarritoOpen}
        datosCita={activeTab === "individual" ? {
          cliente_id: form.watch('paciente_id'),
          nombre_completo: form.watch('nombre_completo'),
          whatsapp: form.watch('whatsapp'),
          dni: form.watch('dni'),
          tratamiento_id: form.watch('tratamiento_id'),
          subtratamiento_id: form.watch('subtratamiento_id'),
          precio: form.watch('precio'),
          sena: form.watch('sena'),
          fecha: form.watch('fecha'),
          hora: form.watch('hora'),
          box: form.watch('box')
        } : undefined}
      />
    </Dialog>
  )
} 