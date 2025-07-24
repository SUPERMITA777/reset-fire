'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, User } from 'lucide-react';

const MODALES = [
  { key: 'carrito', label: 'Carrito de Compras' },
  // { key: 'cita', label: 'Cita' }, // extensible
];
const VERSIONES = [
  { key: 'desktop', label: 'Desktop' },
  { key: 'mobile', label: 'Celular' },
];

const DEFAULTS = {
  carrito: {
    desktop: {
      titulo: 'Carrito de Compras',
      nombre: 'Juan Pérez',
      whatsapp: '+54 9 11 1234-5678',
      notas: 'Observaciones...',
      showSub: true,
      showProd: true,
      showCliente: true,
      showPagos: true,
      showResumen: true,
    },
    mobile: {
      titulo: 'Carrito de Compras',
      nombre: 'Juan Pérez',
      whatsapp: '+54 9 11 1234-5678',
      notas: 'Observaciones...',
      showSub: true,
      showProd: true,
      showCliente: true,
      showPagos: true,
      showResumen: true,
    },
  },
};

function getStorageKey(modal: string, version: string) {
  return `modal_editor_${modal}_${version}`;
}

export default function ModalesEditorPage() {
  const [modal, setModal] = useState('carrito');
  const [version, setVersion] = useState('desktop');
  const [open, setOpen] = useState(true);
  const [state, setState] = useState(DEFAULTS.carrito.desktop);

  // Cargar datos guardados al cambiar modal o versión
  useEffect(() => {
    const key = getStorageKey(modal, version);
    const saved = localStorage.getItem(key);
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      setState(DEFAULTS[modal][version]);
    }
  }, [modal, version]);

  // Handlers de edición
  const handleChange = (field: string, value: string) => setState(s => ({ ...s, [field]: value }));
  const handleToggle = (field: string) => setState(s => ({ ...s, [field]: !s[field] }));
  const handleSave = () => {
    const key = getStorageKey(modal, version);
    localStorage.setItem(key, JSON.stringify(state));
  };

  // Tamaño del preview
  const previewStyle = version === 'mobile'
    ? { width: 375, minHeight: 600, margin: '0 auto', borderRadius: 20, boxShadow: '0 0 24px #0002' }
    : { width: '90vw', maxWidth: 1100 };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">Editor visual de modales</h1>
      <div className="mb-4 flex gap-4 flex-wrap items-center">
        <label className="font-semibold">Modal:</label>
        <select value={modal} onChange={e => setModal(e.target.value)} className="border rounded px-2 py-1">
          {MODALES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <label className="font-semibold">Versión:</label>
        <select value={version} onChange={e => setVersion(e.target.value)} className="border rounded px-2 py-1">
          {VERSIONES.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
        </select>
        <Button onClick={handleSave} variant="success">Guardar cambios</Button>
      </div>
      <div className="mb-4 flex gap-2 flex-wrap">
        <Button onClick={() => setOpen(o => !o)}>{open ? 'Ocultar' : 'Mostrar'} Modal</Button>
        <Button variant={state.showSub ? 'default' : 'outline'} onClick={() => handleToggle('showSub')}>Subtratamientos</Button>
        <Button variant={state.showProd ? 'default' : 'outline'} onClick={() => handleToggle('showProd')}>Productos</Button>
        <Button variant={state.showCliente ? 'default' : 'outline'} onClick={() => handleToggle('showCliente')}>Cliente</Button>
        <Button variant={state.showPagos ? 'default' : 'outline'} onClick={() => handleToggle('showPagos')}>Pagos</Button>
        <Button variant={state.showResumen ? 'default' : 'outline'} onClick={() => handleToggle('showResumen')}>Resumen</Button>
      </div>
      <div className="mb-4 flex gap-4 flex-wrap">
        <Input value={state.titulo} onChange={e => handleChange('titulo', e.target.value)} className="w-64" placeholder="Título del modal" />
        <Input value={state.nombre} onChange={e => handleChange('nombre', e.target.value)} className="w-48" placeholder="Nombre completo" />
        <Input value={state.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className="w-48" placeholder="WhatsApp" />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={previewStyle} className="h-[90vh] max-h-none p-0 flex flex-col bg-white rounded-2xl shadow-2xl">
          <DialogTitle className="text-2xl font-bold text-primary px-6 pt-6">{state.titulo}</DialogTitle>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
            {/* IZQUIERDA */}
            <div className="flex flex-col h-full border-r border-gray-200 bg-gray-50 p-6 gap-6">
              {/* Selects de agregar */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                  <Input className="h-12 text-base w-full bg-white border border-primary/40 shadow-sm" placeholder="Seleccionar subtratamiento" disabled />
                  <Button size="lg" variant="outline" className="h-12"><Plus className="h-5 w-5" /> Agregar</Button>
                </div>
                <div className="flex gap-2 items-center">
                  <Input className="h-12 text-base w-full bg-white border border-primary/40 shadow-sm" placeholder="Seleccionar producto" disabled />
                  <Button size="lg" variant="outline" className="h-12"><Plus className="h-5 w-5" /> Agregar</Button>
                </div>
              </div>
              {/* Detalle de la compra */}
              <Card className="flex-1 rounded-xl shadow-md border border-gray-200 bg-white mt-4">
                <CardHeader className="pb-2 border-b border-gray-200">
                  <CardTitle className="text-lg font-bold text-primary">Detalle de la compra</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 space-y-4">
                  {state.showSub && (
                    <div>
                      <div className="font-semibold text-sm mb-1 text-secondary">Subtratamientos</div>
                      <ul className="text-sm space-y-1">
                        <li className="flex justify-between items-center py-1 px-2 rounded hover:bg-primary/10 transition">
                          <span>Facial - Limpieza profunda</span>
                          <span className="font-semibold">$2500</span>
                        </li>
                        <li className="flex justify-between items-center py-1 px-2 rounded hover:bg-primary/10 transition">
                          <span>Corporal - Masaje relajante</span>
                          <span className="font-semibold">$3500</span>
                        </li>
                      </ul>
                    </div>
                  )}
                  {state.showProd && (
                    <div>
                      <div className="font-semibold text-sm mb-1 text-secondary">Productos</div>
                      <ul className="text-sm space-y-1">
                        <li className="flex justify-between items-center py-1 px-2 rounded hover:bg-primary/10 transition">
                          <span>Crema hidratante</span>
                          <span className="font-semibold">$1200</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Seña y total */}
              <div className="mt-auto flex flex-col gap-2">
                <div className="flex justify-between items-center text-green-700 font-semibold text-base bg-green-50 rounded px-3 py-2 border border-green-200">
                  <span>Seña pagada</span>
                  <span>- $1000</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold bg-primary/10 rounded px-3 py-3 border border-primary">
                  <span>Total</span>
                  <span>$7200</span>
                </div>
              </div>
            </div>
            {/* DERECHA */}
            <div className="flex flex-col h-full bg-white p-6 gap-6">
              {state.showCliente && (
                <Card className="rounded-xl shadow-md border border-gray-200 bg-white">
                  <CardContent className="flex gap-4 items-center py-4">
                    <User className="h-6 w-6 text-primary" />
                    <div className="flex-1 flex gap-4 items-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Nombre Completo</div>
                        <div className="font-semibold text-base">{state.nombre}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">WhatsApp</div>
                        <div className="font-semibold text-base">{state.whatsapp}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {state.showPagos && (
                <Card className="rounded-xl shadow-md border border-gray-200 bg-white">
                  <CardHeader className="pb-2 border-b border-gray-200">
                    <CardTitle className="text-lg font-bold text-primary">Formas de Pago</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2">
                    <div className="flex gap-2 items-center mb-1">
                      <Input className="h-9 text-base w-36" placeholder="Efectivo" disabled />
                      <Input className="h-9 text-base w-28" placeholder="$5000" disabled />
                      <Button type="button" size="sm" variant="ghost" className="h-9 px-2"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex gap-2 items-center mb-1">
                      <Input className="h-9 text-base w-36" placeholder="Transferencia" disabled />
                      <Input className="h-9 text-base w-28" placeholder="$2200" disabled />
                      <Button type="button" size="sm" variant="ghost" className="h-9 px-2"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <Button type="button" size="lg" variant="outline" className="h-9 px-3 mt-2"><Plus className="h-4 w-4 mr-1" />Agregar forma de pago</Button>
                    <div className="flex justify-between text-base mt-2">
                      <span>Total pagado:</span>
                      <span className="font-semibold">$7200</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-green-600">
                      <span>Cambio:</span>
                      <span>$0</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              {state.showResumen && (
                <Card className="rounded-xl shadow-md border border-gray-200 bg-white mt-auto">
                  <CardHeader className="pb-2 border-b border-gray-200">
                    <CardTitle className="text-lg font-bold text-primary">Resumen y Observaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-3">
                    <div className="flex justify-between text-base">
                      <span>Subtotal:</span>
                      <span>$8200</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Descuentos:</span>
                      <span className="text-green-600">- $1000</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total a abonar:</span>
                      <span>$7200</span>
                    </div>
                    <Textarea
                      id="notas"
                      value={state.notas}
                      onChange={e => handleChange('notas', e.target.value)}
                      placeholder="Observaciones..."
                      className="h-20 text-base mt-2"
                    />
                    <Button className="w-full mt-3 h-10 text-lg font-bold">Completar Compra</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 