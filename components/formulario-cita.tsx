"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, toZonedTime } from "date-fns-tz"
import { addMinutes, parse } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, DollarSign, Search, UserPlus, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { getTratamientos, verificarDisponibilidadBox, supabase } from "@/lib/supabase"
import type { Cita } from "@/types/cita"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Definir las interfaces necesarias
interface Cliente {
  id: string
  dni: string
  nombre_completo: string
  whatsapp: string | null
}

interface Tratamiento {
  id: string
  nombre: string
  max_clientes_por_turno: number
  sub_tratamientos: SubTratamiento[]
}

interface SubTratamiento {
  id: string
  nombre: string
  duracion: number
  precio: number
}

// Definir el esquema de validación del formulario
const formSchema = z.object({
  fecha: z.date(),
  horaInicio: z.string(),
  horaFin: z.string(),
  box_id: z.number().nullable(),
  sena: z.number().min(0),
  notas: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

// Definir el tipo de estado de la cita
type EstadoCita = "reservado" | "seniado" | "confirmado" | "cancelado"

// Función para validar el estado de la cita
function validarEstadoCita(estado: string | undefined): EstadoCita {
  if (estado === "seniado" || estado === "confirmado" || estado === "cancelado") {
    return estado
  }
  return "reservado"
}

// Función para verificar si una cita está deshabilitada
function citaEstaDeshabilitada(estado: string | undefined): boolean {
  const estadoValidado = validarEstadoCita(estado)
  return estadoValidado !== "reservado"
}

// Extender la interfaz Cita para incluir propiedades adicionales
interface CitaExtendida extends Omit<Cita, 'sena'> {
  dni?: string
  nombreCompleto?: string
  whatsapp?: string
  color?: string
  box_id?: string
  sena?: number
  horaInicio?: string
  horaFin?: string
}

interface FormularioCitaProps {
  form: UseFormReturn<FormValues>
  tratamientos: Tratamiento[]
  subtratamientos: SubTratamiento[]
  onTratamientoChange: (id: string) => void
  onSubtratamientoChange: (id: string) => void
  onClienteSearch: (searchTerm: string) => void
  onClienteSelect: (cliente: Cliente) => void
  searchResults: Cliente[]
  showSearchResults: boolean
  searchLoading: boolean
  clienteExistente: Cliente | null
  showClienteForm: boolean
  onShowClienteForm: () => void
  clienteFormData: {
    dni: string
    nombreCompleto: string
    whatsapp: string
  }
  onClienteFormChange: (field: string, value: string) => void
  onSubmit: (data: any) => void
  loading: boolean
  cita?: CitaExtendida
}

export function FormularioCita({
  form,
  tratamientos,
  subtratamientos,
  onTratamientoChange,
  onSubtratamientoChange,
  onClienteSearch,
  onClienteSelect,
  searchResults,
  showSearchResults,
  searchLoading,
  clienteExistente,
  showClienteForm,
  onShowClienteForm,
  clienteFormData,
  onClienteFormChange,
  onSubmit,
  loading,
  cita
}: FormularioCitaProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [fecha, setFecha] = useState<Date | undefined>(cita?.fecha ? new Date(cita.fecha) : undefined)
  const [horaInicio, setHoraInicio] = useState(cita?.horaInicio || "")
  const [horaFin, setHoraFin] = useState(cita?.horaFin || "")
  const [dni, setDni] = useState(cita?.dni || "")
  const [nombreCompleto, setNombreCompleto] = useState(cita?.nombreCompleto || "")
  const [whatsapp, setWhatsapp] = useState(cita?.whatsapp || "")
  const [tratamiento, setTratamiento] = useState(cita?.tratamiento_id || "")
  const [subTratamiento, setSubTratamiento] = useState(cita?.subtratamiento_id || "")
  const [color, setColor] = useState(cita?.color || "#3b82f6")
  const [duracionSeleccionada, setDuracionSeleccionada] = useState<number | null>(cita?.duracion || null)
  const [precioSeleccionado, setPrecioSeleccionado] = useState<number | null>(cita?.precio || null)
  const [senia, setSenia] = useState<string>(cita?.sena?.toString() || "0")
  const [notas, setNotas] = useState(cita?.notas || "")
  const [boxId, setBoxId] = useState<number>(cita?.box_id ? Number(cita.box_id) : 1)
  const [loadingForm, setLoadingForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoCita>(validarEstadoCita(cita?.estado))
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<SubTratamiento | null>(null)
  const [subTratamientosFiltrados, setSubTratamientosFiltrados] = useState<SubTratamiento[]>([])
  const [clienteEncontrado, setClienteEncontrado] = useState<{
    nombreCompleto: string;
    whatsapp: string;
  } | null>(null)
  const [buscandoCliente, setBuscandoCliente] = useState(false)

  const horas = Array.from({ length: 13 }, (_, i) => {
    const hora = i + 8 // 8am a 8pm
    return {
      value: `${hora}:00`,
      label: `${hora}:00`,
    }
  })

  // Generar opciones de horas y minutos más detalladas (cada 15 minutos)
  const horasDetalladas = []
  for (let hora = 8; hora <= 20; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 15) {
      const horaFormateada = hora.toString().padStart(2, "0")
      const minutoFormateado = minuto.toString().padStart(2, "0")
      horasDetalladas.push({
        value: `${horaFormateada}:${minutoFormateado}`,
        label: `${horaFormateada}:${minutoFormateado}`,
      })
    }
  }

  const colores = [
    { value: "#4f46e5", label: "Azul" },
    { value: "#10b981", label: "Verde" },
    { value: "#f59e0b", label: "Naranja" },
    { value: "#ef4444", label: "Rojo" },
    { value: "#8b5cf6", label: "Púrpura" },
  ]

  // Obtener las opciones de sub-tratamientos para el tratamiento seleccionado
  const subTratamientosActuales = subtratamientos

  // Función para calcular la hora de fin basada en la duración
  const calcularHoraFin = (horaInicio: string, duracion: number) => {
    if (!horaInicio) return ""
    const [horas, minutos] = horaInicio.split(":").map(Number)
    const fecha = new Date()
    fecha.setHours(horas, minutos, 0, 0)
    const fechaFin = addMinutes(fecha, duracion)
    return format(fechaFin, "HH:mm")
  }

  // Actualizar hora de fin cuando cambia el sub-tratamiento o la hora de inicio
  useEffect(() => {
    if (subTratamientoSeleccionado && horaInicio) {
      const horaFinCalculada = calcularHoraFin(horaInicio, subTratamientoSeleccionado.duracion)
      setHoraFin(horaFinCalculada)
    }
  }, [subTratamientoSeleccionado, horaInicio])

  // Resetear el sub-tratamiento cuando cambia el tratamiento
  useEffect(() => {
    // Solo resetear si el cambio viene del usuario (no de las props iniciales)
    if (tratamiento !== cita?.tratamiento_id && !cita) {
      setSubTratamiento("")
      setDuracionSeleccionada(null)
      setPrecioSeleccionado(null)
    }
  }, [tratamiento, cita])

  // Actualizar la duración, precio y la hora de fin cuando se selecciona un sub-tratamiento
  useEffect(() => {
    if (subTratamiento && horaInicio) {
      const subTratamientoSeleccionado = subTratamientosActuales.find((st) => st.id === subTratamiento)
      if (subTratamientoSeleccionado) {
        setDuracionSeleccionada(subTratamientoSeleccionado.duracion)
        setPrecioSeleccionado(subTratamientoSeleccionado.precio)
        const nuevaHoraFin = calcularHoraFin(horaInicio, subTratamientoSeleccionado.duracion)
        setHoraFin(nuevaHoraFin)
      }
    }
  }, [subTratamiento, horaInicio, subTratamientosActuales])

  // Actualizar la hora de fin cuando cambia la hora de inicio (si hay un sub-tratamiento seleccionado)
  useEffect(() => {
    if (duracionSeleccionada && horaInicio) {
      const nuevaHoraFin = calcularHoraFin(horaInicio, duracionSeleccionada)
      setHoraFin(nuevaHoraFin)
    }
  }, [horaInicio, duracionSeleccionada])

  // Establecer el sub-tratamiento inicial cuando se monta el componente
  useEffect(() => {
    if (cita?.subtratamiento_id && cita.tratamiento_id && tratamiento === cita.tratamiento_id) {
      const subTrat = subtratamientos.find(st => st.id === cita.subtratamiento_id)
      if (subTrat) {
        setSubTratamiento(cita.subtratamiento_id)
        setSubTratamientoSeleccionado(subTrat)
        setDuracionSeleccionada(subTrat.duracion)
        setPrecioSeleccionado(subTrat.precio)
      }
    }
  }, [cita?.subtratamiento_id, cita.tratamiento_id, tratamiento, subtratamientos])

  // Validar que la seña no sea mayor que el precio
  const validarSenia = (valor: string) => {
    const seniaNum = Number.parseFloat(valor)
    if (isNaN(seniaNum)) return "0"
    if (precioSeleccionado && seniaNum > precioSeleccionado) return precioSeleccionado.toString()
    return valor
  }

  // Cargar tratamientos al montar el componente
  useEffect(() => {
    async function cargarTratamientos() {
      try {
        if (!tratamientos || tratamientos.length === 0) {
          console.error('No hay tratamientos disponibles')
          toast({
            title: "Error",
            description: "No hay tratamientos disponibles",
            variant: "destructive"
          })
          return
        }

        // Si hay una cita existente, cargar sus datos
        if (cita && cita.tratamiento_id) {
          setTratamiento(cita.tratamiento_id)
          
          // Buscar el sub-tratamiento seleccionado
          const tratamientoEncontrado = tratamientos.find(t => t.id === cita.tratamiento_id)
          if (tratamientoEncontrado) {
            setSubTratamientosFiltrados(tratamientoEncontrado.sub_tratamientos)
            
            if (cita.subtratamiento_id) {
              const subTratamientoId = String(cita.subtratamiento_id)
              const subTrat = tratamientoEncontrado.sub_tratamientos.find(
                st => st.id === subTratamientoId
              )
              
              if (subTrat) {
                setSubTratamiento(subTratamientoId)
                setSubTratamientoSeleccionado(subTrat)
                setDuracionSeleccionada(subTrat.duracion)
                setPrecioSeleccionado(subTrat.precio)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar tratamientos:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los tratamientos",
          variant: "destructive"
        })
      }
    }

    cargarTratamientos()
  }, [cita, tratamientos, toast])

  // Función mejorada para buscar cliente por DNI
  const buscarClientePorDNI = async (dni: string) => {
    if (!dni || dni.length < 7) return

    setBuscandoCliente(true)
    try {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('nombre_completo, telefono')
        .eq('dni', dni)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el cliente
          setClienteEncontrado(null)
          return
        }
        throw error
      }

      if (cliente) {
        setClienteEncontrado({
          nombreCompleto: cliente.nombre_completo,
          whatsapp: cliente.telefono || ''
        })
        setNombreCompleto(cliente.nombre_completo)
        setWhatsapp(cliente.telefono || '')
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error)
      toast({
        title: "Error",
        description: "Error al buscar el cliente",
        variant: "destructive"
      })
    } finally {
      setBuscandoCliente(false)
    }
  }

  // Función para obtener o crear un turno compartido
  async function obtenerTurnoCompartido(
    tratamientoId: string,
    fecha: Date,
    horaInicio: string,
    boxId: number,
    maxClientes: number
  ) {
    const { data, error } = await supabase
      .rpc('obtener_o_crear_turno_compartido', {
        p_tratamiento_id: tratamientoId,
        p_fecha: format(fecha, 'yyyy-MM-dd'),
        p_hora_inicio: horaInicio,
        p_box_id: boxId,
        p_max_clientes: maxClientes
      })

    if (error) throw error
    return data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteExistente && !showClienteForm) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cliente existente o crear uno nuevo",
        variant: "destructive"
      })
      return
    }

    const formData = {
      ...form.getValues(),
      tratamiento_id: tratamiento,
      subtratamiento_id: subTratamiento,
      cliente_id: clienteExistente?.id,
      sena: form.getValues().sena || 0,
      box_id: form.getValues().box_id || null,
      estado: cita?.estado || "reservado" as const
    }

    onSubmit(formData)
  }

  useEffect(() => {
    if (fecha) {
      setFecha(fecha)
    }
    if (horaInicio) {
      setHoraInicio(horaInicio)

      // Si no hay un sub-tratamiento seleccionado, sugerir una hora de fin (1 hora después)
      if (!duracionSeleccionada) {
        const [hora, minuto] = horaInicio.split(":").map(Number)
        if (!isNaN(hora) && hora < 20) {
          // Asegurarse de que no pase de las 8pm
          setHoraFin(`${(hora + 1).toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`)
        }
      }
    }
  }, [fecha, horaInicio, duracionSeleccionada])

  useEffect(() => {
    if (tratamiento) {
      const t = tratamientos.find((t) => t.id === tratamiento)
      setSubTratamientosFiltrados(t ? t.sub_tratamientos : [])
    } else {
      setSubTratamientosFiltrados([])
    }
  }, [tratamiento, tratamientos])

  // Actualizar el sub-tratamiento seleccionado cuando cambia la selección
  useEffect(() => {
    if (subTratamiento) {
      const subTrat = subTratamientosFiltrados.find(st => st.id === subTratamiento)
      setSubTratamientoSeleccionado(subTrat || null)
    } else {
      setSubTratamientoSeleccionado(null)
    }
  }, [subTratamiento, subTratamientosFiltrados])

  useEffect(() => {
    if (boxId) {
      setBoxId(boxId)
    }
  }, [boxId])

  // Función para obtener el color basado en el estado
  const getColorByEstado = (estado: string) => {
    switch (estado) {
      case "reservado":
        return "#60a5fa" // Azul claro
      case "seniado":
        return "#f97316" // Naranja
      case "confirmado":
        return "#22c55e" // Verde
      case "cancelado":
        return "#ef4444" // Rojo
      default:
        return "#3b82f6" // Azul por defecto
    }
  }

  // Actualizar el color cuando cambia el estado
  useEffect(() => {
    setColor(getColorByEstado(estado))
  }, [estado])

  // En las comparaciones de estado, usar los estados correctos
  const isDisabled = citaEstaDeshabilitada(cita?.estado)

  return (
    <ScrollArea className="h-[600px] pr-4 bg-background" suppressHydrationWarning>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium">Datos del Cliente</h3>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <Label htmlFor="dni">DNI</Label>
              <div className="flex gap-2">
                <Input 
                  id="dni" 
                  placeholder="12345678" 
                  value={dni} 
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setDni(valor)
                    if (valor.length >= 7) {
                      buscarClientePorDNI(valor)
                    }
                  }}
                  maxLength={10}
                  className="w-full"
                  required 
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => router.push('/clientes')}
                  title="Gestionar Clientes"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="col-span-9">
              <Label htmlFor="nombreCompleto">Nombre Completo</Label>
              <Input
                id="nombreCompleto"
                placeholder="Nombre y apellido del cliente"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                required
              />
            </div>

            <div className="col-span-12">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="Ej: +54 9 11 1234-5678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>
          </div>

          {buscandoCliente && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4 animate-spin" />
              Buscando cliente...
            </div>
          )}
        </div>

        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium">Datos del Tratamiento</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tratamiento">Tratamiento</Label>
              <Select value={tratamiento} onValueChange={setTratamiento} required>
                <SelectTrigger id="tratamiento">
                  <SelectValue placeholder="Seleccionar tratamiento" />
                </SelectTrigger>
                <SelectContent>
                  {tratamientos.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subTratamientosFiltrados.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="subTratamiento">Sub-Tratamiento</Label>
                <Select
                  value={subTratamiento}
                  onValueChange={(value) => {
                    setSubTratamiento(value)
                    onSubtratamientoChange(value)
                  }}
                  disabled={isDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un sub-tratamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {subTratamientosFiltrados.map((subTrat) => (
                      <SelectItem key={subTrat.id} value={subTrat.id}>
                        {subTrat.nombre} - {Math.floor(subTrat.duracion / 60)}h {subTrat.duracion % 60}m - ${subTrat.precio.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {precioSeleccionado && (
            <div className="grid gap-2">
              <Label htmlFor="senia">
                Seña <span className="text-xs text-muted-foreground">(opcional)</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senia"
                  type="number"
                  min="0"
                  max={precioSeleccionado}
                  className="pl-8"
                  placeholder="Monto de seña"
                  value={senia}
                  onChange={(e) => setSenia(validarSenia(e.target.value))}
                />
              </div>
              <p className="text-xs text-muted-foreground">Monto máximo: ${precioSeleccionado.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium">Fecha y Hora</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground")}
                    suppressHydrationWarning
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fecha} onSelect={setFecha} initialFocus locale={es} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="horaInicio">Hora de inicio</Label>
              <Select value={horaInicio} onValueChange={setHoraInicio} required>
                <SelectTrigger id="horaInicio">
                  <SelectValue placeholder="Inicio" />
                </SelectTrigger>
                <SelectContent>
                  {horasDetalladas.map((hora) => (
                    <SelectItem key={hora.value} value={hora.value}>
                      {hora.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium">Opciones Adicionales</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="box">Box (1-8)</Label>
              <Input
                id="box"
                type="number"
                min={1}
                max={8}
                value={boxId}
                onChange={(e) => {
                  const valor = Number(e.target.value)
                  if (valor >= 1 && valor <= 8) {
                    setBoxId(valor)
                  }
                }}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estado">Estado de la cita</Label>
              <Select
                value={estado}
                onValueChange={(value: "reservado" | "seniado" | "confirmado" | "cancelado") => setEstado(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reservado">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#60a5fa]" />
                      Reservado
                    </div>
                  </SelectItem>
                  <SelectItem value="seniado">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                      Señado
                    </div>
                  </SelectItem>
                  <SelectItem value="confirmado">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                      Confirmado
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelado">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                      Cancelado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales"
              className="min-h-[80px]"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between space-x-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/carrito')}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Ir al Carrito
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onShowClienteForm()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || isDisabled}>
              {loading ? "Guardando..." : "Guardar cita"}
            </Button>
          </div>
        </div>
      </form>
    </ScrollArea>
  )
}
