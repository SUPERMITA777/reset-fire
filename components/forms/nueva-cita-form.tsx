"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  nombre_cliente: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  telefono: z.string().min(6, "El teléfono debe tener al menos 6 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notas: z.string().optional(),
})

interface NuevaCitaFormProps {
  datosIniciales: {
    tratamiento: string
    subTratamiento: string
    fecha: Date | null
    horaInicio: string | null
    box: number | null
  }
  onSuccess: () => void
}

export function NuevaCitaForm({ datosIniciales, onSuccess }: NuevaCitaFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_cliente: "",
      telefono: "",
      email: "",
      notas: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!datosIniciales.fecha || !datosIniciales.horaInicio || !datosIniciales.box) {
      toast({
        title: "Error",
        description: "Faltan datos de la cita",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from("rf_citas").insert({
        tratamiento_id: datosIniciales.tratamiento,
        subtratamiento_id: datosIniciales.subTratamiento,
        fecha: format(datosIniciales.fecha, "yyyy-MM-dd"),
        hora_inicio: datosIniciales.horaInicio,
        box_id: datosIniciales.box,
        nombre_cliente: values.nombre_cliente,
        telefono: values.telefono,
        email: values.email || null,
        notas: values.notas || null,
        estado: "reservado",
      })

      if (error) throw error

      toast({
        title: "Cita agendada",
        description: "La cita se ha agendado correctamente",
      })

      onSuccess()
      router.refresh()
    } catch (error) {
      console.error("Error al crear la cita:", error)
      toast({
        title: "Error",
        description: "No se pudo agendar la cita",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="nombre_cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono de contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Email de contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre la cita"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground">
            <p>
              Fecha:{" "}
              {datosIniciales.fecha &&
                format(datosIniciales.fecha, "EEEE dd/MM/yyyy", {
                  locale: es,
                })}
            </p>
            <p>Hora: {datosIniciales.horaInicio}</p>
            <p>Box: {datosIniciales.box}</p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Agendando..." : "Agendar cita"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 