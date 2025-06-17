import { z } from 'zod'

// Esquemas de validación para clientes
export const clienteSchema = z.object({
  nombre_completo: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  fecha_nacimiento: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  historia_clinica: z.record(z.any()).optional(),
})

// Esquemas de validación para tratamientos
export const tratamientoSchema = z.object({
  nombre_tratamiento: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  max_clientes_por_turno: z.number().min(1, 'Debe ser al menos 1'),
  es_compartido: z.boolean(),
})

// Esquemas de validación para sub-tratamientos
export const subTratamientoSchema = z.object({
  tratamiento_id: z.string().uuid('ID de tratamiento inválido'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  duracion: z.number().min(15, 'La duración mínima es 15 minutos'),
  precio: z.number().min(0, 'El precio no puede ser negativo'),
})

// Esquemas de validación para citas
export const citaSchema = z.object({
  cliente_id: z.string().uuid('ID de cliente inválido'),
  tratamiento_id: z.string().uuid('ID de tratamiento inválido'),
  sub_tratamiento_id: z.string().uuid('ID de sub-tratamiento inválido'),
  fecha: z.string().datetime('Fecha inválida'),
  hora_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  hora_fin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  box: z.number().min(1, 'Box inválido'),
  observaciones: z.string().optional(),
  precio: z.number().min(0, 'El precio no puede ser negativo'),
})

// Esquemas de validación para disponibilidad
export const disponibilidadSchema = z.object({
  tratamiento_id: z.string().uuid('ID de tratamiento inválido'),
  fecha_inicio: z.string().datetime('Fecha de inicio inválida'),
  fecha_fin: z.string().datetime('Fecha de fin inválida'),
  hora_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  hora_fin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  boxes_disponibles: z.array(z.number()).min(1, 'Debe haber al menos un box disponible'),
  cantidad_clientes: z.number().min(1, 'Debe ser al menos 1'),
})

// Esquemas de validación para búsquedas
export const searchSchema = z.object({
  query: z.string().min(1, 'La búsqueda no puede estar vacía'),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
})

// Esquemas de validación para filtros de fecha
export const dateFilterSchema = z.object({
  fecha_inicio: z.string().datetime('Fecha de inicio inválida'),
  fecha_fin: z.string().datetime('Fecha de fin inválida'),
})

// Tipos derivados de los esquemas
export type ClienteInput = z.infer<typeof clienteSchema>
export type TratamientoInput = z.infer<typeof tratamientoSchema>
export type SubTratamientoInput = z.infer<typeof subTratamientoSchema>
export type CitaInput = z.infer<typeof citaSchema>
export type DisponibilidadInput = z.infer<typeof disponibilidadSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type DateFilterInput = z.infer<typeof dateFilterSchema> 