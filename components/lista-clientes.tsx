"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Phone, Mail } from "lucide-react"

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

// Datos de ejemplo para clientes
const clientesIniciales = [
  {
    id: 1,
    nombre: "María López",
    telefono: "612-345-6789",
    email: "maria@ejemplo.com",
    ultimaVisita: "15/04/2025",
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    telefono: "612-987-6543",
    email: "carlos@ejemplo.com",
    ultimaVisita: "10/04/2025",
  },
  {
    id: 3,
    nombre: "Laura Martínez",
    telefono: "612-456-7890",
    email: "laura@ejemplo.com",
    ultimaVisita: "05/04/2025",
  },
  {
    id: 4,
    nombre: "Javier García",
    telefono: "612-567-8901",
    email: "javier@ejemplo.com",
    ultimaVisita: "01/04/2025",
  },
  {
    id: 5,
    nombre: "Ana Sánchez",
    telefono: "612-678-9012",
    email: "ana@ejemplo.com",
    ultimaVisita: "28/03/2025",
  },
]

export function ListaClientes() {
  const [clientes, setClientes] = useState(clientesIniciales)
  const [busqueda, setBusqueda] = useState("")
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
  })
  const [dialogoClienteAbierto, setDialogoClienteAbierto] = useState(false)

  // Filtrar clientes según la búsqueda
  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.telefono.includes(busqueda) ||
      cliente.email.toLowerCase().includes(busqueda.toLowerCase()),
  )

  // Función para agregar un nuevo cliente
  const agregarCliente = () => {
    if (!nuevoCliente.nombre.trim()) return

    setClientes([
      ...clientes,
      {
        id: clientes.length + 1,
        nombre: nuevoCliente.nombre,
        telefono: nuevoCliente.telefono,
        email: nuevoCliente.email,
        ultimaVisita: "-",
      },
    ])

    setNuevoCliente({
      nombre: "",
      telefono: "",
      email: "",
    })
    setDialogoClienteAbierto(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cliente..."
            className="pl-8"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Dialog open={dialogoClienteAbierto} onOpenChange={setDialogoClienteAbierto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              <DialogDescription>Ingresa la información del nuevo cliente.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  placeholder="Ej: María López"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={nuevoCliente.telefono}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                  placeholder="Ej: 612-345-6789"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                  placeholder="Ej: cliente@ejemplo.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoClienteAbierto(false)}>
                Cancelar
              </Button>
              <Button onClick={agregarCliente}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tabla" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tabla">Vista de Tabla</TabsTrigger>
          <TabsTrigger value="tarjetas">Vista de Tarjetas</TabsTrigger>
        </TabsList>

        {/* Vista de Tabla */}
        <TabsContent value="tabla">
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Teléfono</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Última visita</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{cliente.nombre}</td>
                      <td className="px-4 py-3">{cliente.telefono}</td>
                      <td className="px-4 py-3">{cliente.email}</td>
                      <td className="px-4 py-3">{cliente.ultimaVisita}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {clientesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">
                        No se encontraron clientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Vista de Tarjetas */}
        <TabsContent value="tarjetas">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientesFiltrados.map((cliente) => (
              <Card key={cliente.id}>
                <CardHeader>
                  <CardTitle>{cliente.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{cliente.telefono}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{cliente.email}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground">Última visita: {cliente.ultimaVisita}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {clientesFiltrados.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">No se encontraron clientes</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
