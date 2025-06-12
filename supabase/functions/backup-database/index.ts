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
    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener todas las tablas
    const { data: tables, error: tablesError } = await supabaseClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'like', 'pg_%')
      .not('table_name', 'like', '_prisma_%')

    if (tablesError) throw tablesError

    // Crear objeto para almacenar los datos
    const backupData: Record<string, any[]> = {}

    // Obtener datos de cada tabla
    for (const { table_name } of tables) {
      const { data, error } = await supabaseClient
        .from(table_name)
        .select('*')

      if (error) {
        console.error(`Error al obtener datos de ${table_name}:`, error)
        continue
      }

      backupData[table_name] = data
    }

    // Devolver los datos del backup
    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: backupData,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error en backup:', error)
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