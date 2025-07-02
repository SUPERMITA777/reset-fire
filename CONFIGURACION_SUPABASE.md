# Configuración de Supabase y Migración del Carrito

## 🔧 Estado Actual de la Conexión

### Problemas Identificados:
1. **Docker Desktop no está ejecutándose** - Necesario para desarrollo local
2. **Proyectos de Supabase pausados** - Necesitan ser reactivados
3. **Variables de entorno no configuradas** - Necesarias para conexión remota

## 🚀 Soluciones Disponibles

### Opción 1: Reactivar Proyecto de Supabase (Recomendado)

1. **Ve al Dashboard de Supabase:**
   - https://supabase.com/dashboard
   - Inicia sesión con tu cuenta

2. **Reactiva el proyecto:**
   - Busca el proyecto "RESET - PRO" (ID: ykmiqshcniualagytqou)
   - Haz clic en "Unpause" o "Reactivar"

3. **Obtén las credenciales:**
   - Ve a Settings > API
   - Copia la URL del proyecto
   - Copia la anon key y service role key

4. **Configura las variables de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ykmiqshcniualagytqou.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   ```

### Opción 2: Ejecutar Migración Manualmente

1. **Ve al SQL Editor de Supabase:**
   - Dashboard > SQL Editor
   - Crea una nueva consulta

2. **Ejecuta el script de migración:**
   - Copia el contenido de `scripts/crear-carrito-manual.sql`
   - Pégalo en el SQL Editor
   - Ejecuta el script completo

3. **Verifica las tablas:**
   - Ve a Table Editor
   - Confirma que se crearon:
     - `rf_carrito_compras`
     - `rf_carrito_items`

### Opción 3: Usar el Script Automático

1. **Configura las variables de entorno** (ver Opción 1)

2. **Ejecuta el script:**
   ```bash
   node scripts/ejecutar-migracion-carrito.js
   ```

## 🔍 Verificación de la Conexión

### Verificar Variables de Entorno
```bash
# En PowerShell
echo $env:NEXT_PUBLIC_SUPABASE_URL
echo $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Verificar Conexión desde el Código
El archivo `lib/supabase.ts` ya está configurado para usar las variables de entorno.

## 🐳 Solucionar Docker Desktop

### Si Docker Desktop no inicia:
1. **Ejecutar como Administrador:**
   - Clic derecho en Docker Desktop
   - "Ejecutar como administrador"

2. **Verificar servicios de Windows:**
   - Abrir Services (servicios.msc)
   - Buscar "Docker Desktop Service"
   - Asegurar que esté en "Running"

3. **Reiniciar Docker Desktop:**
   - Cerrar completamente Docker Desktop
   - Reiniciar el servicio
   - Volver a abrir Docker Desktop

### Una vez que Docker funcione:
```bash
cd supabase
npx supabase start
npx supabase db push
```

## 📋 Checklist de Verificación

- [ ] Proyecto de Supabase reactivado
- [ ] Variables de entorno configuradas
- [ ] Script de migración ejecutado
- [ ] Tablas creadas en Supabase
- [ ] Aplicación conecta correctamente
- [ ] Carrito funciona en los modales

## 🆘 Solución de Problemas

### Error: "Cannot find project ref"
```bash
npx supabase link --project-ref ykmiqshcniualagytqou
```

### Error: "Docker client must be run with elevated privileges"
- Ejecutar PowerShell como Administrador
- Reiniciar Docker Desktop

### Error: "Variables de entorno no configuradas"
- Crear archivo `.env.local`
- Configurar las variables correctas
- Reiniciar el servidor de desarrollo

## 📞 Próximos Pasos

1. **Elige una opción** de las anteriores
2. **Ejecuta la migración** del carrito
3. **Prueba el sistema** en la aplicación
4. **Verifica que todo funciona** correctamente

¿Cuál opción prefieres usar? Te puedo ayudar con cualquiera de ellas. 