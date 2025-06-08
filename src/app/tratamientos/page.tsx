"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TratamientoForm } from "./tratamiento-form";

type Tratamiento = {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
  created_at: string;
};

export default function TratamientosPage() {
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

  const handleTratamientoCreated = () => {
    setOpen(false);
    fetchTratamientos();
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Tratamientos</CardTitle>
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
              <TratamientoForm onSuccess={handleTratamientoCreated} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tratamientos} />
        </CardContent>
      </Card>
    </div>
  );
} 