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
        console.log('Iniciando limpieza de fechas disponibles...');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20240328000023_limpiar_fechas_disponibles.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Ejecutar la migración
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
            console.error('Error al ejecutar la migración:', error);
            process.exit(1);
        }

        console.log('Limpieza ejecutada exitosamente');
        
        // Verificar que no queden fechas
        const { data: config, error: configError } = await supabase
            .from('fechas_disponibles')
            .select(`
                *,
                tratamiento:tratamientos(nombre)
            `)
            .eq('tratamiento_id', 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c');

        if (configError) {
            console.error('Error al verificar la configuración:', configError);
            process.exit(1);
        }

        if (config && config.length > 0) {
            console.error('Error: Todavía quedan fechas disponibles');
            config.forEach(fecha => {
                console.log(`\nTratamiento: ${fecha.tratamiento.nombre}`);
                console.log(`Período: ${fecha.fecha_inicio} a ${fecha.fecha_fin}`);
            });
            process.exit(1);
        }

        console.log('\nVerificación exitosa: No quedan fechas disponibles para el tratamiento');

    } catch (error) {
        console.error('Error inesperado:', error);
        process.exit(1);
    }
}

runMigration(); 