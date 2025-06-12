import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar que sea una petición POST
    if (req.method !== 'POST') {
      throw new Error('Método no permitido')
    }

    // Obtener los datos del backup
    const { backupData } = await req.json()

    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Datos de backup inválidos')
    }

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener todas las tablas existentes
    const { data: existingTables, error: tablesError } = await supabaseClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'like', 'pg_%')
      .not('table_name', 'like', '_prisma_%')

    if (tablesError) throw tablesError

    // Restaurar datos tabla por tabla
    for (const [tableName, tableData] of Object.entries(backupData)) {
      // Verificar que la tabla existe
      if (!existingTables.some(t => t.table_name === tableName)) {
        console.warn(`Tabla ${tableName} no existe, omitiendo...`)
        continue
      }

      // Limpiar la tabla actual
      const { error: deleteError } = await supabaseClient
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Evitar eliminar registros del sistema

      if (deleteError) {
        console.error(`Error al limpiar tabla ${tableName}:`, deleteError)
        continue
      }

      // Insertar los datos del backup
      if (Array.isArray(tableData) && tableData.length > 0) {
        const { error: insertError } = await supabaseClient
          .from(tableName)
          .insert(tableData)

        if (insertError) {
          console.error(`Error al restaurar datos en ${tableName}:`, insertError)
          continue
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Restauración completada exitosamente',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error en restauración:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
}) 