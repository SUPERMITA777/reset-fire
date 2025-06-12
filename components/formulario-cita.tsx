"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, toZonedTime } from "date-fns-tz"
import { addMinutes, parse } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, DollarSign, Search, UserPlus, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTratamientos, verificarDisponibilidadBox, supabase } from "@/lib/supabase"
import type { Cita } from "@/types/cita"

interface FormularioCitaProps {
  fechaInicial?: Date
  horaInicialInicio?: string
  horaInicialFin?: string
  tratamientoInicial?: string
  subTratamientoInicial?: string
  boxInicial?: number
  onSuccess?: () => void
  citaExistente?: Cita & {
    dni?: string
    nombreCompleto?: string
    whatsapp?: string
    color?: string
  }
}

// Actualizar los tipos para manejar correctamente los IDs
type Tratamiento = {
  id: string  // Cambiado a string para coincidir con la base de datos
  nombre: string
  sub_tratamientos: SubTratamiento[]
  max_clientes_por_turno: number
}

type SubTratamiento = {
  id: string  // Cambiado a string para coincidir con la base de datos
  nombre: string
  duracion: number
  precio: number
}

// Modificar la interfaz de la cita para que coincida con la base de datos
interface NuevaCita {
  id: string
  cliente_id?: string
  dni: string
  nombreCompleto: string
  whatsapp: string
  fecha: string
  horaInicio: string
  horaFin: string
  tratamiento_id: string
  subtratamiento_id: string
  color: string
  duracion?: number
  precio?: number
  sena: number
  notas: string
  box: number
  estado: "reservado" | "seniado" | "confirmado" | "cancelado"
}

