"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ArrowLeft, Calendar, Clock, Copy, MoreVertical, ChevronLeft, ChevronRight, Pencil, Settings2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DisponibilidadModal } from "@/components/modals/disponibilidad-modal"
import { Badge } from "@/components/ui/badge";
import { DisponibilidadList } from "@/components/disponibilidad/disponibilidad-list";

interface Disponibilidad {
  id: string;
  tratamiento_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  boxes_disponibles: number[];
  cantidad_clientes?: number;
  rf_tratamientos: {
    id: string;
    nombre_tratamiento: string;
  } | null;
}

interface Tratamiento {
  id: string;
  nombre: string;
  nombre_tratamiento?: string;
  disponibilidades?: Disponibilidad[];
}

interface FormData {
  tratamiento_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  boxes_disponibles: number[];
  cantidad_clientes?: number;
}

export default function DisponibilidadPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState<Tratamiento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDisponibilidad, setEditingDisponibilidad] = useState<Disponibilidad | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [disponibilidadToDelete, setDisponibilidadToDelete] = useState<Disponibilidad | null>(null);
  const [selectedTratamientoForNew, setSelectedTratamientoForNew] = useState<Tratamiento | null>(null);

  useEffect(() => {
    fetchTratamientos();
  }, []);

  const fetchTratamientos = async () => {
    try {
      setIsLoading(true);
      
      // Obtener tratamientos
      const { data: tratamientosData, error: tratamientosError } = await supabase
        .from("rf_tratamientos")
        .select("id, nombre_tratamiento")
        .order("nombre_tratamiento");

      if (tratamientosError) throw tratamientosError;

      // Obtener disponibilidades
      const { data: disponibilidadesData, error: disponibilidadesError } = await supabase
        .from("rf_disponibilidad")
        .select(`
          id,
          tratamiento_id,
          fecha_inicio,
          fecha_fin,
          hora_inicio,
          hora_fin,
          boxes_disponibles,
          rf_tratamientos (
            id,
            nombre_tratamiento
          )
        `)
        .gte('fecha_inicio', new Date().toISOString().split('T')[0]) // Solo disponibilidades futuras
        .order("fecha_inicio", { ascending: true });

      if (disponibilidadesError) throw disponibilidadesError;

      // Transformar y agrupar disponibilidades por tratamiento
      const disponibilidadesFormateadas = (disponibilidadesData || []).map(d => ({
        ...d,
        rf_tratamientos: Array.isArray(d.rf_tratamientos) ? d.rf_tratamientos[0] : d.rf_tratamientos
      }));

      const tratamientosConDisponibilidades = (tratamientosData || []).map(trat => ({
        ...trat,
        nombre: trat.nombre_tratamiento,
        disponibilidades: disponibilidadesFormateadas.filter(d => d.tratamiento_id === trat.id)
      }));

      setTratamientos(tratamientosConDisponibilidades);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tratamientos y disponibilidades",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openNew = () => {
    setEditingDisponibilidad(null);
    setSelectedTratamientoForNew(null);
    setDialogOpen(true);
  };

  const openNewForTratamiento = (tratamiento: Tratamiento) => {
    setEditingDisponibilidad(null);
    setSelectedTratamientoForNew(tratamiento);
    setDialogOpen(true);
  };

  const handleDisponibilidadCreated = () => {
    setDialogOpen(false);
    setSelectedTratamientoForNew(null);
    fetchTratamientos();
  };

  const handleEdit = (disponibilidad: Disponibilidad) => {
    setEditingDisponibilidad(disponibilidad);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const tratamientoId = selectedTratamientoForNew?.id || formData.tratamiento_id;

      if (!tratamientoId) {
        throw new Error("Debe seleccionar un tratamiento");
      }

      // Validar que la fecha fin no sea anterior a la fecha inicio
      if (formData.fecha_fin < formData.fecha_inicio) {
        throw new Error("La fecha fin no puede ser anterior a la fecha inicio");
      }

      console.log("Verificando disponibilidades existentes para:", {
        tratamientoId,
        fechaInicio: formData.fecha_inicio,
        fechaFin: formData.fecha_fin,
        disponibilidadId: editingDisponibilidad?.id || "nueva"
      });

      // Validar que no haya solapamiento de fechas para el mismo tratamiento
      let query = supabase
        .from("rf_disponibilidad")
        .select("id, fecha_inicio, fecha_fin")
        .eq("tratamiento_id", tratamientoId)
        .or(`fecha_inicio.lte.${formData.fecha_fin},fecha_fin.gte.${formData.fecha_inicio}`);

      // Solo agregamos el filtro de ID si estamos editando una disponibilidad existente
      if (editingDisponibilidad?.id) {
        query = query.neq("id", editingDisponibilidad.id);
      }

      const { data: disponibilidadesExistentes, error: errorCheck } = await query;

      if (errorCheck) {
        console.error("Error detallado al verificar disponibilidades:", {
          error: errorCheck,
          code: errorCheck.code,
          message: errorCheck.message,
          details: errorCheck.details,
          query: {
            tratamientoId,
            fechaInicio: formData.fecha_inicio,
            fechaFin: formData.fecha_fin,
            editingId: editingDisponibilidad?.id
          }
        });
        throw new Error(`Error al verificar disponibilidades: ${errorCheck.message}`);
      }

      console.log("Disponibilidades existentes encontradas:", disponibilidadesExistentes);

      // Verificar solapamiento
      const haySolapamiento = disponibilidadesExistentes?.some(disp => {
        const inicioExistente = new Date(disp.fecha_inicio);
        const finExistente = new Date(disp.fecha_fin);
        const inicioNueva = new Date(formData.fecha_inicio);
        const finNueva = new Date(formData.fecha_fin);

        const solapamiento = (
          (inicioNueva >= inicioExistente && inicioNueva <= finExistente) || // La fecha inicio está dentro del rango existente
          (finNueva >= inicioExistente && finNueva <= finExistente) || // La fecha fin está dentro del rango existente
          (inicioNueva <= inicioExistente && finNueva >= finExistente) // El nuevo rango engloba al existente
        );

        if (solapamiento) {
          console.log("Solapamiento detectado:", {
            disponibilidadExistente: {
              id: disp.id,
              inicio: disp.fecha_inicio,
              fin: disp.fecha_fin
            },
            nuevaDisponibilidad: {
              inicio: formData.fecha_inicio,
              fin: formData.fecha_fin
            }
          });
        }

        return solapamiento;
      });

      if (haySolapamiento) {
        throw new Error("Ya existe una disponibilidad para este tratamiento en el rango de fechas seleccionado");
      }

      const disponibilidadData = {
        tratamiento_id: tratamientoId,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        boxes_disponibles: formData.boxes_disponibles
      };

      console.log("Intentando guardar disponibilidad:", disponibilidadData);

      if (editingDisponibilidad) {
        const { error } = await supabase
          .from("rf_disponibilidad")
          .update(disponibilidadData)
          .eq("id", editingDisponibilidad.id);

        if (error) {
          console.error("Error detallado al actualizar:", {
            error,
            code: error.code,
            message: error.message,
            details: error.details
          });
          throw new Error(error.message || "Error al actualizar la disponibilidad");
        }

        toast({
          title: "Éxito",
          description: "Disponibilidad actualizada correctamente"
        });
      } else {
        const { error } = await supabase
          .from("rf_disponibilidad")
          .insert(disponibilidadData);

        if (error) {
          console.error("Error detallado al crear:", {
            error,
            code: error.code,
            message: error.message,
            details: error.details
          });
          if (error.code === "23505") {
            throw new Error("Ya existe una disponibilidad para este tratamiento en el rango de fechas seleccionado");
          }
          throw new Error(error.message || "Error al crear la disponibilidad");
        }

        toast({
          title: "Éxito",
          description: "Disponibilidad creada correctamente"
        });
      }

      setDialogOpen(false);
      setEditingDisponibilidad(null);
      setSelectedTratamientoForNew(null);
      fetchTratamientos();
    } catch (error) {
      console.error("Error completo al guardar disponibilidad:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la disponibilidad",
        variant: "destructive"
      });
    }
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
        description: "Disponibilidad eliminada correctamente"
      });

      setDeleteDialogOpen(false);
      fetchTratamientos();
    } catch (error) {
      console.error("Error al eliminar disponibilidad:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la disponibilidad",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = (disp: Disponibilidad) => {
    setDisponibilidadToDelete(disp);
    setDeleteDialogOpen(true);
  };

  const formatearHora = (hora: string) => {
    const [horas, minutos] = hora.split(':')
    return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`
  }

  return (
    <div className="container py-6 space-y-6">
      {!selectedTratamiento ? (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Disponibilidad</h1>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Disponibilidad
            </Button>
          </div>

          {isLoading ? (
            <p>Cargando tratamientos...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tratamientos.map((trat) => (
                <Card key={trat.id} className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{trat.nombre}</CardTitle>
                        <CardDescription>
                          {trat.disponibilidades?.length || 0} disponibilidades futuras
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTratamiento(trat)}
                        >
                          VER DISPONIBILIDADES
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {trat.disponibilidades && trat.disponibilidades.length > 0 ? (
                      <div>
                        <h4 className="font-semibold mb-2">Próximas disponibilidades:</h4>
                        <ul className="space-y-1">
                          {trat.disponibilidades.slice(0, 3).map((disp) => (
                            <li key={disp.id} className="text-sm">
                              <span className="font-medium">
                                {format(parseISO(disp.fecha_inicio), "dd/MM/yyyy", { locale: es })}
                                {disp.fecha_fin && disp.fecha_fin !== disp.fecha_inicio && (
                                  <> - {format(parseISO(disp.fecha_fin), "dd/MM/yyyy", { locale: es })}</>
                                )}
                              </span>
                              <br />
                              <span className="text-muted-foreground">
                                {formatearHora(disp.hora_inicio)} a {formatearHora(disp.hora_fin)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay disponibilidades futuras</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewForTratamiento(trat);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Disponibilidad
                    </Button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTratamiento(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-semibold">
              Disponibilidad - {selectedTratamiento.nombre}
            </h1>
          </div>

          <div className="flex justify-end mb-4">
            <Button onClick={() => openNewForTratamiento(selectedTratamiento)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Disponibilidad
            </Button>
          </div>

          <DisponibilidadList
            disponibilidades={selectedTratamiento.disponibilidades || []}
            onEdit={handleEdit}
            onDelete={confirmDelete}
          />
        </>
      )}

      {/* Diálogo de disponibilidad */}
      <DisponibilidadModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        disponibilidad={editingDisponibilidad}
        tratamientos={tratamientos}
        defaultTratamientoId={selectedTratamientoForNew?.id}
      />

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar disponibilidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la disponibilidad seleccionada.
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