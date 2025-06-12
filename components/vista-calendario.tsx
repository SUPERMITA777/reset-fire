"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, isSameMonth, getDay, getDaysInMonth, startOfDay, endOfDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FormularioCita } from "@/components/formulario-cita"
import type { Cita } from "@/types/cita"
import { getCitasPorFecha } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ModalEditarCita } from "@/components/modal-editar-cita"
import { supabase } from "@/lib/supabase"
import { CitaModal } from "@/components/modals/cita-modal"
import { CitaCard } from "@/components/ui/cita-card"

interface VistaCalendarioProps {
  vista: "dia" | "semana" | "mes"
  fechaActual: Date
  onCambiarVista?: (vista: "dia" | "semana" | "mes") => void
  onCambiarFecha?: (fecha: Date) => void
}

export function VistaCalendario({ vista, fechaActual, onCambiarVista, onCambiarFecha }: VistaCalendarioProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citasAgrupadas, setCitasAgrupadas] = useState<{ [key: string]: Cita[] }>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

  // Cargar citas cuando cambia la fecha
  useEffect(() => {
    const cargarCitas = async () => {
      try {
        setLoading(true);
        const citas = await getCitasPorFecha(fechaActual);
        setCitasAgrupadas(citas);
      } catch (err) {
        console.error('Error al cargar citas:', err);
        setError('No se pudieron cargar las citas. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarCitas();
  }, [fechaActual]);

  // Manejar clic en una cita
  const handleCitaClick = (cita: Cita) => {
    setSelectedCita(cita);
    setShowEditModal(true);
  };

  // Manejar guardado de cita
  const handleGuardarCita = () => {
    setShowEditModal(false);
    setSelectedCita(null);
    // Recargar citas
    getCitasPorFecha(fechaActual).then(setCitasAgrupadas).catch(err => {
      console.error('Error al recargar citas:', err);
      setError('No se pudieron recargar las citas. Por favor, intente nuevamente.');
    });
  };

  // Filtrar citas por fecha
  const filtrarCitasPorFecha = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    return citasAgrupadas[fechaStr] || [];
  };

  // Función para renderizar la vista diaria
  const renderVistaDia = () => {
    const citasDelDia = filtrarCitasPorFecha(fechaActual);
    const citasPorBox = citasDelDia.reduce<{ [key: number]: Cita[] }>((acc, cita) => {
      if (!acc[cita.box]) {
        acc[cita.box] = [];
      }
      acc[cita.box].push(cita);
      return acc;
    }, {});

    return (
      <div className="grid grid-cols-8 gap-4 h-full">
        {/* Columna de horas */}
        <div className="col-span-1 space-y-1">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="h-12 text-xs text-gray-500 text-right pr-2">
              {format(new Date().setHours(i, 0), 'HH:mm')}
            </div>
          ))}
        </div>

        {/* Columnas de boxes */}
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="col-span-1 space-y-1 relative">
            {/* Encabezado del box */}
            <div className="h-8 text-center text-sm font-medium">
              Box {i + 1}
            </div>

            {/* Líneas de hora */}
            {Array.from({ length: 24 }, (_, hora) => (
              <div key={hora} className="h-12 border-b border-gray-100" />
            ))}
            
            {/* Citas del box */}
            {citasPorBox[i + 1]?.map((cita) => {
              const horaInicio = parseISO(`${cita.fecha}T${cita.hora}`);
              const horaInicioMinutos = horaInicio.getHours() * 60 + horaInicio.getMinutes();
              const duracion = cita.duracion || cita.rf_subtratamientos?.duracion || 30;
              
              return (
                <div
                  key={cita.id}
                  className="absolute w-full"
                  style={{
                    top: `${(horaInicioMinutos / 60) * 48 + 32}px`,
                    height: `${(duracion / 60) * 48}px`
                  }}
                >
                  <CitaCard 
                    cita={cita} 
                    onClick={() => handleCitaClick(cita)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar la vista semanal
  const renderVistaSemana = () => {
    const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 });
    const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));

    return (
      <div className="grid grid-cols-8 gap-4 h-full">
        {/* Columna de horas */}
        <div className="col-span-1 space-y-1">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="h-12 text-xs text-gray-500 text-right pr-2">
              {format(new Date().setHours(i, 0), 'HH:mm')}
            </div>
          ))}
        </div>

        {/* Columnas de días */}
        {diasSemana.map((dia, diaIndex) => (
          <div key={diaIndex} className="col-span-1 space-y-1 relative">
            {/* Encabezado del día */}
            <div className="h-8 text-center text-sm font-medium">
              {format(dia, 'EEE d', { locale: es })}
            </div>

            {/* Líneas de hora */}
            {Array.from({ length: 24 }, (_, hora) => (
              <div key={hora} className="h-12 border-b border-gray-100" />
            ))}

            {/* Citas del día */}
            {filtrarCitasPorFecha(dia).map((cita) => {
              const horaInicio = parseISO(`${cita.fecha}T${cita.hora}`);
              const horaInicioMinutos = horaInicio.getHours() * 60 + horaInicio.getMinutes();
              const duracion = cita.duracion || cita.rf_subtratamientos?.duracion || 30;
              
              return (
                <div
                  key={cita.id}
                  className="absolute w-full"
                  style={{
                    top: `${(horaInicioMinutos / 60) * 48 + 32}px`,
                    height: `${(duracion / 60) * 48}px`
                  }}
                >
                  <CitaCard 
                    cita={cita} 
                    onClick={() => handleCitaClick(cita)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar la vista mensual
  const renderVistaMes = () => {
    const inicioMes = startOfMonth(fechaActual);
    const finMes = endOfMonth(fechaActual);
    const inicioSemana = startOfWeek(inicioMes, { weekStartsOn: 1 });
    const finSemana = endOfWeek(finMes, { weekStartsOn: 1 });
    const diasMes = Array.from(
      { length: Math.ceil((finSemana.getTime() - inicioSemana.getTime()) / (1000 * 60 * 60 * 24)) },
      (_, i) => addDays(inicioSemana, i)
    );

    return (
      <div className="grid grid-cols-7 gap-1 h-full">
        {/* Encabezados de días de la semana */}
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="text-center text-sm font-medium py-2">
            {format(addDays(inicioSemana, i), 'EEE', { locale: es })}
          </div>
        ))}

        {/* Días del mes */}
        {diasMes.map((dia, index) => {
          const esDiaActual = isSameDay(dia, fechaActual);
          const esDiaMesActual = isSameMonth(dia, fechaActual);
          const citasDelDia = filtrarCitasPorFecha(dia);

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-1 border border-gray-100",
                {
                  "bg-gray-50": !esDiaMesActual,
                  "bg-white": esDiaMesActual,
                  "ring-2 ring-blue-500": esDiaActual
                }
              )}
            >
              {/* Número del día */}
              <div className={cn(
                "text-sm font-medium mb-1",
                {
                  "text-gray-400": !esDiaMesActual,
                  "text-gray-900": esDiaMesActual
                }
              )}>
                {format(dia, 'd')}
              </div>

              {/* Citas del día */}
              <div className="space-y-1">
                {citasDelDia.map((cita) => (
                  <CitaCard 
                    key={cita.id} 
                    cita={cita} 
                    onClick={() => handleCitaClick(cita)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!mounted) {
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-full border rounded-lg overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              {error}
            </div>
          ) : (
            <div className="h-full">
              {vista === 'dia' && renderVistaDia()}
              {vista === 'semana' && renderVistaSemana()}
              {vista === 'mes' && renderVistaMes()}
            </div>
          )}
        </div>
      </div>
      {showEditModal && selectedCita && (
        <ModalEditarCita
          citaId={selectedCita.id}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleGuardarCita}
        />
      )}
    </div>
  )
} 