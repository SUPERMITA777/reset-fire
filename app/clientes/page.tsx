"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, Phone, Calendar, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ClienteDetalleModal } from "@/components/modals/cliente-detalle-modal"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  // Función para cargar clientes con debounce
  const cargarClientes = async (search?: string) => {
    try {
      setSearching(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await fetch(`/api/clientes?${params.toString()}`)
      if (!response.ok) throw new Error('Error al cargar clientes')
      
      const data = await response.json()
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive"
      })
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  // Debounce para la búsqueda
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

  const handleClienteClick = async (cliente: Cliente) => {
    try {
      const response = await fetch(`/api/clientes/${cliente.id}`)
      if (!response.ok) throw new Error('Error al cargar detalles del cliente')
      
      const clienteDetalle = await response.json()
      setClienteSeleccionado(clienteDetalle)
      setShowModal(true)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del cliente",
        variant: "destructive"
      })
    }
  }

  const handleUpdateCliente = (clienteActualizado: ClienteDetalle) => {
    setClientes(prev => prev.map(c => 
      c.id === clienteActualizado.id 
        ? { ...c, ...clienteActualizado }
        : c
    ))
    setClienteSeleccionado(clienteActualizado)
  }

  const handleDeleteCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id))
    setClienteSeleccionado(null)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'reservado': return 'bg-blue-100 text-blue-800'
      case 'confirmado': return 'bg-orange-100 text-orange-800'
      case 'completado': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-2">Administra la información de tus clientes</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por DNI, nombre o WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        {clientes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza agregando tu primer cliente'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          clientes.map((cliente) => (
            <Card 
              key={cliente.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleClienteClick(cliente)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cliente.nombre_completo || 'Sin nombre'}
                      </h3>
                      {cliente.total_citas > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {cliente.total_citas} citas
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>DNI: {cliente.dni || 'No especificado'}</span>
                      </div>
                      
                      {cliente.whatsapp && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{cliente.whatsapp}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Registrado: {format(new Date(cliente.created_at), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <div>ID: {cliente.id.slice(0, 8)}...</div>
                    {cliente.ultima_cita && (
                      <div className="mt-1">
                        Última cita: {format(new Date(cliente.ultima_cita), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalles del cliente */}
      <ClienteDetalleModal
        open={showModal}
        onOpenChange={setShowModal}
        cliente={clienteSeleccionado}
        onUpdate={handleUpdateCliente}
        onDelete={handleDeleteCliente}
      />
    </div>
  )
} 