import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ⚠️ IMPORTANTE: Estas credenciales deben coincidir con tu archivo .env.local
// Las variables se cargan desde el archivo .env en la raíz del proyecto mobile-app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'TU_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY'

// Verificar que las credenciales estén configuradas
if (supabaseUrl === 'TU_SUPABASE_URL' || supabaseAnonKey === 'TU_SUPABASE_ANON_KEY') {
  console.error('❌ Error: Credenciales de Supabase no configuradas')
  console.error('Por favor crea un archivo .env en la raíz del proyecto mobile-app con:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tipos para las tablas de Supabase
export type Cliente = {
  id: string
  nombre_completo: string
  dni?: string
  whatsapp: string
  created_at: string
  updated_at: string
}

export type Tratamiento = {
  id: string
  nombre_tratamiento: string
  descripcion?: string
  foto_url?: string
  max_clientes_por_turno: number
  es_compartido: boolean
  created_at: string
  updated_at: string
  rf_subtratamientos?: SubTratamiento[]
}

export type SubTratamiento = {
  id: string
  tratamiento_id: string
  nombre_subtratamiento: string
  descripcion?: string
  foto_url?: string
  precio: number
  duracion: number
  created_at?: string
  updated_at?: string
}

export type Cita = {
  id: string
  cliente_id?: string
  tratamiento_id: string
  subtratamiento_id: string
  precio: number
  sena: number
  fecha: string
  hora: string
  box: number
  estado: "reservado" | "confirmado" | "cancelado" | "completado"
  notas?: string
  created_at: string
  updated_at: string
  duracion?: number
  es_multiple?: boolean
  rf_clientes?: Cliente | null
  rf_subtratamientos?: SubTratamiento | null
}

export type CitaWithRelations = Cita & {
  rf_clientes: Cliente | null
  rf_subtratamientos: SubTratamiento & {
    rf_tratamientos: {
      id: string
      nombre_tratamiento: string
    } | null
  } | null
}

// Funciones para obtener datos
export async function getTratamientos(): Promise<Tratamiento[]> {
  try {
    const { data, error } = await supabase
      .from('rf_tratamientos')
      .select(`
        *,
        rf_subtratamientos (*)
      `)
      .order('nombre_tratamiento')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error al obtener tratamientos:', error)
    throw error
  }
}

export async function getCitasPorFecha(fecha: string): Promise<CitaWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('rf_citas')
      .select(`
        *,
        rf_clientes (*),
        rf_subtratamientos (
          *,
          rf_tratamientos (*)
        )
      `)
      .eq('fecha', fecha)
      .order('hora')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error al obtener citas:', error)
    throw error
  }
}

export async function crearCita(cita: Omit<Cita, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('rf_citas')
      .insert(cita)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error al crear cita:', error)
    throw error
  }
}

export async function actualizarCita(id: string, cita: Partial<Cita>) {
  try {
    const { data, error } = await supabase
      .from('rf_citas')
      .update(cita)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error al actualizar cita:', error)
    throw error
  }
}

export async function eliminarCita(id: string) {
  try {
    const { error } = await supabase
      .from('rf_citas')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error al eliminar cita:', error)
    throw error
  }
}

export async function buscarCliente(whatsapp: string): Promise<Cliente | null> {
  try {
    const whatsappLimpio = whatsapp.replace(/[\s\-\(\)]/g, '')
    
    const { data, error } = await supabase
      .from('rf_clientes')
      .select('*')
      .eq('whatsapp', whatsappLimpio)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (error) {
    console.error('Error buscando cliente:', error)
    return null
  }
}

export async function crearCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('rf_clientes')
      .insert(cliente)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error al crear cliente:', error)
    throw error
  }
}

export async function verificarDisponibilidad(fecha: string, hora: string, box: number, citaId?: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('rf_citas')
      .select('id, fecha, hora, box')
      .eq('fecha', fecha)
      .eq('hora', hora)
      .eq('box', box)
      .neq('estado', 'cancelado')

    if (error) throw error

    const citasConflictivas = citaId 
      ? data.filter(cita => cita.id !== citaId)
      : data

    return citasConflictivas.length === 0
  } catch (error) {
    console.error('Error verificando disponibilidad:', error)
    return false
  }
} 