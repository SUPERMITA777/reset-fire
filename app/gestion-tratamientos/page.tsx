"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface SubTratamiento {
  id?: string;
  nombre_subtratamiento: string;
  precio: number;
  duracion: number;
  tratamiento_id?: string;
}

interface Tratamiento {
  id: string;
  nombre_tratamiento: string;
  box?: number;
  rf_subtratamientos: SubTratamiento[];
}

export default function GestionTratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTratamiento, setEditingTratamiento] = useState<Tratamiento | null>(null);
  const [nombreTratamiento, setNombreTratamiento] = useState("");
  const [box, setBox] = useState(1);
  // Subtratamiento modal states
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubTratamiento | null>(null);
  const [subTratamientoForm, setSubTratamientoForm] = useState<SubTratamiento>({ nombre_subtratamiento: "", precio: 0, duracion: 30 });
  const [subTratamientosList, setSubTratamientosList] = useState<SubTratamiento[]>([]);
  const [currentTratamientoId, setCurrentTratamientoId] = useState<string | null>(null);
  const [descripcionTratamiento, setDescripcionTratamiento] = useState("");
  const [imagePreviewTratamiento, setImagePreviewTratamiento] = useState("");
  const [descripcionSubTratamiento, setDescripcionSubTratamiento] = useState("");
  const [imagePreviewSubTratamiento, setImagePreviewSubTratamiento] = useState("");

  useEffect(() => {
    fetchTratamientos();
  }, []);

  const fetchTratamientos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("rf_tratamientos")
      .select("*, rf_subtratamientos(*)")
      .order("box");
    if (!error && data) setTratamientos(data as any);
    setIsLoading(false);
  };

  // Modal principal: crear/editar tratamiento
  const openNewTratamiento = () => {
    setEditingTratamiento(null);
    setNombreTratamiento("");
    setBox(1);
    setSubTratamientosList([]);
    setCurrentTratamientoId(null);
    setDialogOpen(true);
  };

  const openEditTratamiento = (trat: Tratamiento) => {
    setEditingTratamiento(trat);
    setNombreTratamiento(trat.nombre_tratamiento);
    setBox(trat.box || 1);
    setSubTratamientosList(trat.rf_subtratamientos || []);
    setCurrentTratamientoId(trat.id);
    setDialogOpen(true);
  };

  const handleSubmitTratamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    let tratId = currentTratamientoId;
    if (editingTratamiento) {
      // Editar tratamiento
      await supabase.from("rf_tratamientos").update({ nombre_tratamiento: nombreTratamiento, box }).eq("id", editingTratamiento.id);
      tratId = editingTratamiento.id;
    } else {
      // Crear tratamiento
      const { data: newTrat } = await supabase.from("rf_tratamientos").insert([{ nombre_tratamiento: nombreTratamiento, box }]).select().single();
      tratId = newTrat?.id;
    }
    setDialogOpen(false);
    fetchTratamientos();
    setCurrentTratamientoId(tratId || null);
  };

  // Subtratamiento modal
  const openNewSubTratamiento = () => {
    setEditingSub(null);
    setSubTratamientoForm({ nombre_subtratamiento: "", precio: 0, duracion: 30 });
    setSubDialogOpen(true);
  };
  const openEditSubTratamiento = (sub: SubTratamiento) => {
    setEditingSub(sub);
    setSubTratamientoForm(sub);
    setSubDialogOpen(true);
  };
  const handleSubmitSubTratamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTratamientoId && !editingTratamiento) return;
    const tratamientoId = currentTratamientoId || editingTratamiento?.id;
    if (editingSub && editingSub.id) {
      // Editar subtratamiento
      await supabase.from("rf_subtratamientos").update({
        nombre_subtratamiento: subTratamientoForm.nombre_subtratamiento,
        precio: subTratamientoForm.precio,
        duracion: subTratamientoForm.duracion
      }).eq("id", editingSub.id);
    } else {
      // Crear subtratamiento
      await supabase.from("rf_subtratamientos").insert({
        ...subTratamientoForm,
        tratamiento_id: tratamientoId
      });
    }
    setSubDialogOpen(false);
    // Refrescar lista de subtratamientos
    if (tratamientoId) {
      const { data } = await supabase.from("rf_subtratamientos").select("*").eq("tratamiento_id", tratamientoId);
      setSubTratamientosList(data || []);
    }
    fetchTratamientos();
  };
  const deleteSubTratamiento = async (id: string) => {
    await supabase.from("rf_subtratamientos").delete().eq("id", id);
    setSubDialogOpen(false);
    if (currentTratamientoId) {
      const { data } = await supabase.from("rf_subtratamientos").select("*").eq("tratamiento_id", currentTratamientoId);
      setSubTratamientosList(data || []);
    }
    fetchTratamientos();
  };

  const deleteTratamiento = async (id: string) => {
    if (confirm("¿Eliminar este tratamiento y sus subtratamientos?")) {
      await supabase.from("rf_subtratamientos").delete().eq("tratamiento_id", id);
      await supabase.from("rf_tratamientos").delete().eq("id", id);
      fetchTratamientos();
    }
  };

  const handleImageUploadTratamiento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewTratamiento(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadSubTratamiento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewSubTratamiento(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          <h1 className="text-3xl font-bold">Gestión de Tratamientos</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewTratamiento}>
              <Plus className="w-4 h-4 mr-2" />Nuevo Tratamiento
            </Button>
          </DialogTrigger>
          <DialogContent style={{ maxWidth: 340, width: '100%', padding: 0 }} className="rounded-lg shadow-lg mx-auto">
            <DialogHeader>
              <DialogTitle className="text-base px-4 pt-4 pb-2">
                {editingTratamiento ? "Editar Tratamiento" : "Nuevo Tratamiento"}
              </DialogTitle>
              <DialogDescription className="px-4 pb-4">
                {editingTratamiento 
                  ? "Modifica los datos del tratamiento existente"
                  : "Ingresa los datos para crear un nuevo tratamiento"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitTratamiento} className="flex flex-col gap-2 p-4">
              <Label htmlFor="nombre" className="text-xs">Nombre</Label>
              <Input id="nombre" maxLength={20} value={nombreTratamiento} onChange={e => setNombreTratamiento(e.target.value)} required className="h-8 text-xs px-2 w-40" />
              
              <Label htmlFor="descripcion" className="text-xs mt-2">Descripción (NUEVO)</Label>
              <textarea
                id="descripcion"
                value={descripcionTratamiento || ""}
                onChange={e => setDescripcionTratamiento(e.target.value)}
                placeholder="Describe el tratamiento..."
                className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md text-xs"
              />
              
              <Label className="text-xs mt-2">Foto del Tratamiento (NUEVO)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUploadTratamiento}
                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                aria-label="Subir imagen del tratamiento"
              />
              {imagePreviewTratamiento && (
                <div className="mt-1">
                  <img 
                    src={imagePreviewTratamiento} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded border"
                  />
                </div>
              )}
              
              <Label htmlFor="box" className="text-xs mt-2">Box</Label>
              <Input id="box" type="number" min="1" max={999999} value={box} onChange={e => setBox(Number(e.target.value))} required className="h-8 text-xs px-2 w-20" />
              <hr className="my-2" />
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-xs">Subtratamientos</span>
                <Button type="button" size="sm" variant="outline" onClick={openNewSubTratamiento}>+ Agregar</Button>
              </div>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {subTratamientosList.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 border rounded px-2 py-1">
                    <span className="flex-1 truncate text-xs">{sub.nombre_subtratamiento}</span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => openEditSubTratamiento(sub)}><Edit className="w-4 h-4" /></Button>
                    <Button type="button" size="icon" variant="destructive" onClick={() => deleteSubTratamiento(sub.id!)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full mt-2">{editingTratamiento ? "Actualizar" : "Crear"}</Button>
            </form>
          </DialogContent>
        </Dialog>
        {/* Modal de subtratamiento */}
        <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
          <DialogContent style={{ maxWidth: 340, width: '100%', padding: 0 }} className="rounded-lg shadow-lg mx-auto">
            <DialogHeader>
              <DialogTitle className="text-base px-4 pt-4 pb-2">
                {editingSub ? "Editar Subtratamiento" : "Nuevo Subtratamiento"}
              </DialogTitle>
              <DialogDescription className="px-4 pb-4">
                {editingSub
                  ? "Modifica los datos del subtratamiento existente"
                  : "Ingresa los datos para crear un nuevo subtratamiento"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitSubTratamiento} className="flex flex-col gap-2 p-4">
              <Label className="text-xs">Nombre subtratamiento</Label>
              <Input maxLength={20} value={subTratamientoForm.nombre_subtratamiento} onChange={e => setSubTratamientoForm({ ...subTratamientoForm, nombre_subtratamiento: e.target.value })} required className="h-8 text-xs px-2 w-40" />
              
              <Label className="text-xs mt-2">Descripción (NUEVO)</Label>
              <textarea
                value={descripcionSubTratamiento}
                onChange={e => setDescripcionSubTratamiento(e.target.value)}
                placeholder="Describe el subtratamiento..."
                className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md text-xs"
              />
              
              <Label className="text-xs mt-2">Foto del Subtratamiento (NUEVO)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUploadSubTratamiento}
                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                aria-label="Subir imagen del subtratamiento"
              />
              {imagePreviewSubTratamiento && (
                <div className="mt-1">
                  <img 
                    src={imagePreviewSubTratamiento} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded border"
                  />
                </div>
              )}
              
              <Label className="text-xs">Precio (€)</Label>
              <Input type="number" min="0" max={999999} step="0.01" value={isNaN(subTratamientoForm.precio) || subTratamientoForm.precio === undefined ? '' : subTratamientoForm.precio} onChange={e => setSubTratamientoForm({ ...subTratamientoForm, precio: e.target.value === '' ? 0 : parseFloat(e.target.value) })} required className="h-8 text-xs px-2 w-20" />
              <Label className="text-xs">Duración (min)</Label>
              <Input type="number" min="1" max={999999} value={isNaN(subTratamientoForm.duracion) || subTratamientoForm.duracion === undefined ? '' : subTratamientoForm.duracion} onChange={e => setSubTratamientoForm({ ...subTratamientoForm, duracion: e.target.value === '' ? 1 : parseInt(e.target.value) })} required className="h-8 text-xs px-2 w-20" />
              <div className="flex gap-2 mt-2">
                <Button type="submit" className="flex-1">{editingSub ? "Actualizar" : "Crear"}</Button>
                {editingSub && editingSub.id && (
                  <Button type="button" variant="destructive" className="flex-1" onClick={() => deleteSubTratamiento(editingSub.id!)}>Eliminar</Button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <p>Cargando tratamientos...</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tratamientos.map((trat) => (
            <Card key={trat.id} className="w-full">
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{trat.nombre_tratamiento}</CardTitle>
                    <CardDescription className="text-xs">Box: {trat.box}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => {
                        setCurrentTratamientoId(trat.id);
                        openNewSubTratamiento();
                      }}
                    >
                      + SUB
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditTratamiento(trat)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => deleteTratamiento(trat.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {trat.rf_subtratamientos && trat.rf_subtratamientos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-xs mb-1">Subtratamientos:</h4>
                    <ul className="space-y-0.5">
                      {trat.rf_subtratamientos.map((sub) => (
                        <li key={sub.id} className="text-xs flex justify-between items-center">
                          <span className="font-medium truncate mr-2">{sub.nombre_subtratamiento}</span>
                          <span className="text-muted-foreground whitespace-nowrap">{sub.duracion}min - €{sub.precio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 