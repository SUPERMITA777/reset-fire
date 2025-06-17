"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  Edit, 
  Trash2,
  Eye,
  Clock,
  MapPin
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Cliente {
  id: string
  dni: string
  nombre_completo: string
  whatsapp: string
  email?: string
  fecha_nacimiento?: string
  direccion?: string
  created_at: string
  updated_at: string
}

interface Cita {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  box_id: number
  tratamiento_id: string
  sub_tratamiento_id: string | null
  nombre_completo: string
  observaciones: string | null
  estado: string
  created_at: string
  tratamiento: {
    id: string
    nombre: string
  }
  sub_tratamiento: {
    id: string
    nombre: string
  } | null
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [showClienteDialog, setShowClienteDialog] = useState(false)

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarCitasCliente = async (clienteId: string) => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}/citas`)
      if (response.ok) {
        const data = await response.json()
        setCitas(data)
      }
    } catch (error) {
      console.error('Error cargando citas del cliente:', error)
    }
  }

  const handleVerCliente = async (cliente: Cliente) => {
    setSelectedCliente(cliente)
    await cargarCitasCliente(cliente.id)
    setShowClienteDialog(true)
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.dni.includes(searchTerm) ||
    cliente.whatsapp.includes(searchTerm)
  )

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'reservado': return 'bg-blue-100 text-blue-800'
      case 'confirmado': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      case 'completado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando clientes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI o WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">{cliente.nombre_completo}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>DNI: {cliente.dni}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{cliente.whatsapp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Registrado: {format(new Date(cliente.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerCliente(cliente)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? 'No se encontraron clientes con esos criterios' : 'No hay clientes registrados'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de detalles del cliente */}
      <Dialog open={showClienteDialog} onOpenChange={setShowClienteDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          
          {selectedCliente && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="citas">Historial de Citas</TabsTrigger>
                <TabsTrigger value="clinica">Historia Clínica</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                        <p className="text-lg">{selectedCliente.nombre_completo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">DNI</label>
                        <p className="text-lg">{selectedCliente.dni}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                        <p className="text-lg">{selectedCliente.whatsapp}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-lg">{selectedCliente.email || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
                        <p className="text-lg">
                          {selectedCliente.fecha_nacimiento 
                            ? format(new Date(selectedCliente.fecha_nacimiento), 'dd/MM/yyyy', { locale: es })
                            : 'No especificada'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                        <p className="text-lg">{selectedCliente.direccion || 'No especificada'}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
                        <p className="text-lg">{format(new Date(selectedCliente.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                        <p className="text-lg">{format(new Date(selectedCliente.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="citas" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Citas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {citas.length > 0 ? (
                        <div className="space-y-4">
                          {citas.map((cita) => (
                            <div key={cita.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold">
                                    {cita.tratamiento.nombre}
                                    {cita.sub_tratamiento && ` - ${cita.sub_tratamiento.nombre}`}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(cita.fecha), 'dd/MM/yyyy', { locale: es })} - {cita.hora_inicio} a {cita.hora_fin}
                                  </p>
                                </div>
                                <Badge className={getEstadoColor(cita.estado)}>
                                  {cita.estado.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>Box {cita.box_id}</span>
                                </div>
                                {cita.observaciones && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    <span>{cita.observaciones}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No hay citas registradas para este cliente
                        </p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clinica" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historia Clínica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center text-muted-foreground py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Funcionalidad de historia clínica en desarrollo</p>
                        <p className="text-sm">Aquí se mostrará información médica, alergias, tratamientos previos, etc.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 