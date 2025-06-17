"use client";

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export function BackupSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBackup = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Llamar a la función de backup en Supabase
      const { data, error: backupError } = await supabase.functions.invoke('backup-database', {
        method: 'POST',
      })

      if (backupError) {
        throw new Error(backupError.message)
      }

      // Crear un blob con los datos del backup
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      
      // Crear un enlace temporal y hacer clic en él para descargar
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Backup completado",
        description: "El backup se ha descargado correctamente",
      })
    } catch (err) {
      console.error('Error al realizar el backup:', err)
      setError(err instanceof Error ? err.message : 'Error al realizar el backup')
      toast({
        title: "Error",
        description: "No se pudo realizar el backup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      setError(null)

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string)

          // Llamar a la función de restauración en Supabase
          const { error: restoreError } = await supabase.functions.invoke('restore-database', {
            method: 'POST',
            body: { backupData },
          })

          if (restoreError) {
            throw new Error(restoreError.message)
          }

          toast({
            title: "Restauración completada",
            description: "La base de datos se ha restaurado correctamente",
          })
        } catch (err) {
          console.error('Error al restaurar el backup:', err)
          setError(err instanceof Error ? err.message : 'Error al restaurar el backup')
          toast({
            title: "Error",
            description: "No se pudo restaurar el backup",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      reader.readAsText(file)
    } catch (err) {
      console.error('Error al leer el archivo:', err)
      setError(err instanceof Error ? err.message : 'Error al leer el archivo')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Backup de la Base de Datos</CardTitle>
          <CardDescription>
            Realiza una copia de seguridad de la base de datos o restaura una copia anterior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              onClick={handleBackup}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isLoading ? "Generando backup..." : "Crear Backup"}
            </Button>

            <div className="relative">
              <Button
                asChild
                variant="outline"
                disabled={isLoading}
                className="flex items-center gap-2 w-full"
              >
                <label>
                  <Upload className="h-4 w-4" />
                  {isLoading ? "Restaurando..." : "Restaurar Backup"}
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleRestore}
                    disabled={isLoading}
                  />
                </label>
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Instrucciones:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>El backup se descargará como un archivo JSON</li>
              <li>Guarda el archivo de backup en un lugar seguro</li>
              <li>Para restaurar, selecciona un archivo de backup válido</li>
              <li>La restauración sobrescribirá los datos actuales</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 