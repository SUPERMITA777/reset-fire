"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Phone, Mail, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Cliente = {
  id: string
  nombre_completo: string
  dni: string
  telefono: string | null
  email: string | null
  fecha_nacimiento: string | null
  direccion: string | null
  historia_clinica: Record<string, any>
  created_at: string
  updated_at: string
  total_citas: number
  ultima_cita: string | null
}

type Cita = {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  box_id: number
  color: string
  observaciones: string | null
  tratamiento_nombre: string
  subtratamiento_nombre: string
  duracion: number
  precio: number
  senia: number
  estado: 'completada' | 'pendiente'
}

export function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [citasCliente, setCitasCliente] = useState<Cita[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      setCargando(true)
      const response = await fetch('/api/clientes')
      if (!response.ok) throw new Error('Error al cargar los clientes')
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }

  const cargarCitasCliente = async (clienteId: string) => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}/citas`)
      if (!response.ok) throw new Error('Error al cargar las citas del cliente')
      const data = await response.json()
      setCitasCliente(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const handleClienteClick = async (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    await cargarCitasCliente(cliente.id)
    setDialogoAbierto(true)
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (cliente.dni && cliente.dni.includes(busqueda)) ||
    (cliente.telefono && cliente.telefono.includes(busqueda))
  )

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo cliente
              </DialogDescription>
            </DialogHeader>
            {/* Formulario de nuevo cliente aquí */}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Citas</TableHead>
                <TableHead>Última Cita</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : clientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No se encontraron clientes
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <TableRow 
                    key={cliente.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleClienteClick(cliente)}
                  >
                    <TableCell>{cliente.nombre_completo}</TableCell>
                    <TableCell>{cliente.dni}</TableCell>
                    <TableCell>
                      {cliente.telefono ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {cliente.telefono}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {cliente.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {cliente.email}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{cliente.total_citas}</TableCell>
                    <TableCell>
                      {cliente.ultima_cita ? (
                        format(new Date(cliente.ultima_cita), 'dd/MM/yyyy', { locale: es })
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {clienteSeleccionado?.nombre_completo} - Historial de Citas
            </DialogTitle>
            <DialogDescription>
              Detalle de todas las citas del cliente
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Box</TableHead>
                  <TableHead>Tratamiento</TableHead>
                  <TableHead>Subtratamiento</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Seña</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citasCliente.map((cita) => (
                  <TableRow key={cita.id}>
                    <TableCell>
                      {format(new Date(cita.fecha), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {cita.hora_inicio} - {cita.hora_fin}
                    </TableCell>
                    <TableCell>Box {cita.box_id}</TableCell>
                    <TableCell>{cita.tratamiento_nombre}</TableCell>
                    <TableCell>{cita.subtratamiento_nombre}</TableCell>
                    <TableCell>${cita.precio}</TableCell>
                    <TableCell>${cita.senia}</TableCell>
                    <TableCell>
                      <Badge variant={cita.estado === 'completada' ? 'default' : 'secondary'}>
                        {cita.estado === 'completada' ? 'Completada' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
