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
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"; // Plus removed
import { supabase } from "@/lib/supabase";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import { EventInput, EventClickArg, DateSelectArg, EventDropArg, EventApi } from '@fullcalendar/core'; // Re-added EventDropArg, Added EventApi
import { toast } from "@/components/ui/use-toast";
import { CitaModal } from "@/components/modals/cita-modal";
import { format, parseISO } from "date-fns";
// resourceTimelinePlugin removed
import { es } from "date-fns/locale";
import type { Cita, CitaWithRelations, Tratamiento, SubTratamiento } from "@/types/cita";
// Select components removed
// CalendarEvent (from ui) removed

const BOXES = Array.from({ length: 8 }, (_, i) => ({ id: (i + 1).toString(), title: `BOX ${i + 1}` }));

type ViewType = "resourceTimeGridDay" | "resourceTimeGridWeek" | "resourceTimeGridMonth";

// Interface for data coming from CitaModal
interface CitaFormInput {
  id?: string; // Optional for new citas
  cliente_id: string; // Changed from paciente_id
  tratamiento_id: string;
  subtratamiento_id: string;
  fecha: string; // Expecting 'yyyy-MM-dd'
  hora: string; // Expecting 'HH:mm'
  box: number;
  estado: string;
  precio: number;
  sena: number;
  notas: string | null;
  es_multiple: boolean;
  duracion: number;
}

interface CustomEventExtendedProps {
  tipo?: string;
  estado?: string;
  es_multiple?: boolean;
  subtratamiento?: string;
  clienteInfo?: string;
  boxes?: number[];
  cita?: CitaWithRelations; // Include the full cita if it's passed
  duracion?: number; // If passed separately
  cantidad?: number; // If passed separately
}

interface CustomEventArg {
  event: EventApi | EventInput; // EventApi is often what you get in render hooks, EventInput for adding events
  // It's better to use the specific type from FullCalendar's event render hooks if available, e.g., EventContentArg
  // For simplicity, we'll ensure extendedProps matches CustomEventExtendedProps.
  // extendedProps should conform to CustomEventExtendedProps
}


// DisponibilidadFromDB removed (unused)

interface Disponibilidad {
  id: string;
  tratamiento_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  boxes_disponibles: number[];
  cantidad_clientes: number;
  created_at?: string;
  updated_at?: string;
  nombre_tratamiento: string;
  rf_tratamientos: {
    id: string;
    nombre_tratamiento: string;
  } | null;
}

interface EventColors {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

// EventDropInfo removed (unused, will use EventDropArg from FullCalendar directly if needed for handleEventDrop)
// EventAllowInfo removed (unused)
// EventExtendedProps removed (unused, event.extendedProps is used directly)
// Internal CalendarEvent interface (shadowing imported one) removed, will use arg.event.title directly or define specific type for arg if needed.

export default function CalendarioPage() {
  const [citas, setCitas] = useState<CitaWithRelations[]>([]);
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Keep for now, might become unused
  const [currentView, setCurrentView] = useState<ViewType>("resourceTimeGridDay");
  const [currentDate, setCurrentDate] = useState(new Date()); // Add type for clarity: const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<CitaWithRelations | null>(null);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [citaAEditar, setCitaAEditar] = useState<CitaWithRelations | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar citas
        const { data: citasData, error: citasError } = await supabase
          .from('rf_citas')
        .select(`
            *,
            rf_clientes (
              id,
              dni,
              nombre_completo,
              whatsapp
            ),
            rf_subtratamientos (
              id,
              nombre_subtratamiento,
              duracion,
              precio,
              rf_tratamientos (
                id,
                nombre_tratamiento
              )
            ),
            rf_citas_clientes ( count )
          `)
          .order('fecha', { ascending: true });

        if (citasError) throw citasError;

        // Cargar tratamientos
        const { data: tratamientosData, error: tratamientosError } = await supabase
          .from('rf_tratamientos')
          .select('*')
          .order('nombre_tratamiento');

        if (tratamientosError) throw tratamientosError;

        // Cargar disponibilidades
        const { data: disponibilidadData, error: disponibilidadError } = await supabase
          .from('rf_disponibilidad')
          .select(`
            *,
          rf_tratamientos (
            id,
            nombre_tratamiento
          )
        `)
          .order('fecha_inicio', { ascending: true });

        if (disponibilidadError) throw disponibilidadError;

        // Transformar disponibilidades para incluir nombre_tratamiento
        const disponibilidadesFormateadas = disponibilidadData?.map(d => ({
          ...d,
          nombre_tratamiento: d.rf_tratamientos?.nombre_tratamiento || 'Sin tratamiento'
        })) || [];

        setCitas(citasData || []);
        setTratamientos(tratamientosData || []);
        setDisponibilidad(disponibilidadesFormateadas);
    } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para recargar citas
  const recargarCitas = async () => {
    try {
      const { data: citasData, error: citasError } = await supabase
        .from('rf_citas')
        .select(`
          *,
          rf_clientes (
            id,
            dni,
            nombre_completo,
            whatsapp
          ),
          rf_subtratamientos (
            id,
            nombre_subtratamiento,
            duracion,
            precio,
            rf_tratamientos (
              id,
              nombre_tratamiento
            )
          ),
          rf_citas_clientes ( count )
        `)
        .order('fecha', { ascending: true });

      if (citasError) throw citasError;
      setCitas(citasData || []);
    } catch (err) {
      console.error('Error al recargar citas:', err);
      toast({
        title: "Error",
        description: "No se pudieron recargar las citas",
        variant: "destructive"
      });
    }
  };

