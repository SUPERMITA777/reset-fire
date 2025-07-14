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
  observaciones: string | null
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
    whatsapp: "",
    observaciones: ""
  })

  useEffect(() => {
    if (cliente) {
      setEditForm({
        nombre_completo: cliente.nombre_completo,
        whatsapp: cliente.whatsapp || "",
        observaciones: cliente.observaciones || ""
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
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-lg w-[95vw] max-w-[1400px] max-h-[95vh] overflow-hidden custom-scrollbar"
        style={{ 
          width: '95vw', 
          maxWidth: '1400px', 
          maxHeight: '95vh',
          minWidth: '800px'
        }}
      >
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-2rem)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                {isEditing ? "Editar Cliente" : "Detalles del Cliente"}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? "Modifica los datos del cliente" : "Información completa del cliente y su historial"}
              </p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full h-10 bg-gray-100 rounded-lg p-1">
            <TabsTrigger 
              value="datos" 
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1"
            >
              <User className="w-4 h-4" />Datos
            </TabsTrigger>
            <TabsTrigger 
              value="historial" 
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1"
            >
              <FileText className="w-4 h-4" />Historial
            </TabsTrigger>
            <TabsTrigger 
              value="estadisticas" 
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex-1"
            >
              <TrendingUp className="w-4 h-4" />Estadísticas
            </TabsTrigger>
          </TabsList>
          <div className="mt-3">
            <TabsContent value="datos" className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                        <Input 
                          id="whatsapp" 
                          value={editForm.whatsapp} 
                          onChange={e => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))} 
                          disabled={!isEditing} 
                          placeholder="+54 9 11 1234-5678"
                          maxLength={15}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="nombre" className="text-sm">Nombre Completo</Label>
                        <Input 
                          id="nombre" 
                          value={editForm.nombre_completo} 
                          onChange={e => setEditForm(prev => ({ ...prev, nombre_completo: e.target.value }))} 
                          disabled={!isEditing} 
                          placeholder="Nombre completo del cliente"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="observaciones" className="text-sm">Observaciones</Label>
                      <textarea 
                        id="observaciones" 
                        value={editForm.observaciones} 
                        onChange={e => setEditForm(prev => ({ ...prev, observaciones: e.target.value }))} 
                        disabled={!isEditing} 
                        placeholder="Alergias, medicación, detalles importantes..."
                        className="w-full h-20 p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Registrado: {format(new Date(cliente.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Total citas: {cliente.total_citas}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {isEditing && (
                <DialogFooter className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />Guardar
                  </Button>
                </DialogFooter>
              )}
            </TabsContent>
            <TabsContent value="historial" className="space-y-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Historial Clínico</CardTitle>
                </CardHeader>
                <CardContent>
                  {cliente.rf_citas.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay citas registradas para este cliente</p>
                    </div>
                  ) : (
                    <div 
                      className="h-[400px] border rounded-md overflow-y-auto pr-4 custom-scrollbar-historial" 
                      style={{ 
                        scrollbarWidth: 'auto', 
                        scrollbarColor: '#475569 #e2e8f0',
                        scrollbarGutter: 'stable'
                      }}
                    >
                      <div className="space-y-2 p-2">
                        {cliente.rf_citas.map((cita) => (
                          <Card key={cita.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">{cita.tratamiento_nombre}</h4>
                                  <p className="text-xs text-gray-600 truncate">{cita.subtratamiento_nombre}</p>
                                </div>
                                <Badge className={`${getEstadoColor(cita.estado)} text-xs ml-2`}>
                                  {getEstadoText(cita.estado)}
                                </Badge>
                              </div>
                              <div className="w-full overflow-x-auto">
                                <div className="grid grid-cols-4 gap-3 text-xs min-w-[500px]">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-gray-500" />
                                      <span className="truncate">{cita.fecha_formateada}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-gray-500" />
                                      <span>{cita.hora} ({cita.duracion}min)</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-gray-500" />
                                      <span>Box {cita.box}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 text-green-600" />
                                      <span>${cita.precio}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 text-orange-600" />
                                      <span>Seña: ${cita.sena}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 text-purple-600" />
                                      <span>Saldo: ${cita.precio - cita.sena}</span>
                                    </div>
                                                                     </div>
                                 </div>
                               </div>
                              {cita.notas && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                  <p className="text-gray-700">
                                    <strong>Notas:</strong> {cita.notas}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="estadisticas" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Citas</p>
                        <p className="text-lg font-bold text-blue-600">{cliente.estadisticas.total_citas}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-green-100 rounded">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Gastado</p>
                        <p className="text-lg font-bold text-green-600">${cliente.estadisticas.total_gastado}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-orange-100 rounded">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Confirmadas</p>
                        <p className="text-lg font-bold text-orange-600">{cliente.estadisticas.citas_confirmadas}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-purple-100 rounded">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Saldo Pendiente</p>
                        <p className="text-lg font-bold text-purple-600">${cliente.estadisticas.saldo_pendiente}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Resumen Detallado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Completadas</p>
                      <p className="text-lg font-bold text-green-600">{cliente.estadisticas.citas_completadas}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Canceladas</p>
                      <p className="text-lg font-bold text-red-600">{cliente.estadisticas.citas_canceladas}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Total Seña</p>
                      <p className="text-lg font-bold text-orange-600">${cliente.estadisticas.total_seniado}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end pt-2">
                <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />Eliminar Cliente
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        </div>
      </div>
    </div>
  )
} 