"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { TratamientoDetalleModal } from "@/components/modals/tratamiento-detalle-modal";

interface SubTratamiento {
  id: string;
  nombre_subtratamiento: string;
  descripcion?: string;
  foto_url?: string;
  precio: number;
  duracion: number;
}

interface Tratamiento {
  id: string;
  nombre_tratamiento: string;
  descripcion?: string;
  foto_url?: string;
  rf_subtratamientos?: SubTratamiento[];
}

function InstitucionalClient() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState<Tratamiento | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    cargarTratamientos();
  }, []);

  const cargarTratamientos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rf_tratamientos")
        .select(`*, rf_subtratamientos (*)`)
        .order("nombre_tratamiento");
      if (error) throw error;
      setTratamientos(data || []);
    } catch (error) {
      console.error("Error al cargar tratamientos:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalTratamiento = (tratamiento: Tratamiento) => {
    setTratamientoSeleccionado(tratamiento);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTratamientoSeleccionado(null);
  };

  // Función para obtener la URL de la imagen con fallback
  const getImageUrl = (foto_url?: string | null): string => {
    if (!foto_url || foto_url.trim() === "") {
      return "/logo-reset-default.png";
    }
    return foto_url;
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
      <div className="container mx-auto py-8 px-4">
        {/* Tratamientos */}
        <div 
          className="grid gap-6" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            width: '100%'
          }}
        >
          {tratamientos.map((tratamiento) => {
            const imageUrl = getImageUrl(tratamiento.foto_url);
            
            return (
              <div
                key={tratamiento.id}
                className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer flex flex-col hover:scale-105 transition-transform duration-300"
                style={{ 
                  height: '320px', 
                  maxWidth: '350px', 
                  minWidth: '280px',
                  minHeight: '320px'
                }}
                onClick={() => abrirModalTratamiento(tratamiento)}
              >
                {/* Imagen de fondo con altura fija */}
                <div 
                  className="relative w-full flex-1 overflow-hidden"
                  style={{ height: '280px', minHeight: '280px' }}
                >
                  <OptimizedImage
                    src={imageUrl}
                    alt={tratamiento.nombre_tratamiento}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority={false}
                  />
                  
                  {/* Franja inferior con el nombre y fondo negro */}
                  <div className="absolute bottom-0 left-0 w-full bg-black py-4 px-4 flex items-center justify-center z-10">
                    <span className="text-white text-lg font-semibold text-center">
                      {tratamiento.nombre_tratamiento}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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

        {/* Modal de detalle del tratamiento */}
        <TratamientoDetalleModal
          tratamiento={tratamientoSeleccionado}
          isOpen={modalAbierto}
          onClose={cerrarModal}
        />
      </div>
    </div>
  );
}

export default InstitucionalClient; 