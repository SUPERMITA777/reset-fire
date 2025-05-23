import { Configuracion } from "@/components/configuracion"

export default function ConfiguracionPage() {
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Personaliza la configuración de tu sistema</p>
      </div>
      <Configuracion />
    </div>
  )
}
