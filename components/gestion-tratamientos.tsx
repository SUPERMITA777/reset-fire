"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar as CalendarIcon, Settings2 } from "lucide-react" // Removed Pencil, Trash2, Upload, X
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" // DialogTrigger removed
// ScrollArea removed
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { format, addDays, parseISO, parse, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase"
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
  eliminarFechaDisponible,
  actualizarFechaDisponibleDB
} from "@/lib/supabase"
// toZonedTime removed
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
// Separator removed
import { Badge } from "@/components/ui/badge"
import type { Tratamiento, SubTratamiento, FechaDisponible } from "@/types/cita"
// getTratamientosApi removed
// crearFechaDisponibleApi removed

// Tipos locales
// Extend Tratamiento to include fechas_disponibles for type safety
interface TratamientoConFechas extends Tratamiento {
  fechas_disponibles?: FechaDisponible[];
}
interface DisponibilidadForm {
  id?: string
  tratamiento_id: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  boxes_disponibles: number[]
  cantidad_clientes: number
}

// DisponibilidadTratamiento interface removed as it was unused

export function GestionTratamientos() {
  const { toast } = useToast()
  const [tratamientos, setTratamientos] = useState<TratamientoConFechas[]>([])
  const [loading, setLoading] = useState(true)
  const [tratamientoEdicion, setTratamientoEdicion] = useState<Tratamiento | null>(null)
  const [subTratamientoEdicion, setSubTratamientoEdicion] = useState<SubTratamiento | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [tipoDialogo, setTipoDialogo] = useState<"tratamiento" | "subTratamiento" | "fechaDisponible">("tratamiento")
  const [dialogoDisponibilidad, setDialogoDisponibilidad] = useState(false)
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<TratamientoConFechas | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [duracion, setDuracion] = useState("")
  const [precio, setPrecio] = useState("")
  const [maxClientesPorTurno, setMaxClientesPorTurno] = useState("1")
  const [esCompartido, setEsCompartido] = useState(false)
  const [descripcionTratamiento, setDescripcionTratamiento] = useState("")
  const [descripcionSubTratamiento, setDescripcionSubTratamiento] = useState("")
  const [fotoUrlTratamiento, setFotoUrlTratamiento] = useState("")
  const [fotoUrlSubTratamiento, setFotoUrlSubTratamiento] = useState("")
  const [imagePreviewTratamiento, setImagePreviewTratamiento] = useState<string>("")
  const [imagePreviewSubTratamiento, setImagePreviewSubTratamiento] = useState<string>("")
  const [uploadingTratamiento, setUploadingTratamiento] = useState(false)
  const [uploadingSubTratamiento, setUploadingSubTratamiento] = useState(false)
  
  const supabase = createClientComponentClient<Database>()
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadForm>({
    tratamiento_id: "",
    fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
    fecha_fin: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    hora_inicio: "09:00",
    hora_fin: "18:00",
    boxes_disponibles: [],
    cantidad_clientes: 1
  })
  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = useState(false)
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = useState(false)

  const boxes = [1, 2, 3, 4, 5, 6, 7, 8]

  // Función para subir imagen de tratamiento
  const handleImageUploadTratamiento = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTratamiento(true);
      
      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `tratamientos/${fileName}`;

      // Subir la imagen a Supabase Storage usando el bucket productos
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      setFotoUrlTratamiento(publicUrl);
      setImagePreviewTratamiento(publicUrl);
      
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente.",
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setUploadingTratamiento(false);
    }
  };

  // Función para subir imagen de subtratamiento
  const handleImageUploadSubTratamiento = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSubTratamiento(true);
      
      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `subtratamientos/${fileName}`;

      // Subir la imagen a Supabase Storage usando el bucket productos
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      setFotoUrlSubTratamiento(publicUrl);
      setImagePreviewSubTratamiento(publicUrl);
      
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente.",
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setUploadingSubTratamiento(false);
    }
  };

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
    setNuevoNombre("")
    setDescripcionTratamiento("")
    setFotoUrlTratamiento("")
    setImagePreviewTratamiento("")
    setMaxClientesPorTurno("1")
    setEsCompartido(false)
    setTipoDialogo("tratamiento")
    setDialogoAbierto(true)
  }

  const abrirDialogoEditarTratamiento = (tratamiento: Tratamiento) => {
    setTratamientoEdicion(tratamiento)
    setNuevoNombre(tratamiento.nombre_tratamiento)
    setDescripcionTratamiento(tratamiento.descripcion || "")
    setFotoUrlTratamiento(tratamiento.foto_url || "")
    setImagePreviewTratamiento(tratamiento.foto_url || "")
    setMaxClientesPorTurno("1")
    setEsCompartido(false)
    setTipoDialogo("tratamiento")
    setDialogoAbierto(true)
  }

  const abrirDialogoNuevoSubTratamiento = (tratamiento: Tratamiento) => {
    setTratamientoEdicion(tratamiento)
    setSubTratamientoEdicion(null)
    setNuevoNombre("")
    setDescripcionSubTratamiento("")
    setFotoUrlSubTratamiento("")
    setImagePreviewSubTratamiento("")
    setDuracion("")
    setPrecio("")
    setTipoDialogo("subTratamiento")
    setDialogoAbierto(true)
  }

  const abrirDialogoEditarSubTratamiento = (tratamiento: Tratamiento, subTratamiento: SubTratamiento) => {
    setTratamientoEdicion(tratamiento)
    setSubTratamientoEdicion(subTratamiento)
    setNuevoNombre(subTratamiento.nombre_subtratamiento)
    setDescripcionSubTratamiento(subTratamiento.descripcion || "")
    setFotoUrlSubTratamiento(subTratamiento.foto_url || "")
    setImagePreviewSubTratamiento(subTratamiento.foto_url || "")
    setDuracion(subTratamiento.duracion.toString())
    setPrecio(subTratamiento.precio.toString())
    setTipoDialogo("subTratamiento")
    setDialogoAbierto(true)
  }

  const guardarTratamiento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nombre = formData.get("nombre") as string
    const max_clientes_por_turno = Number(formData.get("max_clientes_por_turno"))
    const es_compartido = formData.get("es_compartido") === "on"
    const id = formData.get("id") as string

    if (tratamientoEdicion) {
      // Editar tratamiento existente
      await editarTratamiento(tratamientoEdicion.id, nombre, descripcionTratamiento, fotoUrlTratamiento, max_clientes_por_turno, es_compartido)
    } else {
      // Crear nuevo tratamiento
      await crearTratamiento(nombre, descripcionTratamiento, fotoUrlTratamiento, max_clientes_por_turno, es_compartido)
    }
    setDialogoAbierto(false)
  }

  const guardarSubTratamiento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nombre = formData.get("nombre") as string
    const duracion = Number(formData.get("duracion"))
    const precio = Number(formData.get("precio"))
    const tratamiento_id = formData.get("tratamiento_id") as string
    const subtratamiento_id = formData.get("subtratamiento_id") as string

    if (subTratamientoEdicion) {
      // Editar subtratamiento existente
      await editarSubTratamiento({
        id: subTratamientoEdicion.id,
        tratamiento_id,
        nombre,
        descripcion: descripcionSubTratamiento,
        foto_url: fotoUrlSubTratamiento,
        duracion,
        precio
      })
    } else {
      // Crear nuevo subtratamiento
      await crearSubTratamiento({
        tratamiento_id,
        nombre,
        descripcion: descripcionSubTratamiento,
        foto_url: fotoUrlSubTratamiento,
        duracion,
        precio
      })
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

  async function crearTratamiento(nombre: string, descripcion: string, foto_url: string, max_clientes_por_turno: number, es_compartido: boolean) {
    try {
      // console.log('Iniciando creación de tratamiento:', { nombre, max_clientes_por_turno, es_compartido }); // Debug log removed

      if (!nombre?.trim()) {
        toast({ 
          title: "Error", 
          description: "El nombre del tratamiento es requerido", 
          variant: "destructive" 
        })
        return
      }

      await crearTratamientoDB({ // const tratamiento = removed as it's not used if not logged
        nombre,
        descripcion,
        foto_url,
        max_clientes_por_turno,
        es_compartido
      })
      // console.log('Tratamiento creado:', tratamiento); // Debug log removed
      
      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Tratamiento creado correctamente.",
        variant: "default"
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

  async function editarTratamiento(id: string, nombre: string, descripcion: string, foto_url: string, max_clientes_por_turno: number, es_compartido: boolean) {
    try {
      await actualizarTratamientoDB({
        id,
        nombre,
        descripcion,
        foto_url,
        max_clientes_por_turno,
        es_compartido
      })

      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Tratamiento actualizado correctamente.",
        variant: "default"
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

  async function crearSubTratamiento(params: {
    tratamiento_id: string
    nombre: string
    descripcion: string
    foto_url: string
    duracion: number
    precio: number
  }) {
    try {
      // Validaciones
      if (!params.tratamiento_id?.trim()) {
        toast({ 
          title: "Error", 
          description: "Debe seleccionar un tratamiento", 
          variant: "destructive" 
        })
        return
      }

      if (!params.nombre?.trim()) {
        toast({ 
          title: "Error", 
          description: "El nombre del sub-tratamiento es requerido", 
          variant: "destructive" 
        })
        return
      }

      if (!params.duracion || params.duracion <= 0) {
        toast({ 
          title: "Error", 
          description: "La duración debe ser mayor a 0", 
          variant: "destructive" 
        })
        return
      }

      if (!params.precio || params.precio < 0) {
        toast({ 
          title: "Error", 
          description: "El precio debe ser mayor o igual a 0", 
          variant: "destructive" 
        })
        return
      }

      await crearSubTratamientoDB(params)

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

  async function editarSubTratamiento(params: {
    id: string
    tratamiento_id: string
    nombre: string
    descripcion: string
    foto_url: string
    duracion: number
    precio: number
  }) {
    try {
      await actualizarSubTratamientoDB(params)

      await cargarTratamientos()
      toast({ 
        title: "Éxito", 
        description: "Sub-tratamiento actualizado correctamente.",
        variant: "default"
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

  const handleAbrirEditarTratamiento = async (tratamiento: Tratamiento) => {
    setTratamientoSeleccionado(tratamiento)
    setNuevoNombre(tratamiento.nombre_tratamiento)
    setTipoDialogo("tratamiento")
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
    setDialogoAbierto(true)
  }

  const abrirDialogoDisponibilidad = (tratamiento: Tratamiento) => {
    setTratamientoSeleccionado(tratamiento)
    setDisponibilidad({
      tratamiento_id: tratamiento.id,
      fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
      fecha_fin: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      hora_inicio: "09:00",
      hora_fin: "18:00",
      boxes_disponibles: [],
      cantidad_clientes: 1
    })
    setDialogoDisponibilidad(true)
  }

  const handleGuardarDisponibilidad = async () => {
    try {
      // Validaciones básicas de formato
      if (!disponibilidad.tratamiento_id) {
        toast({
          title: "Error",
          description: "Debe seleccionar un tratamiento",
          variant: "destructive"
        })
        return
      }

      if (!disponibilidad.fecha_inicio || !disponibilidad.fecha_fin) {
        toast({
          title: "Error",
          description: "Debe seleccionar un rango de fechas",
          variant: "destructive"
        })
        return
      }

      if (!disponibilidad.hora_inicio || !disponibilidad.hora_fin) {
        toast({
          title: "Error",
          description: "Debe seleccionar un rango de horarios",
          variant: "destructive"
        })
        return
      }

      if (!disponibilidad.boxes_disponibles?.length) {
        toast({
          title: "Error",
          description: "Debe seleccionar al menos un box disponible",
          variant: "destructive"
        })
        return
      }

      if (!disponibilidad.cantidad_clientes || disponibilidad.cantidad_clientes <= 0) {
        toast({
          title: "Error",
          description: "La cantidad de clientes debe ser mayor a 0",
          variant: "destructive"
        })
        return
      }

      // Si estamos editando una disponibilidad existente
      if (disponibilidad.id) {
        // Eliminar el registro actual
        const { error: errorEliminar } = await supabase
          .from("rf_disponibilidad")
          .delete()
          .eq("id", disponibilidad.id);

        if (errorEliminar) {
          throw errorEliminar;
        }
      }

      // Crear nuevo registro (tanto para edición como para creación)
      const { error: errorCrear } = await supabase
        .from("rf_disponibilidad")
        .insert({
          tratamiento_id: disponibilidad.tratamiento_id,
          fecha_inicio: disponibilidad.fecha_inicio,
          fecha_fin: disponibilidad.fecha_fin,
          hora_inicio: disponibilidad.hora_inicio,
          hora_fin: disponibilidad.hora_fin,
          boxes_disponibles: disponibilidad.boxes_disponibles,
          cantidad_clientes: disponibilidad.cantidad_clientes
        });

      if (errorCrear) {
        throw errorCrear;
      }

      await cargarTratamientos();
      setDialogoDisponibilidad(false);
      toast({
        title: "Éxito",
        description: disponibilidad.id ? "Disponibilidad actualizada correctamente" : "Disponibilidad guardada correctamente"
      });
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la disponibilidad",
        variant: "destructive"
      });
    }
  };

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

  const handleEditarTratamiento = async () => {
    if (!tratamientoEdicion) return

    if (!nuevoNombre?.trim()) {
      toast({
        title: "Error",
        description: "El nombre del tratamiento es requerido",
        variant: "destructive"
      })
      return
    }

    try {
      await editarTratamiento(
        tratamientoEdicion.id,
        nuevoNombre,
        tratamientoEdicion.descripcion,
        tratamientoEdicion.foto_url,
        Number(maxClientesPorTurno),
        esCompartido
      )
      setDialogoAbierto(false)
    } catch (error) {
      console.error('Error al editar tratamiento:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al editar el tratamiento",
        variant: "destructive"
      })
    }
  }

  const handleCrearTratamiento = async () => {
    if (!nuevoNombre?.trim()) {
      toast({
        title: "Error",
        description: "El nombre del tratamiento es requerido",
        variant: "destructive"
      })
      return
    }

    try {
      await crearTratamiento(
        nuevoNombre,
        "",
        "",
        Number(maxClientesPorTurno),
        esCompartido
      )
      setDialogoAbierto(false)
    } catch (error) {
      console.error('Error al crear tratamiento:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el tratamiento",
        variant: "destructive"
      })
    }
  }

  const convertirFechaArgentina = (fecha: string) => {
    try {
      // Intentar parsear como dd/mm/yyyy
      const fechaParseada = parse(fecha, 'dd/MM/yyyy', new Date())
      if (isValid(fechaParseada)) {
        return format(fechaParseada, 'yyyy-MM-dd')
      }
      // Si no es válida, intentar como ISO
      return fecha
    } catch {
      return fecha
    }
  }

  const handleActualizarFechaDisponible = async (fechaId: string, fechaActualizada: FechaDisponible) => {
    try {
      await actualizarFechaDisponibleDB({
        id: fechaId,
        tratamiento_id: fechaActualizada.tratamiento_id,
        fecha_inicio: fechaActualizada.fecha_inicio,
        fecha_fin: fechaActualizada.fecha_fin,
        hora_inicio: fechaActualizada.hora_inicio,
        hora_fin: fechaActualizada.hora_fin,
        boxes_disponibles: fechaActualizada.boxes_disponibles,
        cantidad_clientes: fechaActualizada.cantidad_clientes
      })

      await cargarTratamientos()
      toast({
        title: "Éxito",
        description: "Fecha disponible actualizada correctamente"
      })
    } catch (error) {
      console.error('Error al actualizar fecha disponible:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la fecha disponible",
        variant: "destructive"
      })
    }
  }

  const handleCrearSubTratamiento = () => {
    if (!tratamientoSeleccionado) return
    crearSubTratamiento({
      tratamiento_id: tratamientoSeleccionado.id,
      nombre: nuevoNombre,
      descripcion: "",
      foto_url: "",
      duracion: Number(duracion),
      precio: Number(precio)
    })
  }

  const handleEditarSubTratamiento = () => {
    if (!subTratamientoEdicion) return
    editarSubTratamiento({
      id: subTratamientoEdicion.id,
      tratamiento_id: subTratamientoEdicion.tratamiento_id,
      nombre: nuevoNombre,
      descripcion: subTratamientoEdicion.descripcion,
      foto_url: subTratamientoEdicion.foto_url,
      duracion: subTratamientoEdicion.duracion,
      precio: subTratamientoEdicion.precio
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Tratamientos</h1>
        <Button onClick={abrirDialogoNuevoTratamiento}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tratamiento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de tratamientos */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tratamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tratamientos.map((tratamiento) => (
                  <div key={tratamiento.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{tratamiento.nombre_tratamiento}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tratamiento.rf_subtratamientos?.length || 0} sub-tratamientos
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirDialogoDisponibilidad(tratamiento)}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirEditarTratamiento(tratamiento)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tratamiento.rf_subtratamientos?.map((subTrat: SubTratamiento) => (
                        <Badge
                          key={subTrat.id}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => abrirDialogoEditarSubTratamiento(tratamiento, subTrat)}
                        >
                          {subTrat.nombre_subtratamiento}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de edición y disponibilidad */}
        <div className="md:col-span-2">
          {dialogoAbierto && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {tipoDialogo === "tratamiento" 
                    ? (tratamientoEdicion ? "Editar Tratamiento" : "Nuevo Tratamiento")
                    : (subTratamientoEdicion ? "Editar Sub-tratamiento" : "Nuevo Sub-tratamiento")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={tipoDialogo === "tratamiento" ? guardarTratamiento : guardarSubTratamiento}>
                  {tipoDialogo === "tratamiento" ? (
                    // Formulario de tratamiento
                    <div className="space-y-4">
                      <input type="hidden" name="id" value={tratamientoEdicion?.id || ""} />
                      
                      <div>
                        <Label htmlFor="nombre">Nombre del Tratamiento</Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          value={nuevoNombre}
                          onChange={(e) => setNuevoNombre(e.target.value)}
                          placeholder="Ej: Tratamiento Facial"
                          required
                        />
                      </div>

                      {/* TEMPORAL: Campo de descripción simplificado */}
                      <div>
                        <Label htmlFor="descripcion">Descripción (NUEVO)</Label>
                        <textarea
                          id="descripcion"
                          value={descripcionTratamiento}
                          onChange={(e) => setDescripcionTratamiento(e.target.value)}
                          placeholder="Describe el tratamiento..."
                          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
                        />
                      </div>

                      {/* TEMPORAL: Campo de imagen simplificado */}
                      <div>
                        <Label>Foto del Tratamiento (NUEVO)</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUploadTratamiento}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          aria-label="Subir imagen del tratamiento"
                        />
                        {imagePreviewTratamiento && (
                          <div className="mt-2">
                            {/* TODO: Replace with next/image. Requires width & height, or layout="fill" and appropriate parent styling. Also ensure Supabase storage domain is configured in next.config.mjs for next/image. */}
                            <img 
                              src={imagePreviewTratamiento} 
                              alt="Preview del Tratamiento"
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="max_clientes_por_turno">Máximo de Clientes por Turno</Label>
                        <Input
                          id="max_clientes_por_turno"
                          name="max_clientes_por_turno"
                          type="number"
                          min="1"
                          value={maxClientesPorTurno}
                          onChange={(e) => setMaxClientesPorTurno(e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="es_compartido"
                          name="es_compartido"
                          checked={esCompartido}
                          onCheckedChange={(checked) => setEsCompartido(checked as boolean)}
                        />
                        <Label htmlFor="es_compartido">Es un tratamiento compartido</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit">
                          {tratamientoEdicion ? "Actualizar" : "Crear"} Tratamiento
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogoAbierto(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Formulario de subtratamiento
                    <div className="space-y-4">
                      <input type="hidden" name="tratamiento_id" value={tratamientoEdicion?.id || ""} />
                      <input type="hidden" name="subtratamiento_id" value={subTratamientoEdicion?.id || ""} />
                      
                      <div>
                        <Label htmlFor="nombre">Nombre del Sub-tratamiento</Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          value={nuevoNombre}
                          onChange={(e) => setNuevoNombre(e.target.value)}
                          placeholder="Ej: Limpieza Profunda"
                          required
                        />
                      </div>

                      {/* TEMPORAL: Campo de descripción simplificado */}
                      <div>
                        <Label htmlFor="descripcion">Descripción (NUEVO)</Label>
                        <textarea
                          id="descripcion"
                          value={descripcionSubTratamiento}
                          onChange={(e) => setDescripcionSubTratamiento(e.target.value)}
                          placeholder="Describe el subtratamiento..."
                          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
                        />
                      </div>

                      {/* TEMPORAL: Campo de imagen simplificado */}
                      <div>
                        <Label>Foto del Subtratamiento (NUEVO)</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUploadSubTratamiento}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          aria-label="Subir imagen del subtratamiento"
                        />
                        {imagePreviewSubTratamiento && (
                          <div className="mt-2">
                            {/* TODO: Replace with next/image. Requires width & height, or layout="fill" and appropriate parent styling. Also ensure Supabase storage domain is configured in next.config.mjs for next/image. */}
                            <img 
                              src={imagePreviewSubTratamiento} 
                              alt="Preview del Subtratamiento"
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duracion">Duración (minutos)</Label>
                          <Input
                            id="duracion"
                            name="duracion"
                            type="number"
                            min="1"
                            value={duracion}
                            onChange={(e) => setDuracion(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="precio">Precio</Label>
                          <Input
                            id="precio"
                            name="precio"
                            type="number"
                            min="0"
                            step="0.01"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit">
                          {subTratamientoEdicion ? "Actualizar" : "Crear"} Sub-tratamiento
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogoAbierto(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                </form>

                {/* Sección de disponibilidad */}
                {tipoDialogo === "tratamiento" && tratamientoSeleccionado && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Disponibilidad</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirDialogoDisponibilidad(tratamientoSeleccionado)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Disponibilidad
                      </Button>
                    </div>

                    {/* Mostrar disponibilidad actual */}
                    {tratamientoSeleccionado?.fechas_disponibles && tratamientoSeleccionado.fechas_disponibles.length > 0 && (
                      <div className="space-y-4">
                        {tratamientoSeleccionado.fechas_disponibles.map((fecha: FechaDisponible) => (
                          <div key={fecha.id} className="space-y-4 border rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Fecha Inicio</Label>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(fecha.fecha_inicio), 'dd/MM/yyyy')}
                                </p>
                              </div>
                              <div>
                                <Label>Fecha Fin</Label>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(fecha.fecha_fin), 'dd/MM/yyyy')}
                                </p>
                              </div>
                            </div>

                            <div>
                              <Label>Horarios</Label>
                              <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {fecha.hora_inicio} - {fecha.hora_fin}
                                  </span>
                                  <Badge variant="outline">
                                    {fecha.cantidad_clientes} {fecha.cantidad_clientes === 1 ? 'cliente' : 'clientes'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label>Boxes Disponibles</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {fecha.boxes_disponibles.map((box: number) => (
                                  <Badge key={box} variant="secondary">
                                    Box {box}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEliminarFechaDisponible(fecha.id)}
                              >
                                Eliminar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setDisponibilidad({
                                    tratamiento_id: fecha.tratamiento_id,
                                    fecha_inicio: fecha.fecha_inicio,
                                    fecha_fin: fecha.fecha_fin,
                                    hora_inicio: fecha.hora_inicio,
                                    hora_fin: fecha.hora_fin,
                                    boxes_disponibles: fecha.boxes_disponibles,
                                    cantidad_clientes: fecha.cantidad_clientes
                                  })
                                  setDialogoDisponibilidad(true)
                                }}
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Diálogo de disponibilidad */}
      <Dialog open={dialogoDisponibilidad} onOpenChange={setDialogoDisponibilidad}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {disponibilidad.id ? "Editar Disponibilidad" : "Agregar Disponibilidad"}
            </DialogTitle>
            <DialogDescription>
              {disponibilidad.id 
                ? "Modifique los datos de la disponibilidad según sea necesario"
                : "Complete los datos para crear una nueva disponibilidad"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !disponibilidad.fecha_inicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {disponibilidad.fecha_inicio ? (
                        format(new Date(disponibilidad.fecha_inicio), 'dd/MM/yyyy')
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(disponibilidad.fecha_inicio)}
                      onSelect={(date) => date && setDisponibilidad(prev => ({
                        ...prev,
                        fecha_inicio: format(date, 'yyyy-MM-dd')
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Fecha Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !disponibilidad.fecha_fin && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {disponibilidad.fecha_fin ? (
                        format(new Date(disponibilidad.fecha_fin), 'dd/MM/yyyy')
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(disponibilidad.fecha_fin)}
                      onSelect={(date) => date && setDisponibilidad(prev => ({
                        ...prev,
                        fecha_fin: format(date, 'yyyy-MM-dd')
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Hora Inicio (24h)</Label>
              <Input
                type="time"
                value={disponibilidad.hora_inicio}
                onChange={(e) => setDisponibilidad(prev => ({
                  ...prev,
                  hora_inicio: e.target.value
                }))}
                className="mt-2 w-32 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-datetime-edit]:text-right [&::-webkit-datetime-edit-fields-wrapper]:text-right [&::-webkit-datetime-edit-hour-field]:text-right [&::-webkit-datetime-edit-minute-field]:text-right [&::-webkit-datetime-edit-ampm-field]:hidden [&::-webkit-datetime-edit]:w-[85px] [&::-webkit-datetime-edit-fields-wrapper]:w-[85px]"
                step="1800"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div>
              <Label>Hora Fin (24h)</Label>
              <Input
                type="time"
                value={disponibilidad.hora_fin}
                onChange={(e) => setDisponibilidad(prev => ({
                  ...prev,
                  hora_fin: e.target.value
                }))}
                className="mt-2 w-32 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-datetime-edit]:text-right [&::-webkit-datetime-edit-fields-wrapper]:text-right [&::-webkit-datetime-edit-hour-field]:text-right [&::-webkit-datetime-edit-minute-field]:text-right [&::-webkit-datetime-edit-ampm-field]:hidden [&::-webkit-datetime-edit]:w-[85px] [&::-webkit-datetime-edit-fields-wrapper]:w-[85px]"
                step="1800"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div>
              <Label>Cantidad de Clientes</Label>
              <Input
                type="number"
                min="1"
                value={disponibilidad.cantidad_clientes}
                onChange={(e) => setDisponibilidad(prev => ({
                  ...prev,
                  cantidad_clientes: parseInt(e.target.value)
                }))}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Boxes Disponibles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableBoxes.map((box) => (
                  <Badge
                    key={box}
                    variant={disponibilidad.boxes_disponibles.includes(box) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setDisponibilidad(prev => ({
                        ...prev,
                        boxes_disponibles: prev.boxes_disponibles.includes(box)
                          ? prev.boxes_disponibles.filter(b => b !== box)
                          : [...prev.boxes_disponibles, box]
                      }))
                    }}
                  >
                    Box {box}
                  </Badge>
                ))}
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
                {disponibilidad.id ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
