const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Se requieren las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    try {
        console.log('Iniciando migración de fechas disponibles...');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20240328000022_fix_fechas_disponibles_final.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Ejecutar la migración
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
            console.error('Error al ejecutar la migración:', error);
            process.exit(1);
        }

        console.log('Migración ejecutada exitosamente');
        
        // Verificar la configuración
        const { data: config, error: configError } = await supabase
            .from('fechas_disponibles')
            .select(`
                *,
                tratamiento:tratamientos(nombre)
            `)
            .eq('tratamiento_id', 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c')
            .order('fecha_inicio');

        if (configError) {
            console.error('Error al verificar la configuración:', configError);
            process.exit(1);
        }

        console.log('\nConfiguración actual:');
        config.forEach(fecha => {
            console.log(`\nTratamiento: ${fecha.tratamiento.nombre}`);
            console.log(`Período: ${fecha.fecha_inicio} a ${fecha.fecha_fin}`);
            console.log(`Boxes disponibles: ${fecha.boxes_disponibles}`);
            console.log(`Horario: ${fecha.hora_inicio} a ${fecha.hora_fin}`);
            console.log(`Cupos por turno: ${fecha.cantidad_clientes}`);
        });

    } catch (error) {
        console.error('Error inesperado:', error);
        process.exit(1);
    }
}

runMigration(); 