// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Variables de entorno de Supabase no configuradas');
    console.log('Asegúrate de tener configuradas:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ejecutarMigracion() {
    try {
        console.log('🚀 Iniciando migración del sistema de reportes...\n');

        // 1. Ejecutar migración principal
        console.log('📋 Ejecutando migración principal...');
        const migracionPrincipal = fs.readFileSync(
            path.join(__dirname, '../supabase/migrations/20240331000001_create_reportes_system.sql'),
            'utf8'
        );
        
        const { error: error1 } = await supabase.rpc('exec_sql', { sql_query: migracionPrincipal });
        if (error1) {
            console.error('❌ Error en migración principal:', error1.message);
            throw error1;
        }
        console.log('✅ Migración principal completada\n');

        // 2. Ejecutar migración de corrección de funciones
        console.log('🔧 Ejecutando corrección de funciones...');
        const migracionCorreccion = fs.readFileSync(
            path.join(__dirname, '../supabase/migrations/20240331000002_fix_reportes_functions.sql'),
            'utf8'
        );
        
        const { error: error2 } = await supabase.rpc('exec_sql', { sql_query: migracionCorreccion });
        if (error2) {
            console.error('❌ Error en corrección de funciones:', error2.message);
            throw error2;
        }
        console.log('✅ Corrección de funciones completada\n');

        // 3. Ejecutar migración final de funciones
        console.log('🔧 Ejecutando migración final de funciones...');
        const migracionFinal = fs.readFileSync(
            path.join(__dirname, '../supabase/migrations/20240331000003_fix_reportes_functions_final.sql'),
            'utf8'
        );
        
        const { error: error3 } = await supabase.rpc('exec_sql', { sql_query: migracionFinal });
        if (error3) {
            console.error('❌ Error en migración final:', error3.message);
            throw error3;
        }
        console.log('✅ Migración final completada\n');

        // 4. Verificar que las tablas se crearon correctamente
        console.log('🔍 Verificando tablas creadas...');
        const { data: tables, error: errorTables } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['rf_ingresos', 'rf_egresos', 'rf_categorias_egresos']);

        if (errorTables) {
            console.error('❌ Error verificando tablas:', errorTables.message);
        } else {
            console.log('✅ Tablas verificadas:', tables.map(t => t.table_name).join(', '));
        }

        // 5. Insertar categorías de egresos por defecto
        console.log('📝 Insertando categorías de egresos por defecto...');
        const categoriasDefault = [
            { nombre: 'Alquiler', descripcion: 'Pago de alquiler del local' },
            { nombre: 'Servicios', descripcion: 'Luz, agua, gas, internet' },
            { nombre: 'Insumos', descripcion: 'Productos y materiales de trabajo' },
            { nombre: 'Marketing', descripcion: 'Publicidad y promoción' },
            { nombre: 'Equipamiento', descripcion: 'Compra de equipos y herramientas' },
            { nombre: 'Personal', descripcion: 'Salarios y honorarios' },
            { nombre: 'Mantenimiento', descripcion: 'Reparaciones y mantenimiento' },
            { nombre: 'Otros', descripcion: 'Otros gastos varios' }
        ];

        for (const categoria of categoriasDefault) {
            const { error: errorCat } = await supabase
                .from('rf_categorias_egresos')
                .upsert(categoria, { onConflict: 'nombre' });
            
            if (errorCat) {
                console.warn(`⚠️  Advertencia al insertar categoría ${categoria.nombre}:`, errorCat.message);
            }
        }
        console.log('✅ Categorías de egresos insertadas\n');

        console.log('🎉 ¡Migración del sistema de reportes completada exitosamente!');
        console.log('\n📋 Resumen de lo que se creó:');
        console.log('- Tabla rf_ingresos: Para registrar ingresos por turnos, productos, señas y otros');
        console.log('- Tabla rf_egresos: Para registrar gastos y egresos');
        console.log('- Tabla rf_categorias_egresos: Para categorizar los egresos');
        console.log('- Funciones SQL: Para generar reportes diarios, semanales y mensuales');
        console.log('- Triggers: Para registrar ingresos automáticamente al completar citas');
        console.log('\n🚀 El sistema de reportes está listo para usar en la pestaña REPORTES');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        console.error('Detalles:', error);
        process.exit(1);
    }
}

// Ejecutar la migración
ejecutarMigracion(); 