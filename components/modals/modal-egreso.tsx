"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormularioEgreso, CategoriaEgreso } from "@/types/reportes";
import { toast } from "@/components/ui/use-toast";

interface ModalEgresoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ModalEgreso({ open, onOpenChange, onSuccess }: ModalEgresoProps) {
  const [formData, setFormData] = useState<FormularioEgreso>({
    categoria: '',
    monto: 0,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    notas: ''
  });
  const [categorias, setCategorias] = useState<CategoriaEgreso[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await fetch('/api/categorias-egresos');
        const result = await response.json();
        if (result.data) {
          setCategorias(result.data);
          if (result.data.length > 0 && !formData.categoria) {
            setFormData(prev => ({ ...prev, categoria: result.data[0].nombre }));
          }
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
      }
    };

    if (open) {
      cargarCategorias();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.monto || formData.monto <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    if (!formData.descripcion.trim()) {
      toast({
        title: "Error",
        description: "La descripción es requerida",
        variant: "destructive"
      });
      return;
    }

    if (!formData.categoria) {
      toast({
        title: "Error",
        description: "Debe seleccionar una categoría",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/egresos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el egreso');
      }

      toast({
        title: "Egreso registrado",
        description: "El egreso se ha registrado correctamente",
      });

      onSuccess();
      setFormData({
        categoria: categorias.length > 0 ? categorias[0].nombre : '',
        monto: 0,
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        metodo_pago: 'efectivo',
        notas: ''
      });

    } catch (error) {
      console.error('Error registrando egreso:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el egreso",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Egreso</DialogTitle>
          <DialogDescription>
            Registra un nuevo gasto en el sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nombre}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del gasto"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo_pago">Método de Pago</Label>
              <Select
                value={formData.metodo_pago}
                onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor (opcional)</Label>
              <Input
                id="proveedor"
                value={formData.proveedor || ''}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                placeholder="Nombre del proveedor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="factura_numero">N° Factura (opcional)</Label>
              <Input
                id="factura_numero"
                value={formData.factura_numero || ''}
                onChange={(e) => setFormData({ ...formData, factura_numero: e.target.value })}
                placeholder="Número de factura"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={formData.notas || ''}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Egreso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 