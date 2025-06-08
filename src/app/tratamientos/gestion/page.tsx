"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Tratamiento = {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
  created_at: string;
};

export default function GestionTratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchTratamientos();
  }, []);

  const fetchTratamientos = async () => {
    try {
      const { data, error } = await supabase
        .from("tratamientos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTratamientos(data || []);
    } catch (error) {
      console.error("Error fetching tratamientos:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
    },
    {
      accessorKey: "duracion",
      header: "Duración (min)",
    },
    {
      accessorKey: "precio",
      header: "Precio",
      cell: ({ row }: any) => {
        const precio = parseFloat(row.getValue("precio"));
        const formatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(precio);
        return formatted;
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const tratamiento = row.original;
        
        const handleDelete = async () => {
          if (confirm("¿Estás seguro de que quieres eliminar este tratamiento?")) {
            try {
              const { error } = await supabase
                .from("tratamientos")
                .delete()
                .eq("id", tratamiento.id);
  
              if (error) throw error;
              fetchTratamientos();
            } catch (error) {
              console.error("Error deleting tratamiento:", error);
            }
          }
        };

        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Gestión de Tratamientos</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Tratamiento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Tratamiento</DialogTitle>
              </DialogHeader>
              {/* Aquí iría el formulario para crear un nuevo tratamiento */}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando tratamientos...</div>
          ) : (
            <DataTable columns={columns} data={tratamientos} />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 