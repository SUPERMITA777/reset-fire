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
import { useToast } from "@/components/ui/use-toast";

interface SubTratamiento {
  id?: string;
  nombre_subtratamiento: string;
  precio: number;
  duracion: number;
  tratamiento_id?: string;
  descripcion?: string;
  foto_url?: string;
}

interface Tratamiento {
  id: string;
  nombre_tratamiento: string;
  box?: number;
  descripcion?: string;
  foto_url?: string;
  rf_subtratamientos: SubTratamiento[];
}

const GestionTratamientosClient = () => {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTratamiento, setEditingTratamiento] = useState<Tratamiento | null>(null);
  const [nombreTratamiento, setNombreTratamiento] = useState("");
  const [box, setBox] = useState(1);
  const [descripcionTratamiento, setDescripcionTratamiento] = useState("");
  const [imagePreviewTratamiento, setImagePreviewTratamiento] = useState("");
  const [fileTratamiento, setFileTratamiento] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>("");
  const [subTratamientosList, setSubTratamientosList] = useState<SubTratamiento[]>([]);
  const [currentTratamientoId, setCurrentTratamientoId] = useState<string | null>(null);
  const { toast } = useToast();

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subNombre, setSubNombre] = useState("");
  const [subDuracion, setSubDuracion] = useState(30);
  const [subPrecio, setSubPrecio] = useState(0);
  const [subTratamientoTargetId, setSubTratamientoTargetId] = useState<string | null>(null);

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

  const openNewTratamiento = () => {
    setEditingTratamiento(null);
    setNombreTratamiento("");
    setBox(1);
    setDescripcionTratamiento("");
    setImagePreviewTratamiento("");
    setFileTratamiento(null);
    setSubTratamientosList([]);
    setCurrentTratamientoId(null);
    setDialogOpen(true);
  };

  const openEditTratamiento = (trat: Tratamiento) => {
    setEditingTratamiento(trat);
    setNombreTratamiento(trat.nombre_tratamiento);
    setBox(trat.box || 1);
    setDescripcionTratamiento(trat.descripcion || "");
    setImagePreviewTratamiento(trat.foto_url || "");
    setFileTratamiento(null);
    setSubTratamientosList(trat.rf_subtratamientos || []);
    setCurrentTratamientoId(trat.id);
    setDialogOpen(true);
  };

  const handleImageUploadTratamiento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo y tamaño
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setImageError("Solo se permiten imágenes JPG, PNG o WEBP.");
        setFileTratamiento(null);
        setImagePreviewTratamiento("");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setImageError("La imagen no debe superar los 2MB.");
        setFileTratamiento(null);
        setImagePreviewTratamiento("");
        return;
      }
      setImageError("");
      setFileTratamiento(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewTratamiento(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (file: File, tratamientoId: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `tratamientos/${tratamientoId}.${fileExt}`;
    console.log("Archivo a subir:", file, "Tratamiento ID:", tratamientoId, "Ruta:", filePath);
    const { error } = await supabase.storage.from('imagenes').upload(filePath, file, { upsert: true });
    if (error) {
      toast({ title: "Error al subir imagen", description: JSON.stringify(error), variant: "destructive" });
      console.error("Error al subir imagen:", error, file, filePath);
      throw error;
    }
    // Obtener URL pública
    const { data } = supabase.storage.from('imagenes').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmitTratamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageError) {
      toast({ title: "Error de imagen", description: imageError, variant: "destructive" });
      return;
    }
    let tratId = currentTratamientoId;
    let fotoUrl = editingTratamiento?.foto_url || "";
    try {
      if (editingTratamiento) {
        // Editar tratamiento
        await supabase.from("rf_tratamientos").update({ nombre_tratamiento: nombreTratamiento, box, descripcion: descripcionTratamiento }).eq("id", editingTratamiento.id);
        tratId = editingTratamiento.id;
      } else {
        // Crear tratamiento
        const { data: newTrat } = await supabase.from("rf_tratamientos").insert([{ nombre_tratamiento: nombreTratamiento, box, descripcion: descripcionTratamiento }]).select().single();
        tratId = newTrat?.id;
      }
      // Subir imagen si hay archivo nuevo
      if (fileTratamiento && tratId) {
        fotoUrl = await uploadImageToStorage(fileTratamiento, tratId);
        await supabase.from("rf_tratamientos").update({ foto_url: fotoUrl }).eq("id", tratId);
      }
      toast({ title: "Éxito", description: "Tratamiento guardado correctamente" });
      setDialogOpen(false);
      fetchTratamientos();
      setCurrentTratamientoId(tratId || null);
      setFileTratamiento(null);
      setImagePreviewTratamiento("");
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el tratamiento", variant: "destructive" });
    }
  };

  const deleteTratamiento = async (id: string) => {
    if (confirm("¿Eliminar este tratamiento y sus subtratamientos?")) {
      await supabase.from("rf_subtratamientos").delete().eq("tratamiento_id", id);
      await supabase.from("rf_tratamientos").delete().eq("id", id);
      fetchTratamientos();
    }
  };

  const openNewSubTratamiento = (tratamientoId: string) => {
    setSubTratamientoTargetId(tratamientoId);
    setSubNombre("");
    setSubDuracion(30);
    setSubPrecio(0);
    setSubDialogOpen(true);
  };

  const handleSubmitSubTratamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTratamientoTargetId) return;
    try {
      const { error } = await supabase.from("rf_subtratamientos").insert({
        tratamiento_id: subTratamientoTargetId,
        nombre_subtratamiento: subNombre,
        duracion: subDuracion,
        precio: subPrecio,
      });
      if (error) throw error;
      toast({ title: "Éxito", description: "Subtratamiento creado correctamente" });
      setSubDialogOpen(false);
      fetchTratamientos();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el subtratamiento", variant: "destructive" });
    }
  };

  // Aquí puedes agregar la lógica de subtratamientos (crear, editar, eliminar) similar a la de tratamientos

  // --- MODAL DE SUBTRATAMIENTO FUERA DEL RETURN PRINCIPAL ---
  const subTratamientoModal = (
    <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Subtratamiento</DialogTitle>
          <DialogDescription>Agrega un subtratamiento para este tratamiento</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitSubTratamiento} className="flex flex-col gap-2 p-2">
          <Label htmlFor="sub-nombre" className="text-xs">Nombre</Label>
          <Input id="sub-nombre" value={subNombre} onChange={e => setSubNombre(e.target.value)} required className="h-8 text-xs px-2 w-40" />
          <Label htmlFor="sub-duracion" className="text-xs mt-2">Duración (minutos)</Label>
          <Input id="sub-duracion" type="number" min={1} value={subDuracion} onChange={e => setSubDuracion(Number(e.target.value))} required className="h-8 text-xs px-2 w-20" />
          <Label htmlFor="sub-precio" className="text-xs mt-2">Precio ($)</Label>
          <Input id="sub-precio" type="number" min={0} step={0.01} value={subPrecio} onChange={e => setSubPrecio(Number(e.target.value))} required className="h-8 text-xs px-2 w-20" />
          <Button type="submit" className="w-full mt-2 text-xs sm:text-sm">Crear Subtratamiento</Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {subTratamientoModal}
      <div className="container mx-auto py-4 sm:py-6 px-2 sm:px-4">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Gestión de Tratamientos</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewTratamiento} className="text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />Nuevo Tratamiento
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
                <Label htmlFor="descripcion" className="text-xs mt-2">Descripción</Label>
                <textarea
                  id="descripcion"
                  value={descripcionTratamiento || ""}
                  onChange={e => setDescripcionTratamiento(e.target.value)}
                  placeholder="Describe el tratamiento..."
                  className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md text-xs"
                />
                <Label className="text-xs mt-2">Foto del Tratamiento</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadTratamiento}
                  className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  aria-label="Subir imagen del tratamiento"
                />
                {imageError && <div className="text-red-600 text-xs mt-1">{imageError}</div>}
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
                {/* Aquí puedes agregar la UI para subtratamientos */}
                <Button type="submit" className="w-full mt-2 text-xs sm:text-sm">{editingTratamiento ? "Actualizar" : "Crear"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <p className="text-sm">Cargando tratamientos...</p>
        ) : (
          <div className="gestion-tratamientos-grid">
            {tratamientos.map((trat) => (
              <Card key={trat.id} className="gestion-tratamiento-card hover:shadow-lg transition-all duration-200 relative flex flex-col">
                <CardHeader className="p-3 md:p-4 lg:p-5 xl:p-6">
                  <div>
                    <CardTitle className="gestion-tratamiento-title font-semibold leading-tight mb-1">
                      {trat.nombre_tratamiento}
                    </CardTitle>
                    <CardDescription className="gestion-tratamiento-description text-muted-foreground">
                      Box: {trat.box}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4 lg:p-5 xl:p-6 pt-0 flex-1 pb-16">
                  {trat.rf_subtratamientos && trat.rf_subtratamientos.length > 0 ? (
                    <div>
                      <h4 className="font-semibold gestion-subtratamiento-item mb-1 md:mb-2">Subtratamientos:</h4>
                      <ul className="space-y-1">
                        {trat.rf_subtratamientos.map((sub) => (
                          <li key={sub.id} className="gestion-subtratamiento-item flex justify-between items-center p-1 md:p-2 bg-muted/30 rounded-md">
                            <span className="font-medium truncate mr-2">{sub.nombre_subtratamiento}</span>
                            <span className="text-muted-foreground whitespace-nowrap">{sub.duracion}min - ${sub.precio}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="gestion-tratamiento-description text-muted-foreground">
                        No hay subtratamientos
                      </p>
                    </div>
                  )}
                </CardContent>
                <div className="gestion-actions-section absolute bottom-0 left-0 right-0 p-2 md:p-3 lg:p-4 xl:p-5">
                  <div className="flex justify-between items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gestion-add-sub-button"
                      onClick={() => openNewSubTratamiento(trat.id)}
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 mr-1" />
                      Sub
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gestion-button p-0"
                        onClick={() => openEditTratamiento(trat)}
                        title="Editar tratamiento"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gestion-button p-0"
                        onClick={() => deleteTratamiento(trat.id)}
                        title="Eliminar tratamiento"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default GestionTratamientosClient; 