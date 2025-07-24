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
import { nanoid } from 'nanoid';
import { getTratamientos } from '@/lib/supabase';

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
    completarCompra,
    agregarItem
  } = useCarrito();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notasCompra, setNotasCompra] = useState('');
  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [tratamientoInfo, setTratamientoInfo] = useState<{nombre: string, subtratamiento: string} | null>(null);
  const [modalSubOpen, setModalSubOpen] = useState(false);
  const [subtratamientoSeleccionado, setSubtratamientoSeleccionado] = useState<string>("");
const [subtratamientosDisponibles, setSubtratamientosDisponibles] = useState<any[]>([]);
const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);

  // NUEVO: Métodos de pago múltiples
  const [pagos, setPagos] = useState([
    { id: nanoid(), tipo: 'efectivo', monto: 0 }
  ]);

  // Cargar subtratamientos y productos al abrir el modal
  useEffect(() => {
    const cargarSubtratamientos = async () => {
      const tratamientos = await getTratamientos();
      const subs = tratamientos.flatMap(t => (t.rf_subtratamientos || []).map(st => ({ ...st, tratamiento_nombre: t.nombre_tratamiento })));
      setSubtratamientosDisponibles(subs);
    };
    const cargarProductos = async () => {
      const { data, error } = await supabase.from('rf_productos').select('*').gt('stock', 0).order('nombre');
      if (!error && data) setProductosDisponibles(data);
    };
    if (open) {
      cargarSubtratamientos();
      cargarProductos();
    }
  }, [open]);

  // Cargar información del tratamiento y subtratamiento
  useEffect(() => {
    const cargarTratamientoInfo = async () => {
      if (!datosCita?.tratamiento_id || !datosCita?.subtratamiento_id) return;

      try {
        // Cargar tratamiento
        const { data: tratamientoData, error: errorTratamiento } = await supabase
          .from('rf_tratamientos')
          .select('nombre_tratamiento')
          .eq('id', datosCita.tratamiento_id)
          .single();

        if (errorTratamiento) {
          console.error('Error cargando tratamiento:', errorTratamiento);
          return;
        }

        // Cargar subtratamiento
        const { data: subtratamientoData, error: errorSubtratamiento } = await supabase
          .from('rf_subtratamientos')
          .select('nombre_subtratamiento')
          .eq('id', datosCita.subtratamiento_id)
          .single();

        if (errorSubtratamiento) {
          console.error('Error cargando subtratamiento:', errorSubtratamiento);
          return;
        }

        setTratamientoInfo({
          nombre: tratamientoData.nombre_tratamiento,
          subtratamiento: subtratamientoData.nombre_subtratamiento
        });
      } catch (error) {
        console.error('Error cargando información del tratamiento:', error);
      }
    };

    if (open && datosCita) {
      cargarTratamientoInfo();
    }
  }, [open, datosCita]);

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

  // Completar compra: validar pagos
  const handleCompletarCompra = async () => {
    if (items.length === 0) {
      toast({ title: "Carrito vacío", description: "Agrega productos antes de completar la compra", variant: "destructive" });
      return;
    }
    if (totalPagado < totalAAbonar) {
      toast({ title: "Pago insuficiente", description: "La suma de los pagos no cubre el total a abonar", variant: "destructive" });
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
          metodos_pago: pagos.map(p => ({ tipo: p.tipo, monto: Number(p.monto) })),
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

  // Calcular total a abonar
  const totalDescuentos = items.reduce((sum, item) => sum + item.descuento, 0);
  const totalAAbonar = total - totalDescuentos - (datosCita ? datosCita.sena : 0);
  const totalPagado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  const faltante = totalAAbonar - totalPagado;

  // Métodos para manejar pagos
  const handlePagoChange = (id: string, field: 'tipo' | 'monto', value: string) => {
    setPagos(pagos.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const agregarPago = () => setPagos([...pagos, { id: nanoid(), tipo: 'efectivo', monto: 0 }]);
  const eliminarPago = (id: string) => setPagos(pagos.length > 1 ? pagos.filter(p => p.id !== id) : pagos);

  // Cargar subtratamientos al abrir el modal
  const cargarSubtratamientos = async () => {
    const tratamientos = await getTratamientos();
    const subs = tratamientos.flatMap(t => (t.rf_subtratamientos || []).map(st => ({ ...st, tratamiento_nombre: t.nombre_tratamiento })));
    setSubtratamientosDisponibles(subs);
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
      <DialogContent style={{ width: '90vw', maxWidth: '1100px' }} className="h-[90vh] max-h-none p-0 flex flex-col bg-white rounded-2xl shadow-2xl">
        <DialogTitle className="text-2xl font-bold text-primary px-6 pt-6">Carrito de Compras</DialogTitle>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
          {/* IZQUIERDA */}
          <div className="flex flex-col h-full border-r border-gray-200 bg-gray-50 p-6 gap-6">
            {/* Selects de agregar */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <Select value={subtratamientoSeleccionado} onValueChange={setSubtratamientoSeleccionado}>
                  <SelectTrigger className="h-12 text-base w-full bg-white border border-primary/40 shadow-sm">
                    <SelectValue placeholder="Seleccionar subtratamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtratamientosDisponibles.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.tratamiento_nombre} - {sub.nombre_subtratamiento} ({sub.duracion}min - ${sub.precio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="lg" variant="outline" className="h-12" onClick={async () => {
                  const sub = subtratamientosDisponibles.find(s => s.id === subtratamientoSeleccionado);
                  if (sub) {
                    await agregarItem({
                      tratamiento_id: sub.tratamiento_id,
                      subtratamiento_id: sub.id,
                      cantidad: 1,
                      precio_unitario: sub.precio,
                      descuento: 0,
                      notas: ''
                    });
                    setSubtratamientoSeleccionado("");
                    toast({ title: 'Subtratamiento agregado' });
                  }
                }}>
                  <Plus className="h-5 w-5" /> Agregar
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                  <SelectTrigger className="h-12 text-base w-full bg-white border border-primary/40 shadow-sm">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productosDisponibles.map(prod => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.nombre} (Stock: {prod.stock} - ${prod.precio})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="lg" variant="outline" className="h-12" onClick={async () => {
                  const prod = productosDisponibles.find(p => p.id === productoSeleccionado);
                  if (prod) {
                    await agregarItem({
                      tratamiento_id: '',
                      subtratamiento_id: '',
                      cantidad: 1,
                      precio_unitario: prod.precio,
                      descuento: 0,
                      notas: '',
                      producto_id: prod.id,
                      producto_nombre: prod.nombre
                    });
                    setProductoSeleccionado("");
                    toast({ title: 'Producto agregado' });
                  }
                }}>
                  <Plus className="h-5 w-5" /> Agregar
                </Button>
              </div>
            </div>
            {/* Detalle de la compra */}
            <Card className="flex-1 rounded-xl shadow-md border border-gray-200 bg-white mt-4">
              <CardHeader className="pb-2 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-primary">Detalle de la compra</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                {/* Subtratamientos */}
                {items.filter(item => item.tratamiento_id).length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-1 text-secondary">Subtratamientos</div>
                    <ul className="text-sm space-y-1">
                      {items.filter(item => item.tratamiento_id).map(item => (
                        <li key={item.id} className="flex justify-between items-center py-1 px-2 rounded hover:bg-primary/10 transition">
                          <span>{item.tratamiento_nombre} {item.subtratamiento_nombre && `- ${item.subtratamiento_nombre}`}</span>
                          <span className="font-semibold">${item.precio_total - item.descuento}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Productos */}
                {items.filter(item => item.producto_id).length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-1 text-secondary">Productos</div>
                    <ul className="text-sm space-y-1">
                      {items.filter(item => item.producto_id).map(item => (
                        <li key={item.id} className="flex justify-between items-center py-1 px-2 rounded hover:bg-primary/10 transition">
                          <span>{item.producto_nombre}</span>
                          <span className="font-semibold">${item.precio_total}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Seña y total */}
            <div className="mt-auto flex flex-col gap-2">
              {datosCita && (
                <div className="flex justify-between items-center text-green-700 font-semibold text-base bg-green-50 rounded px-3 py-2 border border-green-200">
                  <span>Seña pagada</span>
                  <span>- ${datosCita.sena}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold bg-primary/10 rounded px-3 py-3 border border-primary">
                <span>Total</span>
                <span>${totalAAbonar}</span>
              </div>
            </div>
          </div>
          {/* DERECHA */}
          <div className="flex flex-col h-full bg-white p-6 gap-6">
            {/* Datos del cliente */}
            {datosCita && (
              <Card className="rounded-xl shadow-md border border-gray-200 bg-white">
                <CardContent className="flex gap-4 items-center py-4">
                  <User className="h-6 w-6 text-primary" />
                  <div className="flex-1 flex gap-4 items-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Nombre Completo</div>
                      <div className="font-semibold text-base">{datosCita.nombre_completo}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">WhatsApp</div>
                      <div className="font-semibold text-base">{datosCita.whatsapp}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Métodos de pago múltiples */}
            <Card className="rounded-xl shadow-md border border-gray-200 bg-white">
              <CardHeader className="pb-2 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-primary">Formas de Pago</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {pagos.map((pago, idx) => (
                  <div key={pago.id} className="flex gap-2 items-center mb-1">
                    <Select value={pago.tipo} onValueChange={v => handlePagoChange(pago.id, 'tipo', v)}>
                      <SelectTrigger className="h-9 text-base w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      value={pago.monto}
                      onChange={e => handlePagoChange(pago.id, 'monto', e.target.value)}
                      className="h-9 text-base w-28"
                      placeholder="$0"
                    />
                    {pagos.length > 1 && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => eliminarPago(pago.id)} className="h-9 px-2"> <Trash2 className="h-4 w-4" /> </Button>
                    )}
                  </div>
                ))}
                <Button type="button" size="lg" variant="outline" onClick={agregarPago} className="h-9 px-3 mt-2"> <Plus className="h-4 w-4 mr-1" />Agregar forma de pago</Button>
                <div className="flex justify-between text-base mt-2">
                  <span>Total pagado:</span>
                  <span className="font-semibold">${totalPagado}</span>
                </div>
                <div className={`flex justify-between text-base font-semibold ${faltante > 0 ? 'text-red-600' : 'text-green-600'}`}> 
                  <span>{faltante > 0 ? 'Faltante:' : 'Cambio:'}</span>
                  <span>{faltante > 0 ? `$${faltante}` : `$${-faltante}`}</span>
                </div>
              </CardContent>
            </Card>
            {/* Subtotal, total y observaciones */}
            <Card className="rounded-xl shadow-md border border-gray-200 bg-white mt-auto">
              <CardHeader className="pb-2 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-primary">Resumen y Observaciones</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                <div className="flex justify-between text-base">
                  <span>Subtotal:</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Descuentos:</span>
                  <span className="text-green-600">- ${totalDescuentos}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total a abonar:</span>
                  <span>${totalAAbonar}</span>
                </div>
                <Textarea
                  id="notas"
                  value={notasCompra}
                  onChange={(e) => setNotasCompra(e.target.value)}
                  placeholder="Observaciones..."
                  className="h-20 text-base mt-2"
                />
                <Button
                  onClick={handleCompletarCompra}
                  disabled={items.length === 0 || procesandoCompra || totalPagado < totalAAbonar}
                  className="w-full mt-3 h-10 text-lg font-bold"
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