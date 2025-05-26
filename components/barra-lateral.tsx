"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MiniCalendario } from "@/components/mini-calendario"
import { useMobile } from "@/hooks/use-mobile"
import { getCitasPorFecha } from "@/lib/supabase"
import type { Cita } from "@/types/cita"
export function BarraLateral() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(new Date())
  const isMobile = useMobile()
  const [citasProximas, setCitasProximas] = useState<Cita[]>([])

  useEffect(() => {
    if (fechaSeleccionada) {
      getCitasPorFecha(fechaSeleccionada).then((citasAgrupadas) => {
        const fechaStr = format(fechaSeleccionada, 'yyyy-MM-dd')
        setCitasProximas(citasAgrupadas[fechaStr] || [])
      })
    }
  }, [fechaSeleccionada])

  const ContenidoBarraLateral = () => (
    <div className="flex h-full flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniCalendario
            fechaSeleccionada={fechaSeleccionada}
            onSeleccionarFecha={setFechaSeleccionada}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Citas del día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {citasProximas.map((cita) => (
              <div
                key={cita.id}
                className="flex items-center justify-between rounded-lg border p-2"
                style={{ borderLeftColor: cita.color, borderLeftWidth: 4 }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {cita.nombreTratamiento || cita.nombreSubTratamiento} - {cita.nombreCompleto}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(cita.fecha, "HH:mm", { locale: es })} - {cita.box}
                  </span>
                </div>
              </div>
            ))}
            {citasProximas.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">No hay citas para este día</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex items-center p-4 border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Menú
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <ContenidoBarraLateral />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="hidden md:block w-[300px] border-r p-4 overflow-auto">
      <ContenidoBarraLateral />
    </div>
  )
}
