import { ListaClientes } from "@/components/lista-clientes"

export default function ClientesPage() {
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <p className="text-muted-foreground">Administra la información de tus clientes</p>
      </div>
      <ListaClientes />
    </div>
  )
}
