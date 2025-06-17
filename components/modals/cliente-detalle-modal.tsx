import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { User, Phone, Calendar, DollarSign, Clock, MapPin, Edit, Trash2, Save, X, FileText, TrendingUp } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Cliente {
  id: string
  nombre_completo: string
  dni: string
  whatsapp: string | null
  created_at: string
  total_citas: number
  ultima_cita: string | null
}

interface Cita {
  id: string
  fecha: string
  hora: string
  estado: string
  notas: string | null
  precio: number
  sena: number
  box: number
  tratamiento_nombre: string
  subtratamiento_nombre: string
  duracion: number
  fecha_formateada: string
}

interface ClienteDetalle extends Cliente {
  rf_citas: Cita[]
  estadisticas: {
    total_citas: number
    citas_confirmadas: number
    citas_completadas: number
    citas_canceladas: number
    total_gastado: number
    total_seniado: number
    saldo_pendiente: number
  }
}

interface ClienteDetalleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: ClienteDetalle | null
  onUpdate: (cliente: ClienteDetalle) => void
  onDelete: (id: string) => void
}

export function ClienteDetalleModal({
  open,
  onOpenChange,
  cliente,
  onUpdate,
  onDelete
}: ClienteDetalleModalProps) {
  const [activeTab, setActiveTab] = useState("datos")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    nombre_completo: "",
    dni: "",
    whatsapp: ""
  })

  useEffect(() => {
    if (cliente) {
      setEditForm({
        nombre_completo: cliente.nombre_completo,
        dni: cliente.dni,
        whatsapp: cliente.whatsapp || ""
      })
    }
  }, [cliente])

  const handleSave = async () => {
    if (!cliente) return
    try {
      const response = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar cliente')
      }
      const clienteActualizado = await response.json()
      onUpdate({ ...cliente, ...clienteActualizado })
      setIsEditing(false)
      toast({ title: "Éxito", description: "Cliente actualizado correctamente" })
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Error al actualizar cliente", variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (!cliente) return
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return
    try {
      const response = await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar cliente')
      }
      onDelete(cliente.id)
      onOpenChange(false)
      toast({ title: "Éxito", description: "Cliente eliminado correctamente" })
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Error al eliminar cliente", variant: "destructive" })
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'reservado': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmado': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'completado': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'reservado': return 'Reservado'
      case 'confirmado': return 'Confirmado'
      case 'completado': return 'Completado'
      case 'cancelado': return 'Cancelado'
      default: return estado
    }
  }
  if (!cliente) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? "Editar Cliente" : "Detalles del Cliente"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Modifica los datos del cliente" : "Información completa del cliente y su historial"}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />Editar
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="datos" className="flex items-center gap-2"><User className="w-4 h-4" />Datos</TabsTrigger>
            <TabsTrigger value="historial" className="flex items-center gap-2"><FileText className="w-4 h-4" />Historial</TabsTrigger>
            <TabsTrigger value="estadisticas" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Estadísticas</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="datos" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Información Personal</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input id="nombre" value={editForm.nombre_completo} onChange={e => setEditForm(prev => ({ ...prev, nombre_completo: e.target.value }))} disabled={!isEditing} placeholder="Nombre completo del cliente" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dni">DNI</Label>
                      <Input id="dni" value={editForm.dni} onChange={e => setEditForm(prev => ({ ...prev, dni: e.target.value }))} disabled={!isEditing} placeholder="12345678" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" value={editForm.whatsapp} onChange={e => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))} disabled={!isEditing} placeholder="+54 9 11 1234-5678" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Registrado: {format(new Date(cliente.created_at), 'dd/MM/yyyy', { locale: es })}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Total citas: {cliente.total_citas}</span></div>
                  </div>
                </CardContent>
              </Card>
              {isEditing && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button onClick={handleSave}><Save className="w-4 h-4 mr-1" />Guardar Cambios</Button>
                </DialogFooter>
              )}
            </TabsContent>
            <TabsContent value="historial" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Historial Clínico</CardTitle></CardHeader>
                <CardContent>
                  {cliente.rf_citas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500"><FileText className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No hay citas registradas para este cliente</p></div>
                  ) : (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {cliente.rf_citas.map((cita) => (
                          <Card key={cita.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{cita.tratamiento_nombre}</h4>
                                  <p className="text-sm text-gray-600">{cita.subtratamiento_nombre}</p>
                                </div>
                                <Badge className={getEstadoColor(cita.estado)}>{getEstadoText(cita.estado)}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /><span>{cita.fecha_formateada}</span></div>
                                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" /><span>{cita.hora} ({cita.duracion} min)</span></div>
                                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /><span>Box {cita.box}</span></div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /><span>Precio: ${cita.precio}</span></div>
                                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-orange-600" /><span>Seña: ${cita.sena}</span></div>
                                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-600" /><span>Saldo: ${cita.precio - cita.sena}</span></div>
                                </div>
                              </div>
                              {cita.notas && (<div className="mt-3 p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-700"><strong>Notas:</strong> {cita.notas}</p></div>)}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="estadisticas" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-6 h-6 text-blue-600" /></div><div><p className="text-sm text-gray-600">Total Citas</p><p className="text-2xl font-bold text-blue-600">{cliente.estadisticas.total_citas}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-gray-600">Total Gastado</p><p className="text-2xl font-bold text-green-600">${cliente.estadisticas.total_gastado}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="p-2 bg-orange-100 rounded-lg"><Clock className="w-6 h-6 text-orange-600" /></div><div><p className="text-sm text-gray-600">Confirmadas</p><p className="text-2xl font-bold text-orange-600">{cliente.estadisticas.citas_confirmadas}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="w-6 h-6 text-purple-600" /></div><div><p className="text-sm text-gray-600">Saldo Pendiente</p><p className="text-2xl font-bold text-purple-600">${cliente.estadisticas.saldo_pendiente}</p></div></div></CardContent></Card>
              </div>
              <Card><CardHeader><CardTitle className="text-lg">Resumen Detallado</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 gap-4"><div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">Completadas</p><p className="text-xl font-bold text-green-600">{cliente.estadisticas.citas_completadas}</p></div><div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">Canceladas</p><p className="text-xl font-bold text-red-600">{cliente.estadisticas.citas_canceladas}</p></div><div className="text-center p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">Total Seña</p><p className="text-xl font-bold text-orange-600">${cliente.estadisticas.total_seniado}</p></div></div></CardContent></Card>
              <div className="flex justify-end"><Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2"><Trash2 className="w-4 h-4" />Eliminar Cliente</Button></div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 