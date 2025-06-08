"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Tratamiento {
  id: string;
  nombre_tratamiento: string;
  box?: number;
  rf_subtratamientos: SubTratamiento[];
}

interface SubTratamiento {
  id: string;
  nombre_subtratamiento: string;
  precio: number;
  duracion: number;
}

export default function Home() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTratamiento, setSelectedTratamiento] = useState<Tratamiento | null>(null);

  useEffect(() => {
    const fetchTratamientos = async () => {
      try {
        const { data, error } = await supabase
          .from("rf_tratamientos")
          .select(`
            *,
            rf_subtratamientos (
              id,
              nombre_subtratamiento,
              precio,
              duracion
            )
          `)
          .order("box");

        if (error) throw error;
        setTratamientos(data || []);
      } catch (error) {
        console.error("Error al cargar tratamientos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTratamientos();
  }, []);

  const handleTratamientoClick = (tratamiento: Tratamiento) => {
    setSelectedTratamiento(tratamiento);
  };

  return (
    <div className="container mx-auto py-6">
      {isLoading ? (
        <p>Cargando tratamientos...</p>
      ) : tratamientos.length === 0 ? (
        <p>No se encontraron tratamientos en la base de datos.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tratamientos.map((trat) => (
            <Button
              key={trat.id}
              onClick={() => handleTratamientoClick(trat)}
              variant="outline"
              className="h-auto p-3 flex flex-col items-start text-left"
            >
              <div className="font-semibold text-sm">{trat.nombre_tratamiento}</div>
              {trat.box && (
                <div className="text-xs text-gray-600 mt-1">Box: {trat.box}</div>
              )}
            </Button>
          ))}
        </div>
      )}
      {selectedTratamiento && (
         <Card className="mt-6">
            <CardHeader>
               <CardTitle>Subtratamientos de {selectedTratamiento.nombre_tratamiento}</CardTitle>
            </CardHeader>
            <CardContent>
               {selectedTratamiento.rf_subtratamientos && selectedTratamiento.rf_subtratamientos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                     {selectedTratamiento.rf_subtratamientos.map((sub: any) => (
                        <Button
                          key={sub.id}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-start text-left"
                          disabled
                        >
                          <div className="font-semibold text-sm">{sub.nombre_subtratamiento}</div>
                          <div className="text-xs text-gray-600 mt-1">Duración: {sub.duracion} min</div>
                          <div className="text-xs text-gray-600">Precio: €{sub.precio}</div>
                        </Button>
                     ))}
                  </div>
               ) : (
                  <p className="text-gray-500">Sin subtratamientos disponibles.</p>
               )}
            </CardContent>
         </Card>
      )}
    </div>
  );
} 