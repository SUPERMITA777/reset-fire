"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, X } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

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

interface TratamientoDetalleModalProps {
  tratamiento: Tratamiento | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TratamientoDetalleModal({
  tratamiento,
  isOpen,
  onClose,
}: TratamientoDetalleModalProps) {
  if (!tratamiento) return null;

  const subtratamientos = tratamiento.rf_subtratamientos || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {tratamiento.nombre_tratamiento}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagen principal del tratamiento */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <OptimizedImage
              src={tratamiento.foto_url}
              alt={tratamiento.nombre_tratamiento}
              fill
              className="object-cover"
            />
          </div>

          {/* Descripción del tratamiento */}
          {tratamiento.descripcion && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Descripción
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {tratamiento.descripcion}
              </p>
            </div>
          )}

          {/* Subtratamientos */}
          {subtratamientos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Opciones de Tratamiento
                </h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {subtratamientos.length} {subtratamientos.length === 1 ? 'opción' : 'opciones'}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {subtratamientos.map((subtratamiento) => (
                  <div
                    key={subtratamiento.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex gap-4">
                      {/* Imagen del subtratamiento */}
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <OptimizedImage
                          src={subtratamiento.foto_url}
                          alt={subtratamiento.nombre_subtratamiento}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Información del subtratamiento */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">
                          {subtratamiento.nombre_subtratamiento}
                        </h4>
                        
                        {subtratamiento.descripcion && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {subtratamiento.descripcion}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{subtratamiento.duracion} min</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                            <DollarSign className="w-3 h-3" />
                            <span>{subtratamiento.precio.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button className="bg-green-600 hover:bg-green-700 flex-1">
              📞 Llamar para agendar
            </Button>
            <Button variant="outline" className="flex-1">
              💬 WhatsApp
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// CSS adicional para line-clamp
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Inyectar estilos
if (typeof window !== 'undefined' && !document.getElementById('tratamiento-modal-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'tratamiento-modal-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 