  // Función para obtener la duración de una cita
  const getCitaDuration = (cita: CitaWithRelations): number => {
    // Si la cita tiene duración definida, usarla
    if (cita.duracion) {
      return cita.duracion;
    }
    
    // Si no, intentar obtener la duración del subtratamiento
    if (cita.rf_subtratamientos?.duracion) {
      return cita.rf_subtratamientos.duracion;
    }
    
    // Si no hay duración definida, usar 30 minutos por defecto
    return 30;
  };

  // Función para obtener los colores según el estado
  const getEstadoColor = (estado: string): EventColors => {
    const colors = {
      reservado: {
        backgroundColor: '#dbeafe', // bg-blue-100
        borderColor: '#bfdbfe',    // border-blue-200
        textColor: '#1e40af'       // text-blue-800
      },
      confirmado: {
        backgroundColor: '#dcfce7', // bg-green-100
        borderColor: '#bbf7d0',    // border-green-200
        textColor: '#166534'       // text-green-800
      },
      cancelado: {
        backgroundColor: '#fee2e2', // bg-red-100
        borderColor: '#fecaca',    // border-red-200
        textColor: '#991b1b'       // text-red-800
      },
      completado: {
        backgroundColor: '#f3f4f6', // bg-gray-100
        borderColor: '#e5e7eb',    // border-gray-200
        textColor: '#374151'       // text-gray-700
      }
    };

    return colors[estado as keyof typeof colors] || colors.reservado;
  };

  // Mapear disponibilidades a eventos
  const disponibilidadEvents: EventInput[] = disponibilidad.map((d) => {
    const start = new Date(`${d.fecha_inicio}T${d.hora_inicio}`);
    const end = new Date(`${d.fecha_fin}T${d.hora_fin}`);
    
    return {
      id: `disp-${d.id}`,
      title: d.nombre_tratamiento,
      start: start.toISOString(),
      end: end.toISOString(),
      resourceId: d.boxes_disponibles[0].toString(),
      display: "background",
      backgroundColor: "rgba(254, 249, 195, 0.15)", // bg-yellow-100 con muy poca opacidad
      borderColor: "transparent",
      textColor: "transparent",
      extendedProps: {
        tipo: "disponibilidad",
        boxes: d.boxes_disponibles,
        tratamiento_id: d.tratamiento_id
      }
    };
  });

