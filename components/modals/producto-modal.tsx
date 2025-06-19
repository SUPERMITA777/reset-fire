"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, X } from "lucide-react";
import { Producto, ProductoModalProps } from "@/types/producto";

// Esquema de validación
const productoSchema = z.object({
  marca: z.string().min(1, "La marca es requerida"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  foto_url: z.string().optional(),
  costo: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  precio_venta: z.number().min(0, "El precio de venta debe ser mayor o igual a 0"),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
});

type FormData = z.infer<typeof productoSchema>;

export function ProductoModal({
  open,
  onOpenChange,
  onSubmit,
  producto,
  title = producto ? "Editar Producto" : "Nuevo Producto",
  description = producto 
    ? "Modifica los detalles del producto" 
    : "Complete los datos para crear un nuevo producto"
}: ProductoModalProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const supabase = createClientComponentClient<Database>();

  const form = useForm<FormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      marca: "",
      nombre: "",
      descripcion: "",
      foto_url: "",
      costo: 0,
      precio_venta: 0,
      stock: 0,
    }
  });

  // Actualizar el formulario cuando cambia el producto
  useEffect(() => {
    if (producto) {
      form.reset({
        marca: producto.marca,
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        foto_url: producto.foto_url || "",
        costo: producto.costo,
        precio_venta: producto.precio_venta,
        stock: producto.stock,
      });
      setImagePreview(producto.foto_url || "");
    } else {
      form.reset({
        marca: "",
        nombre: "",
        descripcion: "",
        foto_url: "",
        costo: 0,
        precio_venta: 0,
        stock: 0,
      });
      setImagePreview("");
    }
  }, [producto, form]);

  // Limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      form.reset();
      setImagePreview("");
      setLoading(false);
    }
  }, [open, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      // Subir la imagen a Supabase Storage
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

      form.setValue('foto_url', publicUrl);
      setImagePreview(publicUrl);
      
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
      setLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      let productoGuardado: Producto;

      if (producto?.id) {
        // Actualizar producto existente
        const { data: updatedProducto, error: updateError } = await supabase
          .from("rf_productos")
          .update({
            marca: data.marca,
            nombre: data.nombre,
            descripcion: data.descripcion || null,
            foto_url: data.foto_url || null,
            costo: data.costo,
            precio_venta: data.precio_venta,
            stock: data.stock,
          })
          .eq("id", producto.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Error al actualizar producto: ${updateError.message}`);
        }

        productoGuardado = updatedProducto;
      } else {
        // Crear nuevo producto
        const { data: newProducto, error: createError } = await supabase
          .from("rf_productos")
          .insert({
            marca: data.marca,
            nombre: data.nombre,
            descripcion: data.descripcion || null,
            foto_url: data.foto_url || null,
            costo: data.costo,
            precio_venta: data.precio_venta,
            stock: data.stock,
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Error al crear producto: ${createError.message}`);
        }

        productoGuardado = newProducto;
      }

      // Éxito
      toast({
        title: "Éxito",
        description: producto?.id ? "Producto actualizado correctamente" : "Producto creado correctamente"
      });

      // Cerrar el modal y notificar al componente padre
      onOpenChange(false);
      if (onSubmit) {
        await onSubmit(productoGuardado);
      }

    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el producto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Información básica - Marca y Nombre en la misma fila */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="marca" className="mb-1.5 block text-xs">MARCA *</Label>
              <Input
                id="marca"
                {...form.register("marca")}
                placeholder="Ej: L'Oreal"
                className="h-8 text-sm"
              />
              {form.formState.errors.marca && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.marca.message}</p>
              )}
            </div>

            <div className="flex-1">
              <Label htmlFor="nombre" className="mb-1.5 block text-xs">NOMBRE *</Label>
              <Input
                id="nombre"
                {...form.register("nombre")}
                placeholder="Ej: Shampoo Profesional"
                className="h-8 text-sm"
              />
              {form.formState.errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.nombre.message}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion" className="mb-1.5 block text-xs">DESCRIPCIÓN</Label>
            <Textarea
              id="descripcion"
              {...form.register("descripcion")}
              placeholder="Descripción del producto..."
              className="h-16 text-sm"
            />
          </div>

          {/* Imagen */}
          <div>
            <Label className="mb-1.5 block text-xs">FOTO DEL PRODUCTO</Label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-5 h-5 p-0"
                    onClick={() => {
                      setImagePreview("");
                      form.setValue("foto_url", "");
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={loading}
                  aria-label="Subir imagen del producto"
                />
                <Label 
                  htmlFor="image-upload" 
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  <Upload className="w-3 h-3" />
                  {loading ? "Subiendo..." : "Subir imagen"}
                </Label>
              </div>
            </div>
          </div>

          {/* Precios y stock - en la misma fila como en Nueva Cita */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="costo" className="mb-1.5 block text-xs">COSTO *</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                min="0"
                {...form.register("costo", { valueAsNumber: true })}
                placeholder="0.00"
                className="h-8 text-sm"
              />
              {form.formState.errors.costo && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.costo.message}</p>
              )}
            </div>

            <div className="flex-1">
              <Label htmlFor="precio_venta" className="mb-1.5 block text-xs">PRECIO DE VENTA *</Label>
              <Input
                id="precio_venta"
                type="number"
                step="0.01"
                min="0"
                {...form.register("precio_venta", { valueAsNumber: true })}
                placeholder="0.00"
                className="h-8 text-sm"
              />
              {form.formState.errors.precio_venta && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.precio_venta.message}</p>
              )}
            </div>

            <div className="flex-1">
              <Label htmlFor="stock" className="mb-1.5 block text-xs">STOCK *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...form.register("stock", { valueAsNumber: true })}
                placeholder="0"
                className="h-8 text-sm"
              />
              {form.formState.errors.stock && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.stock.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : producto ? (
                'Actualizar Producto'
              ) : (
                'Crear Producto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 