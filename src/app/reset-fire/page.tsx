"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, UsersIcon, Activity, Flame } from "lucide-react";

type Estadisticas = {
  totalTratamientos: number;
  tratamientosHoy: number;
  tratamientosSemana: number;
  ingresosMes: number;
};

export default function DashboardPage() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalTratamientos: 0,
    tratamientosHoy: 0,
    tratamientosSemana: 0,
    ingresosMes: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        // Total de tratamientos
        const { count: totalTratamientos, error: errorTotal } = await supabase
          .from("rf_tratamientos")
          .select("*", { count: "exact", head: true });

        // Tratamientos de hoy
        const fechaHoy = new Date().toISOString().split("T")[0];
        const { count: tratamientosHoy, error: errorHoy } = await supabase
          .from("rf_tratamientos")
          .select("*", { count: "exact", head: true })
          .gte("fecha", fechaHoy)
          .lte("fecha", fechaHoy + "T23:59:59");

        // Tratamientos de esta semana
        const fechaInicioSemana = new Date();
        fechaInicioSemana.setDate(fechaInicioSemana.getDate() - fechaInicioSemana.getDay());
        const fechaFinSemana = new Date();
        fechaFinSemana.setDate(fechaInicioSemana.getDate() + 6);

        const { count: tratamientosSemana, error: errorSemana } = await supabase
          .from("rf_tratamientos")
          .select("*", { count: "exact", head: true })
          .gte("fecha", fechaInicioSemana.toISOString().split("T")[0])
          .lte("fecha", fechaFinSemana.toISOString().split("T")[0] + "T23:59:59");

        // Ingresos del mes
        const fechaInicioMes = new Date();
        fechaInicioMes.setDate(1);
        const fechaFinMes = new Date();
        fechaFinMes.setMonth(fechaFinMes.getMonth() + 1);
        fechaFinMes.setDate(0);

        const { data: ingresosMes, error: errorIngresos } = await supabase
          .from("rf_tratamientos")
          .select("precio")
          .gte("fecha", fechaInicioMes.toISOString().split("T")[0])
          .lte("fecha", fechaFinMes.toISOString().split("T")[0] + "T23:59:59");

        const totalIngresos = ingresosMes?.reduce((acc, curr) => acc + (curr.precio || 0), 0) || 0;

        setEstadisticas({
          totalTratamientos: totalTratamientos || 0,
          tratamientosHoy: tratamientosHoy || 0,
          tratamientosSemana: tratamientosSemana || 0,
          ingresosMes: totalIngresos,
        });
      } catch (error) {
        console.error("Error fetching estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tratamientos
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Cargando..." : estadisticas.totalTratamientos}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tratamientos Hoy
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Cargando..." : estadisticas.tratamientosHoy}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tratamientos Semana
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Cargando..." : estadisticas.tratamientosSemana}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del Mes
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading
                ? "Cargando..."
                : new Intl.NumberFormat("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  }).format(estadisticas.ingresosMes)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 