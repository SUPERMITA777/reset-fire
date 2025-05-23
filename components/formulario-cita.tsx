"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, addMinutes, parse } from "date-fns"
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
  fechaInicial?: Date | null
  horaInicialInicio?: string | null
  horaInicialFin?: string | null
  tratamientoInicial?: string
  subTratamientoInicial?: string
  boxInicial?: number
  onSuccess?: () => void
  citaExistente?: Cita
}

// Tipo para los sub-tratamientos con duración y precio
interface SubTratamiento {
  id: string
  nombre: string
  duracion: number
  precio: number
}

// Interfaz para los tratamientos
interface Tratamiento {
  id: string
  nombre: string
  sub_tratamientos: SubTratamiento[]
}

// Modificar la interfaz de la cita para que coincida con la base de datos
interface NuevaCita {
  id: string
  dni: string
  nombreCompleto: string
  whatsapp: string
  fecha: Date
  horaInicio: string
  horaFin: string
  tratamiento: string
  subTratamiento: string
  color: string
  duracion: number | null
  precio: number | null
  senia: number
  notas: string
  box_id: number // Cambiado de box a box_id para coincidir con la DB
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
    if (!subTratamientoInicial || tratamiento !== tratamientoInicial) {
      setSubTratamiento("")
      setDuracionSeleccionada(null)
      setPrecioSeleccionado(null)
    }
  }, [tratamiento, subTratamientoInicial, tratamientoInicial])

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

  // Establecer el sub-tratamiento inicial si se proporciona
  useEffect(() => {
    if (subTratamientoInicial && tratamientoInicial && tratamiento === tratamientoInicial) {
      setSubTratamiento(subTratamientoInicial)
    }
  }, [subTratamientoInicial, tratamientoInicial, tratamiento])

  // Validar que la seña no sea mayor que el precio
  const validarSenia = (valor: string) => {
    const seniaNum = Number.parseFloat(valor)
    if (isNaN(seniaNum)) return "0"
    if (precioSeleccionado && seniaNum > precioSeleccionado) return precioSeleccionado.toString()
    return valor
  }

  // Función para buscar cliente por DNI
  const buscarClientePorDNI = async (dni: string) => {
    if (!dni || dni.length < 7) return // No buscar si el DNI es muy corto
    
    setBuscandoCliente(true)
    try {
      // Primero intentamos buscar por DNI en la tabla clientes
      const { data: cliente, error: errorCliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('dni', dni)
        .single()

      if (errorCliente) {
        // Si el error es que no se encontró el cliente, no es un error real
        if (errorCliente.code === 'PGRST116') {
          setClienteEncontrado(null)
          toast({
            title: "Cliente no encontrado",
            description: "Se creará un nuevo cliente al guardar la cita",
          })
          return
        }
        // Si es otro error, lo lanzamos con más detalles
        throw new Error(`Error al buscar cliente: ${errorCliente.message || errorCliente.details || 'Error desconocido'}`)
      }

      if (cliente) {
        setClienteEncontrado({
          nombreCompleto: cliente.nombre_completo,
          whatsapp: cliente.telefono || ''
        })
        setNombreCompleto(cliente.nombre_completo)
        setWhatsapp(cliente.telefono || '')
        toast({
          title: "Cliente encontrado",
          description: "Se han cargado los datos del cliente",
        })
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error instanceof Error ? error.message : 'Error desconocido')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo buscar el cliente. Por favor, intente nuevamente.",
        variant: "destructive"
      })
    } finally {
      setBuscandoCliente(false)
    }
  }

  // Modificar el handleSubmit para guardar/actualizar cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!nombreCompleto || !fecha || !horaInicio || !horaFin || !tratamiento || !subTratamiento) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      // Primero, guardar/actualizar el cliente
      const datosCliente = {
        dni,
        nombre_completo: nombreCompleto,
        telefono: whatsapp,
        updated_at: new Date().toISOString()
      }

      let clienteId
      try {
        if (clienteEncontrado) {
          // Actualizar cliente existente
          const { data: clienteActualizado, error: errorCliente } = await supabase
            .from('clientes')
            .update(datosCliente)
            .eq('dni', dni)
            .select()
            .single()

          if (errorCliente) {
            throw new Error(`Error al actualizar cliente: ${errorCliente.message || errorCliente.details || 'Error desconocido'}`)
          }
          clienteId = clienteActualizado.id
        } else {
          // Crear nuevo cliente
          const { data: nuevoCliente, error: errorCliente } = await supabase
            .from('clientes')
            .insert({
              ...datosCliente,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (errorCliente) {
            throw new Error(`Error al crear cliente: ${errorCliente.message || errorCliente.details || 'Error desconocido'}`)
          }
          clienteId = nuevoCliente.id
        }
      } catch (error) {
        throw new Error(`Error en operación de cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }

      const fechaStr = format(fecha, 'yyyy-MM-dd')
      
      // Verificar disponibilidad del box
      try {
        if (!citaExistente || 
            citaExistente.fecha?.toISOString().split('T')[0] !== fechaStr ||
            citaExistente.horaInicio !== horaInicio ||
            citaExistente.horaFin !== horaFin ||
            citaExistente.box_id !== boxId) {
          
          const boxDisponible = await verificarDisponibilidadBox(fechaStr, horaInicio, horaFin, boxId)
          if (!boxDisponible) {
            throw new Error("El box seleccionado no está disponible en ese horario.")
          }
        }
      } catch (error) {
        throw new Error(`Error al verificar disponibilidad: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }

      // Preparar datos para la base de datos
      const datosCita = {
        cliente_id: clienteId,
        nombre_completo: nombreCompleto,
        fecha: fechaStr,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        box_id: boxId,
        tratamiento_id: tratamiento,
        sub_tratamiento_id: subTratamiento,
        color: color,
        observaciones: notas,
        updated_at: new Date().toISOString()
      }

      let citaDB
      try {
        if (citaExistente) {
          // Actualizar cita existente
          const { data, error } = await supabase
            .from('citas')
            .update(datosCita)
            .eq('id', citaExistente.id)
            .select()
            .single()

          if (error) {
            throw new Error(`Error al actualizar cita: ${error.message || error.details || 'Error desconocido'}`)
          }
          citaDB = data
        } else {
          // Crear nueva cita
          const { data, error } = await supabase
            .from('citas')
            .insert({
              ...datosCita,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (error) {
            throw new Error(`Error al crear cita: ${error.message || error.details || 'Error desconocido'}`)
          }
          citaDB = data
        }

        toast({
          title: "Éxito",
          description: `Cita ${citaExistente ? 'actualizada' : 'agendada'} para ${nombreCompleto} el ${format(fecha, "PPP", { locale: es })} a las ${horaInicio} en Box ${boxId}.`
        })

        if (onSuccess) onSuccess()
        router.refresh()

      } catch (error) {
        throw new Error(`Error en operación de cita: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }

    } catch (error) {
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
    async function cargarTratamientos() {
      const data = await getTratamientos()
      setTratamientos(data)
    }
    cargarTratamientos()
  }, [])

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
    <ScrollArea className="h-[600px] pr-4 bg-background">
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
              {loading ? "Guardando..." : citaExistente ? "Actualizar cita" : "Guardar cita"}
            </Button>
          </div>
        </div>
      </form>
    </ScrollArea>
  )
}
