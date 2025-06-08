"use client";

import { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import { EventInput } from '@fullcalendar/core';
import { toast } from "@/components/ui/use-toast";

const BOXES = Array.from({ length: 8 }, (_, i) => ({ id: (i + 1).toString(), title: `BOX ${i + 1}` }));

type ViewType = "resourceTimeGridDay" | "timeGridWeek" | "dayGridMonth";

interface DisponibilidadFromDB {
  id: string;
  tratamiento_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  boxes_disponibles: number[];
  rf_tratamientos: {
    id: string;
    nombre_tratamiento: string;
  } | null;
}

interface Disponibilidad {
  id: string;
  tratamiento_id: string;
  nombre_tratamiento: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  boxes_disponibles: number[];
}

export default function CalendarioPage() {
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<ViewType>("resourceTimeGridDay");
  const [date, setDate] = useState<Date>(new Date());
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDisponibilidad();
  }, []);

  const fetchDisponibilidad = async () => {
    try {
      const { data, error } = await supabase
        .from("rf_disponibilidad")
        .select(`
          id,
          tratamiento_id,
          fecha_inicio,
          fecha_fin,
          hora_inicio,
          hora_fin,
          boxes_disponibles,
          rf_tratamientos (
            id,
            nombre_tratamiento
          )
        `)
        .order("fecha_inicio", { ascending: true });

      if (error) {
        console.error("Error al obtener disponibilidad:", error);
        setError(error.message);
        return;
      }

      const disponibilidadTransformada = ((data as unknown) as DisponibilidadFromDB[]).map(d => ({
        id: d.id,
        tratamiento_id: d.tratamiento_id,
        nombre_tratamiento: d.rf_tratamientos?.nombre_tratamiento || "Sin nombre",
        fecha_inicio: d.fecha_inicio,
        fecha_fin: d.fecha_fin,
        hora_inicio: d.hora_inicio,
        hora_fin: d.hora_fin,
        boxes_disponibles: d.boxes_disponibles
      }));

      setDisponibilidad(disponibilidadTransformada);
    } catch (err) {
      console.error("Error al obtener disponibilidad:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Mapear disponibilidades a eventos
  const disponibilidadEvents: EventInput[] = disponibilidad.map((d) => ({
    id: `disp-${d.id}`,
    title: d.nombre_tratamiento,
    start: `${d.fecha_inicio}T${d.hora_inicio}`,
    end: `${d.fecha_fin}T${d.hora_fin}`,
    resourceId: d.boxes_disponibles[0].toString(),
    display: "block",
    backgroundColor: "#dcfce7",
    borderColor: "#dcfce7",
    textColor: "#374151",
    extendedProps: {
      tipo: "disponibilidad",
      boxes: d.boxes_disponibles,
      tratamiento_id: d.tratamiento_id
    }
  }));

  // Cambiar vista
  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(newView);
    }
  };

  // Cambiar día en vista diaria
  const goToPrevDay = () => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    setDate(prev);
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(prev);
    }
  };

  const goToNextDay = () => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    setDate(next);
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(next);
    }
  };

  // Renderizar marca de agua en background events
  const eventContent = (arg: any) => {
    const { event } = arg;
    const tipo = event.extendedProps.tipo;

    if (tipo === "disponibilidad") {
      return {
        html: `
          <div class="fc-event-main-frame">
            <div class="fc-event-title-container">
              <div class="fc-event-title fc-sticky text-sm font-medium text-gray-700">
                ${event.title}
                <br/>
                <span class="text-xs">Boxes: ${event.extendedProps.boxes.join(", ")}</span>
              </div>
            </div>
          </div>
        `
      };
    }

    return null;
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para manejar el evento de actualización de disponibilidad
  const handleEventDrop = async (info: any) => {
    // Prevenir la actualización automática
    info.revert();

    try {
      const eventId = info.event.id.replace('disp-', '');
      const nuevaFechaInicio = info.event.start.toISOString().split('T')[0];
      const nuevaFechaFin = info.event.end.toISOString().split('T')[0];
      const horaInicio = info.event.start.toTimeString().slice(0, 5);
      const horaFin = info.event.end.toTimeString().slice(0, 5);

      // Mostrar diálogo de confirmación
      const confirmar = window.confirm(
        `¿Desea actualizar la disponibilidad?\n\n` +
        `Nueva fecha inicio: ${nuevaFechaInicio}\n` +
        `Nueva fecha fin: ${nuevaFechaFin}\n` +
        `Nueva hora inicio: ${horaInicio}\n` +
        `Nueva hora fin: ${horaFin}`
      );

      if (!confirmar) {
        return;
      }

      // Obtener los datos actuales
      const { data: disponibilidadActual, error: errorObtener } = await supabase
        .from("rf_disponibilidad")
        .select("*")
        .eq("id", eventId)
        .single();

      if (errorObtener) {
        throw errorObtener;
      }

      // Eliminar el registro actual
      const { error: errorEliminar } = await supabase
        .from("rf_disponibilidad")
        .delete()
        .eq("id", eventId);

      if (errorEliminar) {
        throw errorEliminar;
      }

      // Crear nuevo registro
      const { error: errorCrear } = await supabase
        .from("rf_disponibilidad")
        .insert({
          tratamiento_id: disponibilidadActual.tratamiento_id,
          fecha_inicio: nuevaFechaInicio,
          fecha_fin: nuevaFechaFin,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          boxes_disponibles: disponibilidadActual.boxes_disponibles,
          cantidad_clientes: disponibilidadActual.cantidad_clientes
        });

      if (errorCrear) {
        // Si hay error, restaurar el registro original
        await supabase
          .from("rf_disponibilidad")
          .insert(disponibilidadActual);
        throw errorCrear;
      }

      // Actualizar el calendario
      await fetchDisponibilidad();
      toast({
        title: "Éxito",
        description: "Disponibilidad actualizada correctamente"
      });

    } catch (err) {
      console.error("Error al actualizar disponibilidad:", err);
      toast({
        title: "Error",
        description: "Error al actualizar la disponibilidad. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Calendario de Disponibilidad</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevDay}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[200px] text-center">
              {formatearFecha(date)}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button 
          variant={view === "resourceTimeGridDay" ? "default" : "outline"} 
          onClick={() => handleViewChange("resourceTimeGridDay")}
        >
          DÍA
        </Button>
        <Button 
          variant={view === "timeGridWeek" ? "default" : "outline"} 
          onClick={() => handleViewChange("timeGridWeek")}
        >
          SEMANA
        </Button>
        <Button 
          variant={view === "dayGridMonth" ? "default" : "outline"} 
          onClick={() => handleViewChange("dayGridMonth")}
        >
          MES
        </Button>
      </div>

      {loading ? (
        <div>Cargando disponibilidad...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <Card className="p-2">
          <FullCalendar
            ref={calendarRef}
            plugins={[resourceTimeGridPlugin, timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView={view}
            locale={esLocale}
            slotMinTime="08:00:00"
            slotMaxTime="21:00:00"
            slotDuration="00:15:00"
            allDaySlot={false}
            nowIndicator={true}
            headerToolbar={false}
            resources={BOXES}
            datesSet={(arg) => setDate(arg.start)}
            events={disponibilidadEvents}
            eventContent={eventContent}
            height="auto"
            eventOrder="tipo"
            eventDisplay="block"
            eventBackgroundColor="#dcfce7"
            eventBorderColor="#dcfce7"
            eventTextColor="#374151"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            editable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventDrop}
            eventChange={handleEventDrop}
            droppable={false}
            eventOverlap={false}
            eventConstraint={{
              startTime: '08:00',
              endTime: '21:00',
              dows: [1, 2, 3, 4, 5, 6] // Lunes a Sábado
            }}
            eventAllow={(dropInfo, draggedEvent) => {
              // Permitir cualquier cambio
              return true;
            }}
            eventSourceSuccess={(content: EventInput[]) => content}
            eventSourceFailure={(error: unknown) => {
              console.error("Error en la fuente de eventos:", error);
            }}
          />
        </Card>
      )}
    </div>
  );
} 