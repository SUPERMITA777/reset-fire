import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Database, Download, Upload } from "lucide-react"
import { BackupSection } from "@/components/configuracion/backup-section"
import { AparienciaTab } from "@/components/configuracion/apariencia-tab"
import { BackupTab } from "@/components/configuracion/backup-tab"

export const metadata: Metadata = {
  title: "Configuración",
  description: "Configuración del sistema y gestión de backups",
}

export default function ConfiguracionPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      <Tabs defaultValue="apariencia" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        <TabsContent value="apariencia">
          <AparienciaTab />
        </TabsContent>
        <TabsContent value="backup">
          <BackupTab />
        </TabsContent>
      </Tabs>
    </div>
  )
} 