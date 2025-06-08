"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ArrowLeft, Calendar, Clock, Copy, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Disponibilidad {
  id?: string;
  tratamiento_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  boxes_disponibles: number[];
  tratamientos: {
    id: string;
    nombre_tratamiento: string;
  };
}

interface Tratamiento {
  id: string;
  nombre_tratamiento: string;
}

interface FormData {
  tratamiento_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  boxes_disponibles: number[];
}

export default function DisponibilidadPage() {
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDisponibilidad, setEditingDisponibilidad] = useState<Disponibilidad | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [disponibilidadToDelete, setDisponibilidadToDelete] = useState<Disponibilidad | null>(null);
  
  // Form states
  const [form, setForm] = useState<FormData>({
    tratamiento_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    boxes_disponibles: [1]
  });

  const [fechaActual, setFechaActual] = useState(new Date());

  useEffect(() => {
    fetchDisponibilidades();
    fetchTratamientos();
  }, []);

  const fetchDisponibilidades = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("rf_disponibilidad")
      .select(`
        id,
        tratamiento_id,
        fecha_inicio,
        fecha_fin,
        hora_inicio,
        hora_fin,
        boxes_disponibles,
        tratamientos:rf_tratamientos (
          id,
          nombre_tratamiento
        )
      `)
      .order("fecha_inicio", { ascending: true });

    if (error) {
      console.error("Error al obtener disponibilidades:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las disponibilidades",
        variant: "destructive"
      });
      return;
    }

    // Transformar los datos para que coincidan con la interfaz
    const disponibilidadesTransformadas = (data || []).map(d => ({
      ...d,
      tratamientos: Array.isArray(d.tratamientos) ? d.tratamientos[0] : d.tratamientos
    }));

    setDisponibilidades(disponibilidadesTransformadas);
    setIsLoading(false);
  };

  const fetchTratamientos = async () => {
    const { data, error } = await supabase
      .from("rf_tratamientos")
      .select("id, nombre_tratamiento")
      .order("nombre_tratamiento");

    if (error) {
      console.error("Error al obtener tratamientos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tratamientos",
        variant: "destructive"
      });
      return;
    }

    setTratamientos(data || []);
  };

  const openNew = () => {
    setEditingDisponibilidad(null);
    setForm({
      tratamiento_id: "",
      fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
      fecha_fin: format(new Date(), 'yyyy-MM-dd'),
      hora_inicio: "09:00",
      hora_fin: "17:00",
      boxes_disponibles: [1]
    });
    setDialogOpen(true);
  };

  const handleEdit = (disponibilidad: Disponibilidad) => {
    setEditingDisponibilidad(disponibilidad);
    setForm({
      tratamiento_id: disponibilidad.tratamiento_id,
      fecha_inicio: disponibilidad.fecha_inicio,
      fecha_fin: disponibilidad.fecha_fin,
      hora_inicio: disponibilidad.hora_inicio,
      hora_fin: disponibilidad.hora_fin,
      boxes_disponibles: disponibilidad.boxes_disponibles
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const datosActualizados = {
        tratamiento_id: form.tratamiento_id,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        boxes_disponibles: form.boxes_disponibles
      };

      if (editingDisponibilidad?.id) {
        const { error } = await supabase
          .from("rf_disponibilidad")
          .update(datosActualizados)
          .eq("id", editingDisponibilidad.id);

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Error",
              description: "No se puede actualizar el turno porque se solapa con otro existente",
              variant: "destructive"
            });
          } else {
            throw error;
          }
          return;
        }

        toast({
          title: "Éxito",
          description: "Turno actualizado correctamente"
        });
      } else {
        const { error } = await supabase
          .from("rf_disponibilidad")
          .insert(datosActualizados);

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Error",
              description: "No se puede crear el turno porque se solapa con otro existente",
              variant: "destructive"
            });
          } else {
            throw error;
          }
          return;
        }

        toast({
          title: "Éxito",
          description: "Turno creado correctamente"
        });
      }

      setDialogOpen(false);
      fetchDisponibilidades();
    } catch (error) {
      console.error("Error al guardar disponibilidad:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el turno",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (disp: Disponibilidad) => {
    setDisponibilidadToDelete(disp);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!disponibilidadToDelete?.id) return;

    try {
      const { error } = await supabase
        .from("rf_disponibilidad")
        .delete()
        .eq("id", disponibilidadToDelete.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Turno eliminado correctamente"
      });

      setDeleteDialogOpen(false);
      fetchDisponibilidades();
    } catch (error) {
      console.error("Error al eliminar disponibilidad:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el turno",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async (disp: Disponibilidad) => {
    try {
      // Modificar la fecha para evitar el conflicto de solapamiento
      const fechaInicio = new Date(disp.fecha_inicio);
      const fechaFin = new Date(disp.fecha_fin);
      const diasDiferencia = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
      
      // Agregar 7 días a ambas fechas
      fechaInicio.setDate(fechaInicio.getDate() + 7);
      fechaFin.setDate(fechaFin.getDate() + 7);

      const { error } = await supabase
        .from("rf_disponibilidad")
        .insert({
          tratamiento_id: disp.tratamiento_id,
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          fecha_fin: fechaFin.toISOString().split('T')[0],
          hora_inicio: disp.hora_inicio,
          hora_fin: disp.hora_fin,
          boxes_disponibles: disp.boxes_disponibles
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Error",
            description: "No se puede duplicar el turno porque se solapa con otro existente",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Éxito",
        description: "Turno duplicado correctamente"
      });

      fetchDisponibilidades();
    } catch (error) {
      console.error("Error al duplicar disponibilidad:", error);
      toast({
        title: "Error",
        description: "No se pudo duplicar el turno",
        variant: "destructive"
      });
    }
  };

  const navegarFecha = (dias: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaActual(nuevaFecha);
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Disponibilidad de Turnos</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navegarFecha(-1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[200px] text-center">
              {formatearFecha(fechaActual)}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navegarFecha(1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingDisponibilidad(null);
              setForm({
                tratamiento_id: "",
                fecha_inicio: "",
                fecha_fin: "",
                hora_inicio: "",
                hora_fin: "",
                boxes_disponibles: [1]
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Disponibilidad
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[350px]">
              <DialogHeader>
                <DialogTitle className="text-base">
                  {editingDisponibilidad ? "Editar Disponibilidad" : "Nueva Disponibilidad"}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {editingDisponibilidad
                    ? "Modifica los datos de la disponibilidad"
                    : "Ingresa los datos de la disponibilidad"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Tratamiento</Label>
                  <select 
                    value={form.tratamiento_id} 
                    onChange={e => setForm(f => ({ ...f, tratamiento_id: e.target.value }))} 
                    required 
                    className="w-full h-8 px-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="">Seleccionar tratamiento...</option>
                    {tratamientos.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre_tratamiento}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Fecha Inicio</Label>
                    <Input 
                      type="date" 
                      value={form.fecha_inicio} 
                      onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} 
                      required 
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Fecha Fin</Label>
                    <Input 
                      type="date" 
                      value={form.fecha_fin} 
                      onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} 
                      required 
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Hora Inicio</Label>
                    <Input 
                      type="time" 
                      value={form.hora_inicio} 
                      onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} 
                      required 
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Hora Fin</Label>
                    <Input 
                      type="time" 
                      value={form.hora_fin} 
                      onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))} 
                      required 
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Box</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="8" 
                    value={form.boxes_disponibles[0]} 
                    onChange={e => setForm(f => ({ ...f, boxes_disponibles: [Number(e.target.value)] }))} 
                    required 
                    className="h-8 text-sm"
                  />
                </div>

                <Button type="submit" className="w-full h-8 text-sm">
                  {editingDisponibilidad ? "Guardar Cambios" : "Crear Disponibilidad"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-muted-foreground">Cargando turnos disponibles...</p>
        </div>
      ) : disponibilidades.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-muted-foreground">No hay turnos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disponibilidades.map((disp) => (
            <Card key={disp.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium line-clamp-1">
                      {disp.tratamientos?.nombre_tratamiento || "Tratamiento no encontrado"}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(disp)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(disp)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => confirmDelete(disp)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {format(parseISO(disp.fecha_inicio), "EEEE d 'de' MMMM", { locale: es })}
                        {disp.fecha_fin !== disp.fecha_inicio && 
                          ` - ${format(parseISO(disp.fecha_fin), "EEEE d 'de' MMMM", { locale: es })}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{disp.hora_inicio} - {disp.hora_fin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Box:</span>
                      <span>{disp.boxes_disponibles.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleEdit(disp)}
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleDuplicate(disp)}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Duplicar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1 h-8 text-xs"
                      onClick={() => confirmDelete(disp)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el turno seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 