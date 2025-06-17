# Guía de Deployment - Reset Fire

Esta guía te ayudará a desplegar el proyecto Reset Fire en GitHub y Vercel.

## 📋 Prerrequisitos

- Cuenta de GitHub
- Cuenta de Vercel
- Cuenta de Supabase
- Node.js 18+ instalado localmente

## 🚀 Paso 1: Preparar el Repositorio en GitHub

### 1.1 Crear un nuevo repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea una nueva cuenta o inicia sesión
2. Haz clic en "New repository"
3. Configura el repositorio:
   - **Repository name**: `reset-fire`
   - **Description**: Sistema completo de gestión de citas y tratamientos para clínicas estéticas
   - **Visibility**: Public o Private (según tus preferencias)
   - **Initialize with**: No marques ninguna opción

### 1.2 Subir el código a GitHub

```bash
# En tu directorio local del proyecto
git init
git add .
git commit -m "Initial commit: Reset Fire - Sistema de gestión de tratamientos"
git branch -M main
git remote add origin https://github.com/tu-usuario/reset-fire.git
git push -u origin main
```

## 🗄️ Paso 2: Configurar Supabase

### 2.1 Crear proyecto en Supabase

1. Ve a [Supabase](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Name**: `reset-fire`
   - **Database Password**: Genera una contraseña segura
   - **Region**: Elige la región más cercana a tus usuarios

### 2.2 Configurar la base de datos

1. Ve a la sección "SQL Editor" en tu proyecto de Supabase
2. Ejecuta las migraciones en orden:
   ```sql
   -- Ejecutar todas las migraciones desde /supabase/migrations/
   -- Comenzar con la más antigua (20240320000001_security_policies.sql)
   -- Y continuar en orden cronológico
   ```

### 2.3 Obtener las credenciales

1. Ve a "Settings" > "API"
2. Copia:
   - **Project URL**
   - **anon public** key

## 🌐 Paso 3: Desplegar en Vercel

### 3.1 Conectar con GitHub

1. Ve a [Vercel](https://vercel.com) y crea una cuenta
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

### 3.2 Configurar variables de entorno

En la configuración del proyecto en Vercel, agrega estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
DATABASE_URL=tu_database_url
```

### 3.3 Configurar el dominio

1. En la configuración del proyecto, ve a "Domains"
2. Puedes usar el dominio automático de Vercel o configurar un dominio personalizado

## 🔧 Paso 4: Configuración Adicional

### 4.1 Configurar GitHub Actions (Opcional)

Si quieres usar GitHub Actions para CI/CD:

1. Ve a tu repositorio en GitHub
2. Ve a "Settings" > "Secrets and variables" > "Actions"
3. Agrega estos secrets:
   - `VERCEL_TOKEN`
   - `ORG_ID`
   - `PROJECT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4.2 Configurar dominio personalizado

1. En Vercel, ve a "Settings" > "Domains"
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones de Vercel

## 📱 Paso 5: Verificar el Deployment

### 5.1 Verificar la aplicación

1. Visita tu URL de Vercel
2. Verifica que todas las funcionalidades funcionen:
   - Página de inicio
   - Calendario
   - Gestión de tratamientos
   - Gestión de clientes
   - Creación de citas

### 5.2 Verificar la base de datos

1. Ve a Supabase > "Table Editor"
2. Verifica que las tablas se crearon correctamente
3. Prueba crear algunos datos de prueba

## 🔒 Paso 6: Configuración de Seguridad

### 6.1 Configurar políticas de Supabase

1. Ve a Supabase > "Authentication" > "Policies"
2. Verifica que las políticas de seguridad estén configuradas correctamente
3. Ajusta según tus necesidades de seguridad

### 6.2 Configurar autenticación (Opcional)

Si planeas agregar autenticación:

1. Configura los proveedores de autenticación en Supabase
2. Actualiza las variables de entorno en Vercel
3. Implementa la autenticación en el frontend

## 📊 Paso 7: Monitoreo y Analytics

### 7.1 Configurar analytics

1. Ve a Vercel > "Analytics"
2. Habilita Vercel Analytics para tu proyecto
3. Opcional: Configura Google Analytics

### 7.2 Configurar monitoreo de errores

1. Considera integrar Sentry para monitoreo de errores
2. Configura alertas en Vercel para errores de build

## 🚀 Paso 8: Optimizaciones

### 8.1 Optimizar imágenes

1. Configura un dominio de imágenes en `next.config.mjs`
2. Optimiza las imágenes del proyecto

### 8.2 Configurar cache

1. Configura headers de cache en Vercel
2. Optimiza el cache de la base de datos

## 📞 Soporte

Si encuentras problemas durante el deployment:

1. **Errores de build**: Revisa los logs en Vercel
2. **Errores de base de datos**: Revisa los logs en Supabase
3. **Problemas de variables de entorno**: Verifica que estén configuradas correctamente

## 🔄 Actualizaciones

Para actualizar el proyecto:

1. Haz cambios en tu repositorio local
2. Haz commit y push a GitHub
3. Vercel desplegará automáticamente los cambios

## 📝 Notas Importantes

- **Variables de entorno**: Nunca subas las variables de entorno al repositorio
- **Base de datos**: Haz backup regular de tu base de datos en Supabase
- **Dominio**: Considera usar HTTPS para producción
- **Monitoreo**: Configura alertas para errores críticos

---

¡Tu proyecto Reset Fire está listo para producción! 🎉 