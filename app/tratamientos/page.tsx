"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SubTratamiento {
  id: string;
  nombre: string;
  duracion: number;
  precio: string;
}

interface Tratamiento {
  id: string;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
  subTratamientos: SubTratamiento[];
}

export default function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTratamientos = async () => {
      try {
        const response = await fetch('/api/tratamientos');
        const data = await response.json();
        setTratamientos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar tratamientos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTratamientos();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tratamientos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Tratamiento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Tratamiento</DialogTitle>
            </DialogHeader>
            {/* Formulario de nuevo tratamiento aquí */}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Cargando tratamientos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tratamientos.map((tratamiento) => (
            <Card key={tratamiento.id}>
              <CardHeader>
                <CardTitle>{tratamiento.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                {tratamiento.subTratamientos && tratamiento.subTratamientos.length > 0 ? (
                  <ul className="pl-4 list-disc">
                    {tratamiento.subTratamientos.map((sub) => (
                      <li key={sub.id}>
                        <span className="font-semibold">{sub.nombre}</span> — {sub.duracion} min — ${sub.precio}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">Sin subtratamientos</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 