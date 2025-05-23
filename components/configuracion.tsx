"use client"

import { useState } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Configuracion() {
  const [nombreNegocio, setNombreNegocio] = useState("RESET PRO V2")
  const [horaInicio, setHoraInicio] = useState("08:00")
  const [horaFin, setHoraFin] = useState("20:00")
  const [intervaloTurnos, setIntervaloTurnos] = useState("15")
  const [modoOscuro, setModoOscuro] = useState(false)
  const [recordatorios, setRecordatorios] = useState(true)
  const [tiempoRecordatorio, setTiempoRecordatorio] = useState("24")

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="horarios">Horarios</TabsTrigger>
        <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
      </TabsList>

      {/* Configuración General */}
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>Configura los ajustes generales de tu sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nombreNegocio">Nombre del Negocio</Label>
              <Input id="nombreNegocio" value={nombreNegocio} onChange={(e) => setNombreNegocio(e.target.value)} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="modoOscuro">Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">Activa el modo oscuro para la interfaz</p>
              </div>
              <Switch id="modoOscuro" checked={modoOscuro} onCheckedChange={setModoOscuro} />
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Configuración de Horarios */}
      <TabsContent value="horarios" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Horarios</CardTitle>
            <CardDescription>Configura los horarios de atención y turnos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="horaInicio">Hora de Inicio</Label>
                <Input id="horaInicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="horaFin">Hora de Fin</Label>
                <Input id="horaFin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
              </div>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="intervaloTurnos">Intervalo de Turnos (minutos)</Label>
              <Select value={intervaloTurnos} onValueChange={setIntervaloTurnos}>
                <SelectTrigger id="intervaloTurnos">
                  <SelectValue placeholder="Seleccionar intervalo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="10">10 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Define cada cuántos minutos se pueden agendar turnos</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Configuración de Notificaciones */}
      <TabsContent value="notificaciones" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Notificaciones</CardTitle>
            <CardDescription>Configura las notificaciones y recordatorios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recordatorios">Recordatorios de Citas</Label>
                <p className="text-sm text-muted-foreground">Enviar recordatorios automáticos a los clientes</p>
              </div>
              <Switch id="recordatorios" checked={recordatorios} onCheckedChange={setRecordatorios} />
            </div>

            {recordatorios && (
              <>
                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="tiempoRecordatorio">Tiempo de Anticipación (horas)</Label>
                  <Select value={tiempoRecordatorio} onValueChange={setTiempoRecordatorio}>
                    <SelectTrigger id="tiempoRecordatorio">
                      <SelectValue placeholder="Seleccionar tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora antes</SelectItem>
                      <SelectItem value="2">2 horas antes</SelectItem>
                      <SelectItem value="12">12 horas antes</SelectItem>
                      <SelectItem value="24">24 horas antes</SelectItem>
                      <SelectItem value="48">2 días antes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Cuánto tiempo antes de la cita se enviará el recordatorio
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
