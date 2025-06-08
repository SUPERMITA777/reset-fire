// Script para verificar y corregir la configuración del tratamiento
// Usar las mismas configuraciones que el proyecto

console.log('🔍 Verificando configuración del tratamiento...');

// Simular las verificaciones que se hacen en la aplicación
const treatmentId = 'fc9f33d6-1238-45fc-955b-e2a8a6c4b29c';
const subTreatmentId = 'e39be1ba-ba0a-411b-b9f1-f46ad9b1b8f7';
const boxId = 1;

console.log(`📋 Datos del tratamiento:
- ID Tratamiento: ${treatmentId}
- ID Sub-tratamiento: ${subTreatmentId}
- Box: ${boxId}
`);

console.log(`✅ Pasos para resolver el problema manualmente:

1. 📄 Ve al SQL Editor de Supabase Dashboard
2. 🔍 Ejecuta esta consulta para verificar el estado actual:
   
   SELECT 
     t.id,
     t.nombre,
     t.es_compartido,
     t.max_clientes_por_turno,
     t.boxes_disponibles,
     t.hora_inicio,
     t.hora_fin
   FROM tratamientos t 
   WHERE t.id = '${treatmentId}';

3. 📅 Ejecuta esta consulta para verificar fechas disponibles:
   
   SELECT 
     fd.*
   FROM fechas_disponibles fd 
   WHERE fd.tratamiento_id = '${treatmentId}'
   AND CURRENT_DATE BETWEEN fd.fecha_inicio AND fd.fecha_fin
   AND ${boxId} = ANY(fd.boxes_disponibles);

4. 🔧 Si no hay fechas disponibles, ejecuta esta inserción:
   
   INSERT INTO fechas_disponibles (
     tratamiento_id,
     fecha_inicio,
     fecha_fin,
     boxes_disponibles,
     hora_inicio,
     hora_fin,
     cantidad_clientes
   ) VALUES (
     '${treatmentId}',
     CURRENT_DATE,
     CURRENT_DATE + INTERVAL '30 days',
     '{1,2,3,4,5,6,7,8}',
     '08:00',
     '20:00',
     8
   ) ON CONFLICT (tratamiento_id, fecha_inicio) DO UPDATE
   SET 
     fecha_fin = EXCLUDED.fecha_fin,
     boxes_disponibles = EXCLUDED.boxes_disponibles;

5. ✅ Ejecuta la función para verificar:
   
   SELECT * FROM verificar_configuracion_completa_tratamiento(
     '${treatmentId}',
     ${boxId}
   );

6. 🎯 También verifica los horarios disponibles:
   
   SELECT * FROM obtener_horarios_disponibles_tratamiento(
     '2025-06-07',
     '${treatmentId}',
     ${boxId}
   );

7. 📦 Verifica que el sub-tratamiento tenga box asignado:
   
   SELECT id, nombre, box FROM sub_tratamientos 
   WHERE id = '${subTreatmentId}';

8. 🔧 Si el box es NULL, actualízalo:
   
   UPDATE sub_tratamientos 
   SET box = ${boxId} 
   WHERE id = '${subTreatmentId}';
`);

console.log(`🚀 También puedes ejecutar directamente estas migraciones en orden:
1. 20240328000019_fix_verificar_configuracion_final.sql
2. 20240328000020_verify_fechas_disponibles.sql

⚠️  Nota: Si prefieres usar Supabase CLI, primero vincula el proyecto:
   npx supabase link --project-ref TU_PROJECT_REF

Luego ejecuta:
   npx supabase db push
`);

console.log('✨ Script completado. Revisa las instrucciones arriba.'); 