  // Función para transformar citas a eventos del calendario
  const getCitaEvents = () => {
    return citas.map(cita => {
      const subtratamiento = cita.rf_subtratamientos?.nombre_subtratamiento || 'Sin tratamiento';
      const cantidad = cita.rf_citas_clientes?.[0]?.count || 0;
      const clienteInfo = cita.es_multiple
        ? `${cantidad} ${cantidad === 1 ? 'cliente' : 'clientes'}`
        : (cita.rf_clientes?.nombre_completo || 'Sin cliente');
      
      return {
        id: cita.id,
        title: subtratamiento, // se usará en el content
        start: `${cita.fecha}T${cita.hora}`,
        end: `${cita.fecha}T${cita.hora}`,
        resourceId: cita.box.toString(),
        extendedProps: {
          cita,
          subtratamiento,
          clienteInfo,
          duracion: getCitaDuration(cita),
          estado: cita.estado,
          es_multiple: cita.es_multiple,
          cantidad,
          tipo: "cita"
        }
      };
    });
  };

  // Combinar eventos de disponibilidad y citas
  const allEvents = [...disponibilidadEvents, ...getCitaEvents()];

  // Renderizar contenido de eventos
  const eventContent = (arg: { event: EventInput & { extendedProps: CustomEventExtendedProps } }) => {
    const { event } = arg;
    // Now extendedProps are strongly typed
    const tipo = event.extendedProps.tipo;
    const estado = event.extendedProps.estado;
    const es_multiple = event.extendedProps.es_multiple;
    const subtratamiento = event.extendedProps.subtratamiento;
    const clienteInfo = event.extendedProps.clienteInfo;
    
    const defaultColors: EventColors = { 
      backgroundColor: '#fef9c3',  // bg-yellow-100 sólido
      textColor: '#854d0e',        // text-yellow-800 sólido
      borderColor: '#fef08a'       // border-yellow-200 sólido
    };
    
    const colors: EventColors = estado ? getEstadoColor(estado) : defaultColors;

    if (tipo === "disponibilidad") {
      return {
        html: `
          <div class="fc-event-main-frame" style="background-color: ${colors.backgroundColor}; border-color: ${colors.borderColor}; color: ${colors.textColor}; z-index: 0; pointer-events: none; opacity: 0.15;">
            <div class="fc-event-title-container">
              <div class="fc-event-title fc-sticky text-sm font-medium">
                ${event.title}
                <br/>
                <span class="text-xs">Boxes: ${event.extendedProps?.boxes?.join(", ") || ""}</span>
              </div>
            </div>
          </div>
        `
      };
    } else if (tipo === "cita" || !tipo) {
      const multipleBadge = es_multiple ? '<span class="inline-block px-1 bg-blue-500 text-white text-[9px] rounded ml-1">MÚLTIPLE</span>' : '';
      
      return {
        html: `
          <div class="fc-event-main-frame" style="background-color: ${colors.backgroundColor}; border-color: ${colors.borderColor}; color: ${colors.textColor}; z-index: 20;">
            <div class="fc-event-title-container">
              <div class="fc-event-title fc-sticky text-xs font-semibold leading-tight truncate">
                ${subtratamiento}${multipleBadge}
              </div>
              <div class="text-[10px] leading-tight truncate">
                ${clienteInfo}
              </div>
            </div>
          </div>
        `
      };
    }
    return null;
  };

