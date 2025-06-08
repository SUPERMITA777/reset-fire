"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type SubTratamiento = {
  nombre_subtratamiento: string;
  precio: number;
  duracion: number;
};

type TratamientoFormProps = {
  onSuccess?: () => void;
};

export function TratamientoForm({ onSuccess }: TratamientoFormProps) {
  const [loading, setLoading] = useState(false);
  const [nombreTratamiento, setNombreTratamiento] = useState("");
  const [box, setBox] = useState<number>(1);
  const [subtratamientos, setSubtratamientos] = useState<SubTratamiento[]>([
    { nombre_subtratamiento: "", precio: 0, duracion: 30 },
  ]);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear el tratamiento principal
      const { data: tratamiento, error: tratamientoError } = await supabase
        .from("rf_tratamientos")
        .insert([
          {
            nombre_tratamiento: nombreTratamiento,
            box: box,
          },
        ])
        .select()
        .single();

      if (tratamientoError) throw tratamientoError;

      // 2. Crear los subtratamientos
      const subtratamientosToInsert = subtratamientos.map((sub) => ({
        tratamiento_id: tratamiento.id,
        nombre_subtratamiento: sub.nombre_subtratamiento,
        precio: sub.precio,
        duracion: sub.duracion,
      }));

      const { error: subtratamientosError } = await supabase
        .from("rf_subtratamientos")
        .insert(subtratamientosToInsert);

      if (subtratamientosError) throw subtratamientosError;

      toast({
        title: "Tratamiento creado",
        description: "El tratamiento se ha creado correctamente",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
        router.push("/tratamientos");
      }
    } catch (error) {
      console.error("Error creating tratamiento:", error);
      toast({
        title: "Error",
        description: "Hubo un error al crear el tratamiento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubtratamiento = () => {
    setSubtratamientos([
      ...subtratamientos,
      { nombre_subtratamiento: "", precio: 0, duracion: 30 },
    ]);
  };

  const removeSubtratamiento = (index: number) => {
    setSubtratamientos(subtratamientos.filter((_, i) => i !== index));
  };

  const updateSubtratamiento = (
    index: number,
    field: keyof SubTratamiento,
    value: string | number
  ) => {
    const newSubtratamientos = [...subtratamientos];
    newSubtratamientos[index] = {
      ...newSubtratamientos[index],
      [field]: value,
    };
    setSubtratamientos(newSubtratamientos);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre del Tratamiento</Label>
          <Input
            id="nombre"
            value={nombreTratamiento}
            onChange={(e) => setNombreTratamiento(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="box">Box</Label>
          <Input
            id="box"
            type="number"
            min="1"
            value={box}
            onChange={(e) => setBox(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Subtratamientos</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSubtratamiento}
            >
              Añadir Subtratamiento
            </Button>
          </div>

          {subtratamientos.map((sub, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Subtratamiento {index + 1}</h4>
                {subtratamientos.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubtratamiento(index)}
                  >
                    Eliminar
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`sub-nombre-${index}`}>Nombre</Label>
                <Input
                  id={`sub-nombre-${index}`}
                  value={sub.nombre_subtratamiento}
                  onChange={(e) =>
                    updateSubtratamiento(
                      index,
                      "nombre_subtratamiento",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`sub-precio-${index}`}>Precio (€)</Label>
                  <Input
                    id={`sub-precio-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={sub.precio}
                    onChange={(e) =>
                      updateSubtratamiento(
                        index,
                        "precio",
                        parseFloat(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`sub-duracion-${index}`}>
                    Duración (minutos)
                  </Label>
                  <Input
                    id={`sub-duracion-${index}`}
                    type="number"
                    min="1"
                    value={sub.duracion}
                    onChange={(e) =>
                      updateSubtratamiento(
                        index,
                        "duracion",
                        parseInt(e.target.value)
                      )
                    }
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando..." : "Crear Tratamiento"}
      </Button>
    </form>
  );
} 