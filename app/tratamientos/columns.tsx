"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

type SubTratamiento = {
  id: string;
  nombre_subtratamiento: string;
  precio: number;
  duracion: number;
};

export type Tratamiento = {
  id: string;
  nombre_tratamiento: string;
  box: number;
  created_at: string;
  updated_at: string;
  rf_subtratamientos: SubTratamiento[];
};

// Componente separado para las acciones
const ActionCell = ({ tratamiento }: { tratamiento: Tratamiento }) => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este tratamiento?")) {
      try {
        const { error } = await supabase
          .from("rf_tratamientos")
          .delete()
          .eq("id", tratamiento.id);

        if (error) throw error;
        router.refresh();
      } catch (error) {
        console.error("Error deleting tratamiento:", error);
        alert("Error al eliminar el tratamiento");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => router.push(`/tratamientos/${tratamiento.id}`)}>
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/tratamientos/${tratamiento.id}/edit`)}>
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Tratamiento>[] = [
  {
    accessorKey: "nombre_tratamiento",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "box",
    header: "Box",
  },
  {
    accessorKey: "rf_subtratamientos",
    header: "Subtratamientos",
    cell: ({ row }) => {
      const subtratamientos = row.getValue("rf_subtratamientos") as SubTratamiento[];
      return (
        <div className="space-y-1">
          {subtratamientos.map((sub) => (
            <div key={sub.id} className="text-sm">
              <span className="font-medium">{sub.nombre_subtratamiento}</span>
              <span className="text-gray-500 ml-2">
                ({sub.duracion} min - {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(sub.precio)})
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tratamiento = row.original;
      return <ActionCell tratamiento={tratamiento} />;
    },
  },
]; 