  const handleEventDrop = async (eventDropInfo: EventDropArg) => {
    const cita = eventDropInfo.event.extendedProps.cita as CitaWithRelations; // Assuming 'cita' is always there for draggable events
    if (!cita) {
      // This might happen if non-cita events are somehow made draggable and don't have 'cita' in extendedProps
      console.warn("Dropped event has no 'cita' in extendedProps", eventDropInfo.event);
      eventDropInfo.revert(); // Revert the drop if it's not a valid cita event
      return;
    }
    const nuevaFecha = eventDropInfo.event.startStr.split('T')[0];
    const nuevaHora = eventDropInfo.event.startStr.split('T')[1]?.slice(0,5); // Ensure time is part of startStr

    let nuevoBoxIdStr: string | undefined;
    const resources = eventDropInfo.event.getResources();
    if (resources && resources.length > 0) {
      nuevoBoxIdStr = resources[0].id;
    } else if (eventDropInfo.oldEvent?.getResources) { // Fallback to old event's resources if new ones aren't immediately available
        const oldResources = eventDropInfo.oldEvent.getResources();
        if (oldResources && oldResources.length > 0) {
            nuevoBoxIdStr = oldResources[0].id;
        }
    }

    // If still no resource ID, try from the original cita object (less reliable for new box)
    const nuevoBox = parseInt(nuevoBoxIdStr || cita.box.toString());
    try {
      const { error } = await supabase
        .from('rf_citas')
        .update({ fecha: nuevaFecha, hora: nuevaHora, box: nuevoBox })
        .eq('id', cita.id);
      if (error) throw error;
      await recargarCitas();
      toast({ title: "Cita actualizada", description: "Se guardaron los cambios de horario/box." });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar la cita.", variant: "destructive" });
      info.revert();
    }
  };

  // Manejador para clic en una cita
  const handleEventClick = (clickInfo: EventClickArg) => {
    const { event } = clickInfo;
    const cita = event.extendedProps.cita as CitaWithRelations;
    if (cita) {
      setCitaAEditar(cita);
      setShowModalEditar(true);
    }
  };

  // Manejador para clic en una celda del calendario
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const fecha = selectInfo.start;
    const hora = format(fecha, 'HH:mm');
    const box = parseInt(selectInfo.resource?.id || '1');
    