export function FormularioCita({
  fechaInicial,
  horaInicialInicio,
  horaInicialFin,
  tratamientoInicial,
  subTratamientoInicial,
  boxInicial,
  onSuccess,
  citaExistente
}: FormularioCitaProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [fecha, setFecha] = useState<Date | undefined>(fechaInicial || undefined)
  const [horaInicio, setHoraInicio] = useState(horaInicialInicio || "")
  const [horaFin, setHoraFin] = useState(horaInicialFin || "")
  const [dni, setDni] = useState(citaExistente?.dni || "")
  const [nombreCompleto, setNombreCompleto] = useState(citaExistente?.nombreCompleto || "")
  const [whatsapp, setWhatsapp] = useState(citaExistente?.whatsapp || "")
  const [tratamiento, setTratamiento] = useState(tratamientoInicial || citaExistente?.tratamiento || "")
  const [subTratamiento, setSubTratamiento] = useState(subTratamientoInicial || citaExistente?.subTratamiento || "")
  const [color, setColor] = useState(citaExistente?.color || "#3b82f6")
  const [duracionSeleccionada, setDuracionSeleccionada] = useState<number | null>(citaExistente?.duracion || null)
  const [precioSeleccionado, setPrecioSeleccionado] = useState<number | null>(citaExistente?.precio || null)
  const [senia, setSenia] = useState<string>(citaExistente?.senia?.toString() || "0")
  const [notas, setNotas] = useState(citaExistente?.notas || "")
  const [boxId, setBoxId] = useState<number>(boxInicial || citaExistente?.box_id || 1)
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [subTratamientos, setSubTratamientos] = useState<SubTratamiento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState<"reservado" | "seniado" | "confirmado" | "cancelado">(
    citaExistente?.estado || "reservado"
  )
  const [subTratamientoSeleccionado, setSubTratamientoSeleccionado] = useState<SubTratamiento | null>(null)
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
  const subTratamientosActuales = subTratamientos

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
    if (tratamiento !== tratamientoInicial && !citaExistente) {
      setSubTratamiento("")
      setDuracionSeleccionada(null)
      setPrecioSeleccionado(null)
    }
  }, [tratamiento, tratamientoInicial, citaExistente])

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
    if (subTratamientoInicial && tratamientoInicial && tratamiento === tratamientoInicial) {
      const subTrat = subTratamientos.find(st => st.id === subTratamientoInicial)
      if (subTrat) {
        setSubTratamiento(subTratamientoInicial)
        setSubTratamientoSeleccionado(subTrat)
        setDuracionSeleccionada(subTrat.duracion)
        setPrecioSeleccionado(subTrat.precio)
      }
    }
  }, [subTratamientoInicial, tratamientoInicial, tratamiento, subTratamientos])

  // Validar que la seña no sea mayor que el precio
  const validarSenia = (valor: string) => {
    const seniaNum = Number.parseFloat(valor)
    if (isNaN(seniaNum)) return "0"
    if (precioSeleccionado && seniaNum > precioSeleccionado) return precioSeleccionado.toString()
    return valor
  }

  // Cargar tratamientos al montar el componente
  useEffect(() => {
    const cargarTratamientos = async () => {
      try {
        const { data, error } = await supabase
          .from('tratamientos')
          .select(`
            id,
            nombre,
            max_clientes_por_turno,
            sub_tratamientos (
              id,
              nombre,
              duracion,
              precio
            )
          `)
          .order('nombre')

        if (error) throw error

        if (data) {
          // Asegurarnos de que sub_tratamientos nunca sea undefined y convertir IDs a string
          const tratamientosFormateados = data.map(t => {
            const tratamientoBase = {
              ...t,
              id: String(t.id)
            }
            return {
              ...tratamientoBase,
              sub_tratamientos: (t.sub_tratamientos || []).map(st => ({
                ...st,
                id: String(st.id)
              }))
            }
          }) as Tratamiento[]
          
          setTratamientos(tratamientosFormateados)

          // Si hay una cita existente, cargar sus datos
          if (citaExistente) {
            if (citaExistente.tratamiento) {
              const tratamientoId = String(citaExistente.tratamiento)
              setTratamiento(tratamientoId)
              
              // Buscar el sub-tratamiento seleccionado
              const tratamientoEncontrado = tratamientosFormateados.find(t => t.id === tratamientoId)
              if (tratamientoEncontrado) {
                setSubTratamientos(tratamientoEncontrado.sub_tratamientos)
                
                if (citaExistente.subTratamiento) {
                  const subTratamientoId = String(citaExistente.subTratamiento)
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
  }, [citaExistente])

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
    setLoading(true)
    setError(null)

    try {
      // Validaciones básicas
      if (!fecha || !horaInicio || !tratamiento || !subTratamiento) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive"
        })
        return
      }

      // Si es una cita existente, actualizar
      if (citaExistente?.id) {
        // Primero actualizar el cliente si es necesario
        let clienteId = citaExistente.cliente_id
        if (dni !== citaExistente.dni || nombreCompleto !== citaExistente.nombreCompleto || whatsapp !== citaExistente.whatsapp) {
          const { data: clienteData, error: clienteError } = await supabase
            .from("rf_clientes")
            .upsert({
              dni,
              nombre_completo: nombreCompleto,
              whatsapp: whatsapp || null
            })
            .select("id")
            .single()

          if (clienteError) {
            console.error("Error al actualizar cliente:", clienteError)
            throw new Error(`Error al actualizar cliente: ${clienteError.message}`)
          }

          if (!clienteData) {
            throw new Error("No se pudo actualizar el cliente")
          }

          clienteId = clienteData.id
        }

        // Actualizar la cita
        const { error: citaError } = await supabase
          .from("rf_citas")
          .update({
            cliente_id: clienteId,
            tratamiento_id: tratamiento,
            subtratamiento_id: subTratamiento,
            fecha: format(fecha, "yyyy-MM-dd"),
            hora: horaInicio,
            box: boxId,
            estado: estado === "completado" ? "confirmado" : (estado as "reservado" | "confirmado" | "cancelado"),
            precio: precioSeleccionado,
            sena: parseFloat(senia) || 0,
            notas: notas || null
          })
          .eq("id", citaExistente.id)

        if (citaError) {
          console.error("Error al actualizar cita:", citaError)
          throw new Error(`Error al actualizar cita: ${citaError.message}`)
        }

        toast({
          title: "Éxito",
          description: "Cita actualizada correctamente"
        })
      } else {
        // Crear nuevo cliente
        const { data: clienteData, error: clienteError } = await supabase
          .from("rf_clientes")
          .insert({
            dni,
            nombre_completo: nombreCompleto,
            whatsapp: whatsapp || null
          })
          .select("id")
          .single()

        if (clienteError) {
          console.error("Error al crear cliente:", clienteError)
          throw new Error(`Error al crear cliente: ${clienteError.message}`)
        }

        if (!clienteData) {
          throw new Error("No se pudo crear el cliente")
        }

        // Crear nueva cita
        const { error: citaError } = await supabase
          .from("rf_citas")
          .insert({
            cliente_id: clienteData.id,
            tratamiento_id: tratamiento,
            subtratamiento_id: subTratamiento,
            fecha: format(fecha, "yyyy-MM-dd"),
            hora: horaInicio,
            box: boxId,
            estado: estado === "completado" ? "confirmado" : (estado as "reservado" | "confirmado" | "cancelado"),
            precio: precioSeleccionado,
            sena: parseFloat(senia) || 0,
            notas: notas || null
          })

        if (citaError) {
          console.error("Error al crear cita:", citaError)
          throw new Error(`Error al crear cita: ${citaError.message}`)
        }

        toast({
          title: "Éxito",
          description: "Cita creada correctamente"
        })
      }

      // Limpiar formulario y notificar éxito
      setFecha(undefined)
      setHoraInicio("")
      setHoraFin("")
      setDni("")
      setNombreCompleto("")
      setWhatsapp("")
      setTratamiento("")
      setSubTratamiento("")
      setColor("#3b82f6")
      setDuracionSeleccionada(null)
      setPrecioSeleccionado(null)
      setSenia("0")
      setNotas("")
      setBoxId(1)
      setEstado("reservado")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error)
      setError(error instanceof Error ? error.message : "Error al guardar la cita")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la cita",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fechaInicial) {
      setFecha(fechaInicial)
    }
    if (horaInicialInicio) {
      setHoraInicio(horaInicialInicio)

      // Si no hay un sub-tratamiento seleccionado, sugerir una hora de fin (1 hora después)
      if (!duracionSeleccionada) {
        const [hora, minuto] = horaInicialInicio.split(":").map(Number)
        if (!isNaN(hora) && hora < 20) {
          // Asegurarse de que no pase de las 8pm
          setHoraFin(`${(hora + 1).toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`)
        }
      }
    }
  }, [fechaInicial, horaInicialInicio, duracionSeleccionada])

  useEffect(() => {
    if (tratamiento) {
      const t = tratamientos.find((t) => t.id === tratamiento)
      setSubTratamientos(t ? t.sub_tratamientos : [])
    } else {
      setSubTratamientos([])
    }
  }, [tratamiento, tratamientos])

  // Actualizar el sub-tratamiento seleccionado cuando cambia la selección
  useEffect(() => {
    if (subTratamiento) {
      const subTrat = subTratamientos.find(st => st.id === subTratamiento)
      setSubTratamientoSeleccionado(subTrat || null)
    } else {
      setSubTratamientoSeleccionado(null)
    }
  }, [subTratamiento, subTratamientos])

  useEffect(() => {
    if (boxInicial) {
      setBoxId(boxInicial)
    }
  }, [boxInicial])

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

            {subTratamientos.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="subTratamiento">Sub-Tratamiento</Label>
                <Select
                  value={subTratamiento}
                  onValueChange={setSubTratamiento}
                  disabled={!tratamiento}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un sub-tratamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {subTratamientos.map((subTrat) => (
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
            <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cita"}
            </Button>
          </div>
        </div>
      </form>
    </ScrollArea>
  )
}
