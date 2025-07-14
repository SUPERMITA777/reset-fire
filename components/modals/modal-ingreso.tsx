"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormularioIngreso } from "@/types/reportes";
import { toast } from "@/components/ui/use-toast";

interface ModalIngresoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ModalIngreso({ open, onOpenChange, onSuccess }: ModalIngresoProps) {
  const [formData, setFormData] = useState<FormularioIngreso>({
    tipo: 'turno',
    monto: 0,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    notas: ''
  });
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);
      
      const response = await fetch('/api/ingresos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el ingreso');
      }

      toast({
        title: "Ingreso registrado",
        description: "El ingreso se ha registrado correctamente",
      });

      onSuccess();
      setFormData({
        tipo: 'turno',
        monto: 0,
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        metodo_pago: 'efectivo',
        notas: ''
      });

    } catch (error) {
      console.error('Error registrando ingreso:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el ingreso",
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
          <DialogTitle>Registrar Ingreso</DialogTitle>
          <DialogDescription>
            Registra un nuevo ingreso en el sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Ingreso</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turno">Turno</SelectItem>
                  <SelectItem value="producto">Producto</SelectItem>
                  <SelectItem value="seña">Seña</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
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
              placeholder="Descripción del ingreso"
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

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={formData.notas}
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
              {loading ? 'Registrando...' : 'Registrar Ingreso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 