"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, User, Phone, Calendar, DollarSign, Clock, MapPin, Edit, Trash2, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteDetalle | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCliente, setEditingCliente] = useState<ClienteDetalle | null>(null)
  const [editForm, setEditForm] = useState({
    nombre_completo: "",
    dni: "",
    whatsapp: ""
  })

  // Cargar clientes
  const cargarClientes = async (search?: string) => {
    try {
      setLoading(true)
      const url = search 
        ? `/api/clientes?search=${encodeURIComponent(search)}`
        : '/api/clientes'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Error al cargar clientes')
      
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar detalles del cliente
  const cargarDetallesCliente = async (id: string) => {
    try {
      const response = await fetch(`/api/clientes/${id}`)
      if (!response.ok) throw new Error('Error al cargar detalles del cliente')
      
      const data = await response.json()
      setClienteSeleccionado(data)
      setEditingCliente(data)
      setEditForm({
        nombre_completo: data.nombre_completo,
        dni: data.dni,
        whatsapp: data.whatsapp || ""
      })
      setShowModal(true)
    } catch (error) {
      console.error('Error al cargar detalles del cliente:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del cliente",
        variant: "destructive"
      })
    }
  }

  // Actualizar cliente
  const actualizarCliente = async () => {
    if (!editingCliente) return

    try {
      const response = await fetch(`/api/clientes/${editingCliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar cliente')
      }

      const clienteActualizado = await response.json()
      
      // Actualizar la lista de clientes
      setClientes(prev => prev.map(c => 
        c.id === clienteActualizado.id ? clienteActualizado : c
      ))
      
      // Actualizar el cliente seleccionado
      setClienteSeleccionado(prev => prev ? { ...prev, ...clienteActualizado } : null)
      
      toast({
        title: "Éxito",
        description: "Cliente actualizado correctamente"
      })
    } catch (error) {
      console.error('Error al actualizar cliente:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar cliente",
        variant: "destructive"
      })
    }
  }

  // Eliminar cliente
  const eliminarCliente = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar cliente')
      }

      setClientes(prev => prev.filter(c => c.id !== id))
      setShowModal(false)
      
      toast({
        title: "Éxito",
        description: "Cliente eliminado correctamente"
      })
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar cliente",
        variant: "destructive"
      })
    }
  }

  // Búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarClientes(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Cargar clientes iniciales
  useEffect(() => {
    cargarClientes()
  }, [])

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'reservado': return 'bg-blue-100 text-blue-800'
      case 'confirmado': return 'bg-orange-100 text-orange-800'
      case 'completado': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por DNI, nombre o WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Cargando clientes...</div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No se encontraron clientes con esa búsqueda' : 'No hay clientes registrados'}
          </div>
        ) : (
          clientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{cliente.nombre_completo}</h3>
                      <Badge variant="outline">{cliente.dni}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {cliente.whatsapp && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {cliente.whatsapp}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {cliente.total_citas} citas
                      </div>
                      {cliente.ultima_cita && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Última: {format(new Date(cliente.ultima_cita), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        cargarDetallesCliente(cliente.id)
                      }}
                    >
                      <User className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalles del cliente */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription>
              Información completa del cliente y su historial
            </DialogDescription>
          </DialogHeader>

          {clienteSeleccionado && (
            <Tabs defaultValue="datos" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="datos">Datos Personales</TabsTrigger>
                <TabsTrigger value="historial">Historial Clínico</TabsTrigger>
                <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="datos" className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="text-sm font-medium">Nombre Completo</label>
                      <Input
                        value={editForm.nombre_completo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nombre_completo: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">DNI</label>
                      <Input
                        value={editForm.dni}
                        onChange={(e) => setEditForm(prev => ({ ...prev, dni: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">WhatsApp</label>
                      <Input
                        value={editForm.whatsapp}
                        onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="mt-1"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button onClick={actualizarCliente} size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Guardar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => eliminarCliente(clienteSeleccionado.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="historial" className="space-y-4">
                <div className="space-y-4">
                  {clienteSeleccionado.rf_citas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay citas registradas para este cliente
                    </div>
                  ) : (
                    clienteSeleccionado.rf_citas.map((cita) => (
                      <Card key={cita.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{cita.tratamiento_nombre}</h4>
                                <Badge className={getEstadoColor(cita.estado)}>
                                  {getEstadoText(cita.estado)}
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>Subtratamiento: {cita.subtratamiento_nombre}</div>
                                <div>Fecha: {cita.fecha_formateada}</div>
                                <div>Hora: {cita.hora}</div>
                                <div>Box: {cita.box}</div>
                                <div>Duración: {cita.duracion} minutos</div>
                                <div className="flex gap-4">
                                  <span>Precio: ${cita.precio}</span>
                                  <span>Seña: ${cita.sena}</span>
                                </div>
                                {cita.notas && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded">
                                    <strong>Notas:</strong> {cita.notas}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="estadisticas" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold">Total de Citas</h4>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {clienteSeleccionado.estadisticas.total_citas}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold">Total Gastado</h4>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ${clienteSeleccionado.estadisticas.total_gastado}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold">Citas Confirmadas</h4>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {clienteSeleccionado.estadisticas.citas_confirmadas}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold">Saldo Pendiente</h4>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        ${clienteSeleccionado.estadisticas.saldo_pendiente}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold">Resumen por Estado</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Completadas:</span>
                      <Badge variant="outline">{clienteSeleccionado.estadisticas.citas_completadas}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Canceladas:</span>
                      <Badge variant="outline">{clienteSeleccionado.estadisticas.citas_canceladas}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Seña:</span>
                      <Badge variant="outline">${clienteSeleccionado.estadisticas.total_seniado}</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 