"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { addDays, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Cita = {
  id: number;
  paciente: string;
  tratamiento: string;
  fecha: string;
  hora: string;
  estado: string;
};

export default function CalendarioPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    try {
      const { data, error } = await supabase
        .from("rf_tratamientos")
        .select("*")
        .order("fecha", { ascending: true });

      if (error) throw error;
      setCitas(data || []);
    } catch (error) {
      console.error("Error fetching citas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las citas del día seleccionado
  const getCitasDelDia = (fecha: Date) => {
    return citas.filter((cita) => {
      const citaFecha = new Date(cita.fecha);
      return isSameDay(citaFecha, fecha);
    });
  };

  // Función para determinar si un día tiene citas
  const hasCitas = (date: Date) => {
    return citas.some((cita) => {
      const citaFecha = new Date(cita.fecha);
      return isSameDay(citaFecha, date);
    });
  };

  // Renderiza el calendario con días que tienen citas marcados
  const renderCalendar = () => {
    return (
      <DayPicker
        mode="single"
        selected={date}
        onSelect={(date) => date && setDate(date)}
        className="rounded-md border p-3"
        locale={es}
        modifiers={{
          hasCitas: (date: Date) => hasCitas(date),
        }}
        modifiersClassNames={{
          hasCitas: "bg-blue-100 font-bold text-blue-900",
        }}
      />
    );
  };

  // Renderiza la lista de citas para el día seleccionado
  const renderCitasDelDia = () => {
    const citasDelDia = getCitasDelDia(date);

    if (citasDelDia.length === 0) {
      return (
        <div className="text-center py-8">
          No hay citas programadas para {format(date, "PPPP", { locale: es })}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Citas para {format(date, "PPPP", { locale: es })}
        </h3>
        {citasDelDia.map((cita) => (
          <div
            key={cita.id}
            className="border rounded-md p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{cita.paciente}</h4>
                <p className="text-sm text-gray-500">{cita.tratamiento}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cita.estado === "completado"
                    ? "bg-green-100 text-green-800"
                    : cita.estado === "pendiente"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {cita.estado}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Hora:</span> {cita.hora}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Calendario de Citas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando calendario...</div>
            ) : (
              renderCalendar()
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Citas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando citas...</div>
            ) : (
              renderCitasDelDia()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 