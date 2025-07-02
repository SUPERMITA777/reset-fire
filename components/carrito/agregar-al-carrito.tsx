"use client";

import React, { useState } from 'react';
import { useCarrito } from '@/contexts/CarritoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Loader2, Plus } from 'lucide-react';
import { CarritoItemInput } from '@/types/carrito';

interface AgregarAlCarritoProps {
  tratamiento_id: string;
  subtratamiento_id: string;
  precio: number;
  nombre_tratamiento: string;
  nombre_subtratamiento: string;
  duracion?: number;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AgregarAlCarrito({
  tratamiento_id,
  subtratamiento_id,
  precio,
  nombre_tratamiento,
  nombre_subtratamiento,
  duracion,
  variant = 'default',
  size = 'default',
  className
}: AgregarAlCarritoProps) {
  const { agregarItem, loading } = useCarrito();
  const [isOpen, setIsOpen] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');

  const handleAgregarAlCarrito = async () => {
    const itemInput: CarritoItemInput = {
      tratamiento_id,
      subtratamiento_id,
      cantidad,
      precio_unitario: precio,
      descuento: 0,
      notas: notas.trim() || undefined,
    };

    await agregarItem(itemInput);
    setIsOpen(false);
    setCantidad(1);
    setNotas('');
  };

  const handleCantidadChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    setCantidad(Math.max(1, numValue));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          Agregar al Carrito
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar al Carrito</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Información del producto */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-lg">{nombre_tratamiento}</h3>
            <p className="text-sm text-muted-foreground">{nombre_subtratamiento}</p>
            {duracion && (
              <p className="text-sm text-muted-foreground">Duración: {duracion} minutos</p>
            )}
            <p className="text-lg font-semibold mt-2">${precio.toLocaleString('es-AR')}</p>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => handleCantidadChange(e.target.value)}
              className="w-24"
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas adicionales (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Especificaciones especiales, alergias, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="font-medium">Total:</span>
            <span className="text-lg font-semibold">
              ${(precio * cantidad).toLocaleString('es-AR')}
            </span>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarAlCarrito}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 