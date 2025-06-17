# Reset Fire - Sistema de Gestión de Tratamientos

Sistema completo de gestión de citas y tratamientos para clínicas estéticas y de belleza, desarrollado con Next.js 15, TypeScript, Supabase y Tailwind CSS.

## 🚀 Características

- **Gestión de Citas**: Sistema completo de reservas con calendario interactivo
- **Gestión de Tratamientos**: Creación y administración de tratamientos y sub-tratamientos
- **Gestión de Clientes**: Base de datos de clientes con historial médico
- **Disponibilidad**: Sistema de horarios y disponibilidad por box/consultorio
- **Calendario Interactivo**: Vista de calendario con FullCalendar
- **Responsive Design**: Interfaz adaptada para móviles y desktop
- **Tema Oscuro/Claro**: Soporte para múltiples temas
- **Base de Datos en Tiempo Real**: Con Supabase

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Base de Datos**: Supabase (PostgreSQL)
- **Calendario**: FullCalendar
- **Formularios**: React Hook Form, Zod
- **Estado**: Zustand
- **Deploy**: Vercel

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/reset-fire.git
   cd reset-fire
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   DATABASE_URL=tu_database_url
   ```

4. **Configurar Supabase**
   - Crear proyecto en Supabase
   - Ejecutar las migraciones SQL desde `/supabase/migrations/`
   - Configurar las políticas de seguridad

5. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

## 🗄️ Base de Datos

El proyecto incluye migraciones SQL completas para:

- Tabla de tratamientos (`rf_tratamientos`)
- Tabla de sub-tratamientos (`rf_subtratamientos`)
- Tabla de clientes (`rf_clientes`)
- Tabla de citas (`rf_citas`)
- Tabla de disponibilidad (`rf_disponibilidad`)
- Funciones SQL para gestión de horarios y disponibilidad

## 📁 Estructura del Proyecto

```
reset-fire/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── calendario/        # Página del calendario
│   ├── clientes/          # Gestión de clientes
│   ├── tratamientos/      # Gestión de tratamientos
│   └── ...
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (Radix)
│   ├── forms/            # Formularios
│   └── ...
├── lib/                  # Utilidades y configuración
├── supabase/             # Migraciones y configuración de Supabase
├── types/                # Tipos TypeScript
└── ...
```

## 🚀 Deploy en Vercel

1. **Conectar con GitHub**
   - Subir el código a GitHub
   - Conectar el repositorio en Vercel

2. **Configurar variables de entorno en Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`

3. **Deploy automático**
   - Vercel detectará automáticamente que es un proyecto Next.js
   - El deploy se realizará automáticamente en cada push

## 📱 Funcionalidades Principales

### Gestión de Citas
- Crear, editar y eliminar citas
- Vista de calendario interactivo
- Verificación de disponibilidad en tiempo real
- Gestión de múltiples boxes/consultorios

### Gestión de Tratamientos
- Crear tratamientos principales
- Agregar sub-tratamientos con duración y precio
- Configurar disponibilidad por tratamiento
- Gestión de horarios específicos

### Gestión de Clientes
- Base de datos completa de clientes
- Historial médico
- Fotos de seguimiento
- Información de contacto

## 🔒 Seguridad

- Autenticación con Supabase Auth
- Políticas de seguridad en base de datos
- Validación de datos con Zod
- Protección de rutas API

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta a través de:
- Email: tu-email@ejemplo.com
- GitHub Issues: [Crear un issue](https://github.com/tu-usuario/reset-fire/issues)

---

Desarrollado con ❤️ para clínicas estéticas y de belleza. 
