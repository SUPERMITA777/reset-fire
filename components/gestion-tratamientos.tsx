"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { format, addDays, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { 
  getTratamientos, 
  crearTratamientoDB, 
  crearSubTratamientoDB, 
  eliminarTratamientoDB, 
  eliminarSubTratamientoDB,
  verificarBaseDatos,
  crearTablasNecesarias,
  actualizarTratamientoDB,
  actualizarSubTratamientoDB,
  getFechasDisponibles,
  crearFechaDisponible,
  eliminarFechaDisponible
} from "@/lib/supabase"
import { toZonedTime } from 'date-fns-tz'

interface Tratamiento {
  id: string
  nombre: string
  sub_tratamientos?: SubTratamiento[]
  fechas_disponibles?: FechaDisponible[]
}

interface SubTratamiento {
  id: string
  nombre: string
  duracion: number // en minutos
  precio: number
}

interface FechaDisponible {
  id: string
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  boxes_disponibles: number[]
  hora_inicio: string
  hora_fin: string
  created_at: string
  updated_at: string
}

interface DisponibilidadTratamiento {
  fecha_inicio: string
  fecha_fin: string
  boxes_disponibles: number[]
  hora_inicio: string
  hora_fin: string
}

export function GestionTratamientos() {
  const { toast } = useToast()
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [tratamientoEdicion, setTratamientoEdicion] = useState<Tratamiento | null>(null)
  const [subTratamientoEdicion, setSubTratamientoEdicion] = useState<SubTratamiento | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [tipoDialogo, setTipoDialogo] = useState<"tratamiento" | "subTratamiento" | "fechaDisponible">("tratamiento")
  const [dialogoDisponibilidad, setDialogoDisponibilidad] = useState(false)
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<Tratamiento | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadTratamiento>({
    fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
    fecha_fin: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    boxes_disponibles: [1, 2, 3, 4, 5, 6, 7, 8],
    hora_inicio: "08:00",
    hora_fin: "20:00"
  })

  const boxes = [1, 2, 3, 4, 5, 6, 7, 8]

  useEffect(() => {
    verificarYConfigurarBaseDatos()
  }, [])

  async function verificarYConfigurarBaseDatos() {
    try {
      // Verificar estado de la base de datos
      const { ok, error, missingTables } = await verificarBaseDatos()
      
      if (!ok) {
        if (missingTables) {
          // Si faltan tablas, intentar crearlas
          const { ok: okCreacion, error: errorCreacion } = await crearTablasNecesarias()
          if (!okCreacion) {
            toast({ 
              title: "Error", 
              description: `Error al crear tablas: ${errorCreacion}`, 
              variant: "destructive" 
            })
            return
          }
        } else {
          toast({ 
            title: "Error", 
            description: `Error de base de datos: ${error}`, 
            variant: "destructive" 
          })
          return
        }
      }

      // Si todo está bien, cargar los tratamientos
      await cargarTratamientos()
    } catch (error) {
      console.error('Error al verificar base de datos:', error)
      toast({ 
        title: "Error", 
        description: "Error al verificar la base de datos", 
        variant: "destructive" 
      })
    }
  }

  async function cargarTratamientos() {
    setLoading(true)
    try {
      const data = await getTratamientos()
      setTratamientos(data)
    } catch (e) {
      toast({ title: "Error", description: "No se pudieron cargar los tratamientos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const abrirDialogoNuevoTratamiento = () => {
    setTratamientoEdicion(null)
    setTipoDialogo("tratamiento")
    setDialogoAbierto(true)
  }

  const abrirDialogoEditarTratamiento = (tratamiento: Tratamiento) => {
    setTratamientoEdicion(tratamiento)
    setTipoDialogo("tratamiento")
    setDialogoAbierto(true)
  }

  const abrirDialogoNuevoSubTratamiento = (tratamiento: Tratamiento) => {
    setTratamientoEdicion(tratamiento)
    setSubTratamientoEdicion(null)
    setTipoDialogo("subTratamiento")
    setDialogoAbierto(true)
  }

  const abrirDialogoEditarSubTratamiento = (tratamiento: Tratamiento, subTratamiento: SubTratamiento) => {
    setTratamientoEdicion(tratamiento)
    setSubTratamientoEdicion(subTratamiento)
    setTipoDialogo("subTratamiento")
    setDialogoAbierto(true)
  }

  const guardarTratamiento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nombre = formData.get("nombre") as string
    const id = formData.get("id") as string

    if (tratamientoEdicion) {
      // Editar tratamiento existente
      await editarTratamiento(tratamientoEdicion.id, nombre)
    } else {
      // Crear nuevo tratamiento
      await crearTratamiento(nombre)
    }
    setDialogoAbierto(false)
  }

  const guardarSubTratamiento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nombre = formData.get("nombre") as string
    const duracion = Number(formData.get("duracion"))
    const precio = Number(formData.get("precio"))
    const id = formData.get("id") as string

    if (!tratamientoEdicion) return

    if (subTratamientoEdicion) {
      // Editar sub-tratamiento existente
      await editarSubTratamiento(subTratamientoEdicion.id, nombre, duracion, precio)
    } else {
      // Crear nuevo sub-tratamiento
      await crearSubTratamiento(tratamientoEdicion.id, nombre, duracion, precio)
    }
    setDialogoAbierto(false)
  }

  async function eliminarTratamiento(tratamiento: Tratamiento) {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este tratamiento?")) return

    try {
      await eliminarTratamientoDB(tratamiento.id)
      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Tratamiento eliminado correctamente." 
      })
    } catch (error) {
      console.error('Error al eliminar tratamiento:', error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Error al eliminar el tratamiento", 
        variant: "destructive" 
      })
    }
  }

  async function eliminarSubTratamiento(tratamiento: Tratamiento, subTratamiento: SubTratamiento) {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este sub-tratamiento?")) return

    try {
      await eliminarSubTratamientoDB(subTratamiento.id)
      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Sub-tratamiento eliminado correctamente." 
      })
    } catch (error) {
      console.error('Error al eliminar sub-tratamiento:', error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Error al eliminar el sub-tratamiento", 
        variant: "destructive" 
      })
    }
  }

  async function crearTratamiento(nombre: string) {
    try {
      console.log('Iniciando creación de tratamiento:', { nombre })

      if (!nombre?.trim()) {
        toast({ 
          title: "Error", 
          description: "El nombre del tratamiento es requerido", 
          variant: "destructive" 
        })
        return
      }

      const tratamiento = await crearTratamientoDB(nombre)
      console.log('Tratamiento creado:', tratamiento)
      
      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Tratamiento creado correctamente." 
      })
    } catch (error) {
      console.error('Error al crear tratamiento:', error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Error al crear el tratamiento", 
        variant: "destructive" 
      })
    }
  }

  async function editarTratamiento(id: string, nombre: string) {
    try {
      await actualizarTratamientoDB(id, nombre)
      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Tratamiento actualizado correctamente." 
      })
    } catch (error) {
      console.error('Error al editar tratamiento:', error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Error al editar el tratamiento", 
        variant: "destructive" 
      })
    }
  }

  async function crearSubTratamiento(tratamiento_id: string, nombre: string, duracion: number, precio: number) {
    try {
      console.log('Iniciando creación de sub-tratamiento:', { tratamiento_id, nombre, duracion, precio })

      // Validaciones
      if (!tratamiento_id?.trim()) {
        toast({ 
          title: "Error", 
          description: "Debe seleccionar un tratamiento", 
          variant: "destructive" 
        })
        return
      }

      if (!nombre?.trim()) {
        toast({ 
          title: "Error", 
          description: "El nombre del sub-tratamiento es requerido", 
          variant: "destructive" 
        })
        return
      }

      if (!duracion || duracion <= 0) {
        toast({ 
          title: "Error", 
          description: "La duración debe ser mayor a 0", 
          variant: "destructive" 
        })
        return
      }

      if (!precio || precio < 0) {
        toast({ 
          title: "Error", 
          description: "El precio debe ser mayor o igual a 0", 
          variant: "destructive" 
        })
        return
      }

      const subTratamiento = await crearSubTratamientoDB(tratamiento_id, nombre, duracion, precio)
      console.log('Sub-tratamiento creado:', subTratamiento)
      
      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Sub-tratamiento creado correctamente." 
      })
    } catch (error) {
      console.error('Error al crear sub-tratamiento:', error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Error al crear el sub-tratamiento", 
        variant: "destructive" 
      })
    }
  }

  async function editarSubTratamiento(id: string, nombre: string, duracion: number, precio: number) {
    try {
      await actualizarSubTratamientoDB(id, nombre, duracion, precio)
      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Sub-tratamiento actualizado correctamente." 
      })
    } catch (error) {
      console.error('Error al editar sub-tratamiento:', error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Error al editar el sub-tratamiento", 
        variant: "destructive" 
      })
    }
  }

  const handleAbrirDisponibilidad = async (tratamiento: Tratamiento) => {
    setTratamientoSeleccionado(tratamiento)
    try {
      const fechas = await getFechasDisponibles(tratamiento.id)
      setTratamientoSeleccionado(prev => prev ? { ...prev, fechas_disponibles: fechas } : null)
    } catch (error) {
      console.error('Error al cargar fechas disponibles:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las fechas disponibles",
        variant: "destructive"
      })
    }
    setDialogoDisponibilidad(true)
  }

  const handleGuardarDisponibilidad = async () => {
    if (!tratamientoSeleccionado) return

    try {
      await crearFechaDisponible(
        tratamientoSeleccionado.id,
        disponibilidad.fecha_inicio,
        disponibilidad.fecha_fin,
        disponibilidad.boxes_disponibles,
        disponibilidad.hora_inicio,
        disponibilidad.hora_fin
      )

      toast({
        title: "Disponibilidad actualizada",
        description: "La disponibilidad del tratamiento se ha actualizado correctamente"
      })

      // Recargar fechas disponibles
      const fechas = await getFechasDisponibles(tratamientoSeleccionado.id)
      setTratamientoSeleccionado(prev => prev ? { ...prev, fechas_disponibles: fechas } : null)
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la disponibilidad del tratamiento",
        variant: "destructive"
      })
    }
  }

  const handleEliminarFechaDisponible = async (fechaId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este rango de fechas?")) return

    try {
      await eliminarFechaDisponible(fechaId)
      
      if (tratamientoSeleccionado) {
        const fechas = await getFechasDisponibles(tratamientoSeleccionado.id)
        setTratamientoSeleccionado(prev => prev ? { ...prev, fechas_disponibles: fechas } : null)
      }

      toast({
        title: "Fecha eliminada",
        description: "El rango de fechas se ha eliminado correctamente"
      })
    } catch (error) {
      console.error('Error al eliminar fecha disponible:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el rango de fechas",
        variant: "destructive"
      })
    }
  }

  const handleAbrirEditarTratamiento = (tratamiento: Tratamiento) => {
    setTratamientoSeleccionado(tratamiento)
    setNuevoNombre(tratamiento.nombre)
    setTipoDialogo("tratamiento")
    setDialogoAbierto(true)
  }

  const handleEditarTratamiento = async () => {
    if (!tratamientoSeleccionado || !nuevoNombre.trim()) return

    try {
      await actualizarTratamientoDB(tratamientoSeleccionado.id, {
        nombre: nuevoNombre.trim()
      })

      toast({
        title: "Tratamiento actualizado",
        description: "El tratamiento se ha actualizado correctamente"
      })

      // Recargar tratamientos
      const tratamientosActualizados = await getTratamientos()
      setTratamientos(tratamientosActualizados)
      setDialogoAbierto(false)
    } catch (error) {
      console.error('Error al actualizar tratamiento:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el tratamiento",
        variant: "destructive"
      })
    }
  }

  const handleCrearTratamiento = async () => {
    if (!nuevoNombre.trim()) return

    try {
      const tratamiento = await crearTratamientoDB(nuevoNombre.trim())
      setNuevoNombre("")
      setDialogoAbierto(false)

      // Recargar tratamientos
      const tratamientosActualizados = await getTratamientos()
      setTratamientos(tratamientosActualizados)

      toast({
        title: "Tratamiento creado",
        description: "El tratamiento se ha creado correctamente"
      })
    } catch (error) {
      console.error('Error al crear tratamiento:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el tratamiento",
        variant: "destructive"
      })
    }
  }

  // Función para convertir una fecha a la zona horaria de Argentina
  const convertirFechaArgentina = (fechaStr: string) => {
    const fecha = parseISO(fechaStr)
    return toZonedTime(fecha, 'America/Argentina/Buenos_Aires')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Tratamientos</h2>
        <Button onClick={abrirDialogoNuevoTratamiento}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tratamiento
        </Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {tratamientos.map((tratamiento) => (
            <Card key={tratamiento.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{tratamiento.nombre}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAbrirDisponibilidad(tratamiento)}
                    className="gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Disponibilidad
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAbrirEditarTratamiento(tratamiento)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirDialogoNuevoSubTratamiento(tratamiento)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Sub-tratamiento
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => eliminarTratamiento(tratamiento)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(tratamiento.sub_tratamientos || []).map((subTratamiento) => (
                    <div
                      key={subTratamiento.id}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <div>
                        <div className="font-medium">{subTratamiento.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor(subTratamiento.duracion / 60) > 0
                            ? `${Math.floor(subTratamiento.duracion / 60)}h ${
                                subTratamiento.duracion % 60 > 0 ? `${subTratamiento.duracion % 60}m` : ""
                              }`
                            : `${subTratamiento.duracion}m`}{" "}
                          - ${subTratamiento.precio.toLocaleString()}
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirDialogoEditarSubTratamiento(tratamiento, subTratamiento)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => eliminarSubTratamiento(tratamiento, subTratamiento)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tipoDialogo === "tratamiento"
                ? tratamientoEdicion
                  ? "Editar Tratamiento"
                  : "Nuevo Tratamiento"
                : subTratamientoEdicion
                ? "Editar Sub-tratamiento"
                : "Nuevo Sub-tratamiento"}
            </DialogTitle>
            <DialogDescription>
              {tipoDialogo === "tratamiento"
                ? "Complete los datos del tratamiento"
                : "Complete los datos del sub-tratamiento"}
            </DialogDescription>
          </DialogHeader>

          {tipoDialogo === "tratamiento" ? (
            <form onSubmit={guardarTratamiento} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID (opcional)</Label>
                <Input
                  id="id"
                  name="id"
                  placeholder="Ej: depilacion_laser"
                  defaultValue={tratamientoEdicion?.id}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre del tratamiento"
                  defaultValue={tratamientoEdicion?.nombre}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogoAbierto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={guardarSubTratamiento} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID (opcional)</Label>
                <Input
                  id="id"
                  name="id"
                  placeholder="Ej: piernas_completas"
                  defaultValue={subTratamientoEdicion?.id}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre del sub-tratamiento"
                  defaultValue={subTratamientoEdicion?.nombre}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración (minutos)</Label>
                <Input
                  id="duracion"
                  name="duracion"
                  type="number"
                  min="15"
                  step="15"
                  placeholder="Duración en minutos"
                  defaultValue={subTratamientoEdicion?.duracion}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Precio en pesos"
                  defaultValue={subTratamientoEdicion?.precio}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogoAbierto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogoDisponibilidad} onOpenChange={setDialogoDisponibilidad}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar Disponibilidad</DialogTitle>
            <DialogDescription>
              Configura los rangos de fechas, horarios y boxes disponibles para {tratamientoSeleccionado?.nombre}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Rangos de fechas existentes */}
            {tratamientoSeleccionado?.fechas_disponibles && tratamientoSeleccionado.fechas_disponibles.length > 0 && (
              <div className="space-y-4">
                <Label>Rangos de fechas configurados</Label>
                <div className="space-y-2">
                  {tratamientoSeleccionado.fechas_disponibles.map((fecha) => {
                    const fechaInicio = convertirFechaArgentina(fecha.fecha_inicio)
                    const fechaFin = convertirFechaArgentina(fecha.fecha_fin)
                    
                    return (
                      <div key={fecha.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div>
                          <div className="font-medium">
                            {format(fechaInicio, "d 'de' MMMM", { locale: es })} - {format(fechaFin, "d 'de' MMMM", { locale: es })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {fecha.hora_inicio} - {fecha.hora_fin} | Boxes: {fecha.boxes_disponibles.join(", ")}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEliminarFechaDisponible(fecha.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Nuevo rango de fechas */}
            <div className="space-y-4">
              <Label>Agregar nuevo rango de fechas</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha-inicio">Fecha de inicio</Label>
                  <Input
                    id="fecha-inicio"
                    type="date"
                    value={disponibilidad.fecha_inicio}
                    onChange={(e) => setDisponibilidad(prev => ({
                      ...prev,
                      fecha_inicio: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-fin">Fecha de fin</Label>
                  <Input
                    id="fecha-fin"
                    type="date"
                    value={disponibilidad.fecha_fin}
                    onChange={(e) => setDisponibilidad(prev => ({
                      ...prev,
                      fecha_fin: e.target.value
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Boxes disponibles */}
            <div className="space-y-4">
              <Label>Boxes disponibles</Label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {boxes.map((box) => (
                  <div key={box} className="flex items-center space-x-2">
                    <Checkbox
                      id={`box-${box}`}
                      checked={disponibilidad.boxes_disponibles.includes(box)}
                      onCheckedChange={(checked) => {
                        setDisponibilidad(prev => ({
                          ...prev,
                          boxes_disponibles: checked
                            ? [...prev.boxes_disponibles, box]
                            : prev.boxes_disponibles.filter(b => b !== box)
                        }))
                      }}
                    />
                    <Label htmlFor={`box-${box}`}>Box {box}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Horario */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora-inicio">Hora de inicio</Label>
                <Input
                  id="hora-inicio"
                  type="time"
                  value={disponibilidad.hora_inicio}
                  onChange={(e) => setDisponibilidad(prev => ({
                    ...prev,
                    hora_inicio: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora-fin">Hora de fin</Label>
                <Input
                  id="hora-fin"
                  type="time"
                  value={disponibilidad.hora_fin}
                  onChange={(e) => setDisponibilidad(prev => ({
                    ...prev,
                    hora_fin: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogoDisponibilidad(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleGuardarDisponibilidad}>
                Agregar rango de fechas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
