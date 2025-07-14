"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  User
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCarrito } from '@/contexts/CarritoContext';
import { CarritoItem } from '@/types/carrito';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface CarritoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datosCita?: {
    cliente_id?: string;
    nombre_completo: string;
    whatsapp: string;
    dni?: string;
    tratamiento_id: string;
    subtratamiento_id: string;
    precio: number;
    sena: number;
    fecha: string;
    hora: string;
    box: number;
  };
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

export function CarritoModal({ open, onOpenChange, datosCita }: CarritoModalProps) {
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

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notasCompra, setNotasCompra] = useState('');
  const [procesandoCompra, setProcesandoCompra] = useState(false);

  // Cargar productos disponibles
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const { data, error } = await supabase
          .from('rf_productos')
          .select('id, nombre, precio_venta, stock, marca')
          .gt('stock', 0)
          .order('nombre');

        if (error) {
          console.error('Error cargando productos:', error);
          return;
        }

        // Mapear los productos para que tengan la propiedad precio y categoria
        setProductos((data || []).map(p => ({
          ...p,
          precio: p.precio_venta,
          categoria: p.marca // Usar marca como categoría
        })));
      } catch (error) {
        console.error('Error cargando productos:', error);
      }
    };

    if (open) {
      cargarProductos();
    }
  }, [open]);

  // Agregar producto al carrito
  const agregarProducto = async () => {
    if (!productoSeleccionado || cantidadProducto < 1) return;

    const producto = productos.find(p => p.id === productoSeleccionado);
    if (!producto) return;

    try {
      // Aquí agregarías el producto al carrito
      // Por ahora solo mostramos un toast
      toast({
        title: "Producto agregado",
        description: `${producto.nombre} agregado al carrito`,
      });

      setProductoSeleccionado('');
      setCantidadProducto(1);
    } catch (error) {
      console.error('Error agregando producto:', error);
      toast({
        title: "Error",
        description: "Error al agregar producto al carrito",
        variant: "destructive"
      });
    }
  };

  // Completar compra
  const handleCompletarCompra = async () => {
    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de completar la compra",
        variant: "destructive"
      });
      return;
    }

    setProcesandoCompra(true);

    try {
      // 1. Completar la compra en el carrito
      await completarCompra();

      // 2. Si hay datos de cita, actualizar el estado a COMPLETADO
      if (datosCita) {
        const { error: errorCita } = await supabase
          .from('rf_citas')
          .update({ estado: 'completado' })
          .eq('cliente_id', datosCita.cliente_id)
          .eq('fecha', datosCita.fecha)
          .eq('hora', datosCita.hora)
          .eq('box', datosCita.box);

        if (errorCita) {
          console.error('Error actualizando cita:', errorCita);
        }
      }

      // 3. Guardar transacción en la base de datos
      const { error: errorTransaccion } = await supabase
        .from('rf_transacciones')
        .insert({
          cliente_id: datosCita?.cliente_id,
          total: total,
          metodo_pago: metodoPago,
          estado: 'completada',
          notas: notasCompra,
          items: items.map(item => ({
            tratamiento_id: item.tratamiento_id,
            subtratamiento_id: item.subtratamiento_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            precio_total: item.precio_total,
            descuento: item.descuento
          }))
        });

      if (errorTransaccion) {
        console.error('Error guardando transacción:', errorTransaccion);
      }

      toast({
        title: "¡Compra completada!",
        description: "La transacción se ha procesado exitosamente",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error completando compra:', error);
      toast({
        title: "Error",
        description: "Error al completar la compra",
        variant: "destructive"
      });
    } finally {
      setProcesandoCompra(false);
    }
  };

  const handleActualizarCantidad = async (item: CarritoItem, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    await actualizarCantidad(item.id!, nuevaCantidad);
  };

  const handleEliminarItem = async (itemId: string) => {
    await eliminarItem(itemId);
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>Error en el carrito</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </DialogTitle>
          <DialogDescription>
            Gestiona los productos y servicios de tu compra
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del cliente - Arriba */}
          {datosCita && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nombre Completo</Label>
                    <p className="font-medium text-sm">{datosCita.nombre_completo}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                    <p className="font-medium text-sm">{datosCita.whatsapp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tratamiento heredado */}
          {datosCita && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tratamiento Programado</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-green-800">
                      {datosCita.fecha} - {datosCita.hora} (Box {datosCita.box})
                    </p>
                    <p className="text-xs text-green-600">
                      Tratamiento ID: {datosCita.tratamiento_id} | Subtratamiento ID: {datosCita.subtratamiento_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-green-800">
                      {formatCurrency(datosCita.precio)}
                    </p>
                    <p className="text-xs text-green-600">
                      Seña: {formatCurrency(datosCita.sena)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agregar productos/subtratamientos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agregar Productos o Servicios</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="producto" className="text-xs">Producto/Servicio</Label>
                  <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar producto o servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.nombre} - {formatCurrency(producto.precio)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Label htmlFor="cantidad" className="text-xs">Cant.</Label>
                  <Input
                    type="number"
                    min="1"
                    value={cantidadProducto}
                    onChange={(e) => setCantidadProducto(parseInt(e.target.value) || 1)}
                    className="h-8"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={agregarProducto} className="h-8 px-3">
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items del carrito */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Productos y Servicios en Carrito</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {items.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
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
                            <span className="ml-1">
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
                            <span className="text-sm font-medium w-6 text-center">
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
                            <p className="font-medium text-sm">
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
              )}
            </CardContent>
          </Card>

          {/* Resumen final y pago */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Método de pago y notas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Información de Pago</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <Label htmlFor="metodo-pago" className="text-xs">Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notas" className="text-xs">Notas</Label>
                  <Textarea
                    id="notas"
                    value={notasCompra}
                    onChange={(e) => setNotasCompra(e.target.value)}
                    placeholder="Notas adicionales..."
                    className="h-16 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumen de compra */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {datosCita && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Seña pagada:</span>
                      <span>-{formatCurrency(datosCita.sena)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Descuentos:</span>
                    <span className="text-green-600">
                      -{formatCurrency(items.reduce((sum, item) => sum + item.descuento, 0))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-base">
                    <span>Total a abonar:</span>
                    <span className="text-lg">
                      {formatCurrency(
                        total - 
                        items.reduce((sum, item) => sum + item.descuento, 0) - 
                        (datosCita ? datosCita.sena : 0)
                      )}
                    </span>
                  </div>
                </div>

                {/* Botón de completar compra */}
                <Button
                  onClick={handleCompletarCompra}
                  disabled={items.length === 0 || procesandoCompra}
                  className="w-full mt-4"
                >
                  {procesandoCompra ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Completar Compra
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 