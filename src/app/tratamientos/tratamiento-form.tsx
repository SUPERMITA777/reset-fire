"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  duracion: z.coerce.number().min(1, {
    message: "La duración debe ser mayor a 0.",
  }),
  precio: z.coerce.number().min(0, {
    message: "El precio no puede ser negativo.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TratamientoFormProps {
  onSuccess?: () => void;
  tratamiento?: {
    id: number;
    nombre: string;
    descripcion: string;
    duracion: number;
    precio: number;
  };
}

export function TratamientoForm({ onSuccess, tratamiento }: TratamientoFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: tratamiento || {
      nombre: "",
      descripcion: "",
      duracion: 30,
      precio: 0,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (tratamiento) {
        const { error } = await supabase
          .from("tratamientos")
          .update(values)
          .eq("id", tratamiento.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tratamientos")
          .insert([values]);

        if (error) throw error;
      }

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving tratamiento:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del tratamiento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción del tratamiento"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duracion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración (minutos)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="precio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio (€)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {tratamiento ? "Actualizar" : "Crear"} Tratamiento
        </Button>
      </form>
    </Form>
  );
} 