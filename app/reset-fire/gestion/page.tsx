"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

type Tratamiento = {
  id: number;
  paciente: string;
  tratamiento: string;
  fecha: string;
  hora: string;
  estado: string;
  precio: number;
};

export default function GestionPage() {
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
        .from("rf_tratamientos")
        .select("*")
        .order("fecha", { ascending: false });

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
      accessorKey: "paciente",
      header: "Paciente",
    },
    {
      accessorKey: "tratamiento",
      header: "Tratamiento",
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }: any) => {
        const fecha = new Date(row.getValue("fecha"));
        return fecha.toLocaleDateString("es-ES");
      },
    },
    {
      accessorKey: "hora",
      header: "Hora",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }: any) => {
        const estado = row.getValue("estado");
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              estado === "completado"
                ? "bg-green-100 text-green-800"
                : estado === "pendiente"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {estado}
          </span>
        );
      },
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
        
        const handleEstadoChange = async (nuevoEstado: string) => {
          try {
            const { error } = await supabase
              .from("rf_tratamientos")
              .update({ estado: nuevoEstado })
              .eq("id", tratamiento.id);

            if (error) throw error;
            fetchTratamientos();
          } catch (error) {
            console.error("Error updating tratamiento:", error);
          }
        };

        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEstadoChange("completado")}
              disabled={tratamiento.estado === "completado"}
            >
              Completar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEstadoChange("cancelado")}
              disabled={tratamiento.estado === "cancelado"}
            >
              Cancelar
            </Button>
          </div>
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
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <DataTable columns={columns} data={tratamientos} />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 