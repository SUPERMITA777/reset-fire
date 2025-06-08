const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migraciones específicas que necesitamos ejecutar
const migrationActions = [
  {
    name: '20240328000019_fix_verificar_configuracion_final',
    action: async () => {
      console.log('🔄 Ejecutando función verificar_configuracion_completa_tratamiento...');
      
      // Primero, verificar la configuración actual
      const { data, error } = await supabase.rpc('verificar_configuracion_completa_tratamiento', {
        p_tratamiento_id: 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c',
        p_box_id: 1
      });
      
      if (error) {
        console.error('❌ Error al verificar configuración:', error);
        return false;
      }
      
      console.log('📊 Configuración actual:', data);
      return true;
    }
  },
  {
    name: '20240328000020_verify_fechas_disponibles',
    action: async () => {
      console.log('🔄 Verificando fechas disponibles...');
      
      // Verificar si hay fechas disponibles
      const { data, error } = await supabase
        .from('fechas_disponibles')
        .select('*')
        .eq('tratamiento_id', 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c');
      
      if (error) {
        console.error('❌ Error al consultar fechas disponibles:', error);
        return false;
      }
      
      console.log(`📅 Encontradas ${data.length} fechas disponibles`);
      
      // Si no hay fechas, insertar algunas
      if (data.length === 0) {
        console.log('🔄 Insertando fechas disponibles...');
        
        const { error: insertError } = await supabase
          .from('fechas_disponibles')
          .insert({
            tratamiento_id: 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c',
            fecha_inicio: '2025-06-07',
            fecha_fin: '2025-07-07',
            boxes_disponibles: [1, 2, 3, 4, 5, 6, 7, 8],
            hora_inicio: '08:00',
            hora_fin: '20:00',
            cantidad_clientes: 8
          });
        
        if (insertError) {
          console.error('❌ Error al insertar fechas:', insertError);
          return false;
        }
        
        console.log('✅ Fechas disponibles insertadas');
      }
      
      return true;
    }
  }
];

async function runSpecificMigrations() {
  console.log('🚀 Iniciando migraciones específicas...');
  
  for (const migration of migrationActions) {
    console.log(`\n📝 Ejecutando: ${migration.name}`);
    
    try {
      const success = await migration.action();
      
      if (success) {
        console.log(`✅ ${migration.name} completado`);
      } else {
        console.log(`⚠️  ${migration.name} tuvo problemas pero continuando...`);
      }
      
    } catch (error) {
      console.error(`❌ Error en ${migration.name}:`, error.message);
    }
  }
  
  // Verificación final
  console.log('\n🔍 Verificación final...');
  
  try {
    const { data, error } = await supabase.rpc('verificar_configuracion_completa_tratamiento', {
      p_tratamiento_id: 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c',
      p_box_id: 1
    });
    
    if (error) {
      console.error('❌ Error en verificación final:', error);
    } else {
      console.log('📊 Configuración final del tratamiento:', data[0]);
      
      if (data[0]?.tiene_fechas_disponibles) {
        console.log('🎉 ¡Las fechas disponibles están configuradas correctamente!');
      } else {
        console.log('⚠️  Las fechas disponibles aún no están configuradas correctamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Error en verificación final:', error.message);
  }
  
  console.log('\n🎉 Proceso de migraciones completado');
}

// Ejecutar migraciones
runSpecificMigrations().catch(console.error); 