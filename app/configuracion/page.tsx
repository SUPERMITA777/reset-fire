import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Database, Download, Upload } from "lucide-react"
import { BackupSection } from "@/components/configuracion/backup-section"

export const metadata: Metadata = {
  title: "Configuración",
  description: "Configuración del sistema y gestión de backups",
}

export default function ConfiguracionPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración del sistema y realiza backups de la base de datos
          </p>
        </div>
      </div>

      <Tabs defaultValue="backup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4">
          <BackupSection />
        </TabsContent>

        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>
                Ajusta los parámetros generales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Aquí irá el contenido de la configuración del sistema */}
              <p className="text-sm text-muted-foreground">
                Próximamente: Configuración de parámetros del sistema
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 