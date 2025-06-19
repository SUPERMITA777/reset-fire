"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

interface Tratamiento {
  id: string;
  nombre_tratamiento: string;
  descripcion?: string;
  foto_url?: string;
  rf_subtratamientos?: SubTratamiento[];
}

interface SubTratamiento {
  id: string;
  nombre_subtratamiento: string;
  descripcion?: string;
  foto_url?: string;
  precio: number;
  duracion: number;
}

export default function InstitucionalPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tratamientosExpandidos, setTratamientosExpandidos] = useState<Set<string>>(new Set());
  
  const supabase = createClientComponentClient<Database>();

  // Cargar tratamientos con subtratamientos
  const cargarTratamientos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rf_tratamientos")
        .select(`
          *,
          rf_subtratamientos (*)
        `)
        .order("nombre_tratamiento");

      if (error) throw error;

      setTratamientos(data || []);
    } catch (error) {
      console.error("Error al cargar tratamientos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTratamientos();
  }, []);

  const toggleTratamiento = (tratamientoId: string) => {
    const nuevosExpandidos = new Set(tratamientosExpandidos);
    if (nuevosExpandidos.has(tratamientoId)) {
      nuevosExpandidos.delete(tratamientoId);
    } else {
      nuevosExpandidos.add(tratamientoId);
    }
    setTratamientosExpandidos(nuevosExpandidos);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <div className="container mx-auto py-12 px-4">
        {/* Logo centrado */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-6">
            <Image
              src="/logo RESET.png"
              alt="Logo RESET"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            RESET - Centro de Estética
          </h1>
          <p className="text-xl text-gray-600">
            Tratamientos profesionales para tu belleza y bienestar
          </p>
        </div>

        {/* Tratamientos */}
        <div 
          className="grid gap-4" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            width: '100%'
          }}
        >
          {tratamientos.map((tratamiento) => (
            <Card 
              key={tratamiento.id} 
              className="cursor-pointer hover:border-primary transition-colors min-h-[120px] flex flex-col justify-between overflow-hidden"
              style={{
                maxWidth: '300px',
                minWidth: '200px'
              }}
            >
              {/* Imagen del tratamiento */}
              {tratamiento.foto_url && (
                <div className="relative h-24 overflow-hidden">
                  <Image
                    src={tratamiento.foto_url}
                    alt={tratamiento.nombre_tratamiento}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium truncate">
                  {tratamiento.nombre_tratamiento}
                </CardTitle>
                <CardDescription className="text-xs">
                  {tratamiento.rf_subtratamientos?.length || 0} subtratamientos
                </CardDescription>
                {tratamiento.descripcion && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {tratamiento.descripcion}
                  </p>
                )}
              </CardHeader>
              
              <CardFooter className="flex justify-between items-center p-3 pt-0">
                {tratamiento.rf_subtratamientos && tratamiento.rf_subtratamientos.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTratamiento(tratamiento.id);
                    }}
                  >
                    {tratamientosExpandidos.has(tratamiento.id) ? (
                      <>
                        <ChevronUp className="mr-1 h-3 w-3" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-3 w-3" />
                        Ver ({tratamiento.rf_subtratamientos.length})
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>

              {/* Subtratamientos expandibles */}
              {tratamientosExpandidos.has(tratamiento.id) && 
               tratamiento.rf_subtratamientos && 
               tratamiento.rf_subtratamientos.length > 0 && (
                <div className="px-3 pb-3 border-t bg-gray-50">
                  <div className="space-y-2 mt-3">
                    {tratamiento.rf_subtratamientos.map((subtratamiento) => (
                      <div key={subtratamiento.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                        {/* Imagen del subtratamiento */}
                        {subtratamiento.foto_url && (
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                              src={subtratamiento.foto_url}
                              alt={subtratamiento.nombre_subtratamiento}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-xs text-gray-800 truncate">
                            {subtratamiento.nombre_subtratamiento}
                          </h5>
                          {subtratamiento.descripcion && (
                            <p className="text-xs text-gray-600 truncate">
                              {subtratamiento.descripcion}
                            </p>
                          )}
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{subtratamiento.duracion} min</span>
                            <span className="font-medium text-green-600">
                              ${subtratamiento.precio.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Información de contacto */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¿Te interesa alguno de nuestros tratamientos?
          </h2>
          <p className="text-gray-600 mb-6">
            Contáctanos para agendar tu cita y comenzar tu transformación
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              📞 Llamar Ahora
            </Button>
            <Button size="lg" variant="outline">
              💬 WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 