    setCurrentDate(fecha);
    setSelectedCita({
      id: "",
      cliente_id: "",
      tratamiento_id: "",
      subtratamiento_id: "",
      fecha: format(fecha, 'yyyy-MM-dd'),
      hora: hora,
      box: box,
      estado: "reservado",
      es_multiple: false,
      precio: 0,
      duracion: 30,
      sena: 0,
      notas: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rf_clientes: null,
      rf_subtratamientos: null
    });
    setShowModal(true);
  };

  const handleSubmitCita = async (formData: CitaFormInput) => {
    try {
      // Crear o actualizar la cita en la base de datos
      if (formData.id) {
        // Actualizar cita existente
        const { error: updateError } = await supabase
          .from("rf_citas")
          .update({ // Ensure these fields match your Supabase table columns for rf_citas
            cliente_id: formData.cliente_id, // Corrected from paciente_id
            tratamiento_id: formData.tratamiento_id,
            subtratamiento_id: formData.subtratamiento_id,
            fecha: formData.fecha,
            hora: formData.hora,
            box: formData.box,
            estado: formData.estado,
            precio: formData.precio,
            sena: formData.sena,
            notas: formData.notas
            // es_multiple and duracion might not be directly updatable here if they are derived or set differently
          })
          .eq("id", formData.id);

        if (updateError) {
          throw new Error(`Error al actualizar cita: ${updateError.message}`);
        }
      } else {
        // Crear nueva cita
        const { error: createError } = await supabase
          .from("rf_citas")
          .insert({ // Ensure these fields match your Supabase table columns for rf_citas
            cliente_id: formData.cliente_id, // Corrected from paciente_id
            tratamiento_id: formData.tratamiento_id,
            subtratamiento_id: formData.subtratamiento_id,
            fecha: formData.fecha,
            hora: formData.hora,
            box: formData.box,
            estado: formData.estado,
            precio: formData.precio,
            sena: formData.sena,
            notas: formData.notas,
            es_multiple: formData.es_multiple, // Make sure this is intended for direct insert
            duracion: formData.duracion     // Make sure this is intended for direct insert
          });

        if (createError) {
          throw new Error(`Error al crear cita: ${createError.message}`);
        }
      }

      // Recargar las citas y cerrar el modal
      await recargarCitas();
      setShowModal(false);
      setSelectedCita(null);

      toast({
        title: "Éxito",
        description: formData.id ? "Cita actualizada correctamente" : "Cita creada correctamente"
      });

      return true; // Indicar éxito
    } catch (error) {
      console.error("Error al guardar cita:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al guardar la cita";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error; // Re-lanzar el error para que el componente hijo pueda manejarlo
    }
  };

  const handleGuardarCita = async (citaData: CitaFormInput) => { // Typed citaData
    try {
      // Recargar las citas después de guardar
      // This function is called by CitaModal's onSubmit, which itself calls handleSubmitCita.
      // handleSubmitCita already reloads citas. So, this might be redundant.
      // However, it ensures data consistency if used independently.
      await recargarCitas();
      
      // Cerrar el modal
      setShowModalEditar(false);
      setCitaAEditar(null);
      
      toast({
        title: "Éxito",
        description: citaData.id ? "Cita actualizada correctamente" : "Cita creada correctamente"
      });
    } catch (error) {
      console.error("Error al guardar cita:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la cita",
        variant: "destructive"
      });
    }
  };

  // handleViewChange removed as it was unused

  const goToPrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
    calendarRef.current?.getApi().gotoDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
    calendarRef.current?.getApi().gotoDate(newDate);
  };

  // Función para formatear fechas
  const formatearFecha = (fecha: string) => {
    try {
      const fechaObj = parseISO(fecha);
      return format(fechaObj, "EEEE d 'de' MMMM", { locale: es });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return fecha;
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
          <h1 className="text-3xl font-bold">Calendario de Citas</h1>
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
              {formatearFecha(currentDate.toISOString())}
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

      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Cargando citas...</p>
          </div>
      </div>
      ) : (
        <Card className="p-2 bg-white">
          <FullCalendar
            ref={calendarRef}
            plugins={[resourceTimeGridPlugin, timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView={currentView}
            initialDate={currentDate}
            locale={es}
            slotMinTime="08:00:00"
            slotMaxTime="21:00:00"
            slotDuration="00:15:00"
            allDaySlot={false}
            nowIndicator={true}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,resourceTimeGridDay"
            }}
            resources={BOXES}
            datesSet={(arg) => setCurrentDate(arg.start)}
            events={allEvents}
            eventContent={eventContent}
            height="auto"
            eventOrder="tipo"
            eventDisplay="block"
            eventBackgroundColor="#fef9c3"
            eventBorderColor="#fef08a"
            eventTextColor="#854d0e"
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
            eventOverlap={true}
            eventConstraint={{
              startTime: '08:00',
              endTime: '21:00',
              dows: [1, 2, 3, 4, 5, 6] // Lunes a Sábado
            }}
            eventAllow={(dropInfo) => {
              const start = dropInfo.start;
              if (!start) return false;
              
              // Validar horario
              const hora = start.getHours();
              const minutos = start.getMinutes();
              return hora >= 8 && (hora < 21 || (hora === 21 && minutos === 0));
            }}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            selectMirror={true}
            selectConstraint={{
              startTime: '08:00',
              endTime: '21:00',
              dows: [1, 2, 3, 4, 5, 6]
            }}
            dayCellClassNames="fc-day-today:bg-white"
          />
        </Card>
      )}

      {showModal && (
        <CitaModal
          open={showModal}
          onOpenChange={setShowModal}
          onSubmit={handleSubmitCita}
          cita={selectedCita}
          tratamientos={tratamientos}
          fechaSeleccionada={selectedCita?.fecha}
          horaSeleccionada={selectedCita?.hora}
          boxSeleccionado={selectedCita?.box}
          title={selectedCita?.id ? "Editar Cita" : "Nueva Cita"}
          description={selectedCita?.id ? "Modifica los detalles de la cita" : "Complete los datos para crear una nueva cita"}
        />
      )}

      {showModalEditar && citaAEditar && (
        <CitaModal
          open={showModalEditar}
          onOpenChange={setShowModalEditar}
          onSubmit={handleGuardarCita}
          cita={citaAEditar}
          tratamientos={tratamientos}
          fechaSeleccionada={citaAEditar?.fecha}
          horaSeleccionada={citaAEditar?.hora}
          boxSeleccionado={citaAEditar.box}
          title="Editar Cita"
          description="Modifica los detalles de la cita"
        />
      )}
    </div>
  );
} 