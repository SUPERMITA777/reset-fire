"use client";

import React, { useState } from 'react';
import { useCarrito } from '@/contexts/CarritoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CarritoItem } from '@/types/carrito';

interface CarritoWidgetProps {
  className?: string;
}

export function CarritoWidget({ className }: CarritoWidgetProps) {
  const { 
    items, 
    total, 
    cantidadItems, 
    loading, 
    error,
    actualizarCantidad, 
    eliminarItem, 
    limpiarCarrito,
    completarCompra 
  } = useCarrito();

  const [isOpen, setIsOpen] = useState(false);

  const handleActualizarCantidad = async (item: CarritoItem, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    await actualizarCantidad(item.id!, nuevaCantidad);
  };

  const handleEliminarItem = async (itemId: string) => {
    await eliminarItem(itemId);
  };

  const handleLimpiarCarrito = async () => {
    await limpiarCarrito();
  };

  const handleCompletarCompra = async () => {
    await completarCompra();
    setIsOpen(false);
  };

  if (error) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded-md ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Error en el carrito</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botón del carrito */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
        {cantidadItems > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {cantidadItems}
          </Badge>
        )}
      </Button>

      {/* Panel del carrito */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Carrito de Compras</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tu carrito está vacío</p>
                  <p className="text-sm">Agrega productos para comenzar</p>
                </div>
              ) : (
                <>
                  {/* Lista de items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                                                      <h4 className="font-medium text-sm truncate">
                            {item.tratamiento_nombre || 'Tratamiento'}
                          </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarItem(item.id!)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2">
                            {item.subtratamiento_nombre || 'Subtratamiento'}
                            {item.duracion && (
                              <span className="ml-2">
                                • {item.duracion} min
                              </span>
                            )}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActualizarCantidad(item, item.cantidad - 1)}
                                className="h-6 w-6 p-0"
                                disabled={item.cantidad <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.cantidad}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActualizarCantidad(item, item.cantidad + 1)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(item.precio_total - item.descuento)}
                              </p>
                              {item.descuento > 0 && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(item.precio_total)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Totales */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Productos:</span>
                      <span>{cantidadItems}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-2">
                    <Button 
                      onClick={handleCompletarCompra}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 mr-2" />
                      )}
                      Completar Compra
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleLimpiarCarrito}
                      className="w-full"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpiar Carrito
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 