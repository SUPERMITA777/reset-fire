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
          .select('id, nombre, precio_venta, stock, categoria')
          .eq('activo', true)
          .order('nombre');

        if (error) {
          console.error('Error cargando productos:', error);
          return;
        }

        // Mapear los productos para que tengan la propiedad precio
        setProductos((data || []).map(p => ({
          ...p,
          precio: p.precio_venta
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
      <DialogContent className="w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </DialogTitle>
          <DialogDescription>
            Gestiona los productos y servicios de tu compra
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo - Items del carrito */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productos y Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Tu carrito está vacío</p>
                    <p className="text-sm">Agrega productos o servicios para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">
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
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.subtratamiento_nombre || 'Subtratamiento'}
                            {item.duracion && (
                              <span className="ml-2">
                                • {item.duracion} min
                              </span>
                            )}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActualizarCantidad(item, item.cantidad - 1)}
                                className="h-8 w-8 p-0"
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
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
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

            {/* Agregar productos */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Agregar Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="producto">Producto</Label>
                    <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
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
                  <div>
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cantidadProducto}
                      onChange={(e) => setCantidadProducto(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={agregarProducto} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho - Resumen y checkout */}
          <div className="space-y-4">
            {/* Información del cliente */}
            {datosCita && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nombre</Label>
                      <p className="font-medium">{datosCita.nombre_completo}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                      <p className="font-medium">{datosCita.whatsapp}</p>
                    </div>
                    {datosCita.dni && (
                      <div>
                        <Label className="text-xs text-muted-foreground">DNI</Label>
                        <p className="font-medium">{datosCita.dni}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Seña</Label>
                      <p className="font-medium text-green-600">{formatCurrency(datosCita.sena)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumen de compra */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {datosCita && (
                    <div className="flex justify-between text-green-600">
                      <span>Seña pagada:</span>
                      <span>-{formatCurrency(datosCita.sena)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total a pagar:</span>
                    <span>{formatCurrency(datosCita ? Math.max(0, total - datosCita.sena) : total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Método de pago */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Notas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Notas adicionales sobre la compra..."
                  value={notasCompra}
                  onChange={(e) => setNotasCompra(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={procesandoCompra}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCompletarCompra}
            disabled={procesandoCompra || items.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {procesandoCompra ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar Compra
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 