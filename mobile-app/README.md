# Reset Fire - Aplicación Móvil

Aplicación móvil React Native para gestión de citas y tratamientos de clínica estética.

## 🚀 Características

- **Calendario de Citas**: Visualización y gestión de citas por fecha
- **Gestión de Clientes**: Búsqueda y creación de clientes
- **Tratamientos**: Administración de tratamientos y subtratamientos
- **Citas Múltiples**: Soporte para citas con múltiples clientes
- **Sincronización en Tiempo Real**: Conexión directa con Supabase
- **Interfaz Intuitiva**: Diseño optimizado para dispositivos móviles

## 📱 Funcionalidades Principales

### Calendario
- Vista mensual con indicadores de citas
- Filtrado por fecha
- Estados de citas con códigos de color
- Pull-to-refresh para actualizar datos

### Gestión de Citas
- Crear nuevas citas individuales y múltiples
- Editar citas existentes
- Cambiar estados (Reservado, Confirmado, Completado, Cancelado)
- Verificación automática de disponibilidad

### Clientes
- Búsqueda automática por WhatsApp
- Creación de nuevos clientes
- Historial de citas por cliente

### Tratamientos
- Lista de tratamientos disponibles
- Subtratamientos con precios
- Gestión de duración y costos

## 🛠️ Tecnologías

- **React Native**: Framework principal
- **TypeScript**: Tipado estático
- **Supabase**: Base de datos y autenticación
- **React Navigation**: Navegación entre pantallas
- **Zustand**: Gestión de estado
- **React Native Calendars**: Componente de calendario
- **React Native Vector Icons**: Iconografía

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- React Native CLI
- Xcode (para iOS)
- Android Studio (para Android)
- Cuenta de Supabase

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd mobile-app
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar Supabase**
   - Crear un proyecto en Supabase
   - Copiar las credenciales de la API
   - Actualizar `src/lib/supabase.ts` con tus credenciales:

```typescript
const supabaseUrl = 'TU_SUPABASE_URL'
const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY'
```

4. **Instalar dependencias de iOS (solo para iOS)**
```bash
cd ios && pod install && cd ..
```

5. **Ejecutar la aplicación**

Para iOS:
```bash
npx react-native run-ios
```

Para Android:
```bash
npx react-native run-android
```

## 📁 Estructura del Proyecto

```
mobile-app/
├── src/
│   ├── components/          # Componentes de pantallas
│   │   ├── CalendarioScreen.tsx
│   │   ├── NuevaCitaScreen.tsx
│   │   ├── DetalleCitaScreen.tsx
│   │   ├── ClientesScreen.tsx
│   │   ├── TratamientosScreen.tsx
│   │   └── ConfiguracionScreen.tsx
│   ├── navigation/          # Configuración de navegación
│   │   └── AppNavigator.tsx
│   ├── store/              # Gestión de estado
│   │   └── citasStore.ts
│   └── lib/                # Utilidades y configuración
│       └── supabase.ts
├── App.tsx                 # Componente principal
├── package.json
└── README.md
```

## 🎨 Pantallas Principales

### CalendarioScreen
- Calendario interactivo
- Lista de citas del día seleccionado
- Botón para crear nueva cita
- Pull-to-refresh

### NuevaCitaScreen
- Formulario completo para crear citas
- Búsqueda automática de clientes
- Selección de tratamientos y subtratamientos
- Verificación de disponibilidad

### DetalleCitaScreen
- Información detallada de la cita
- Opciones para editar y eliminar
- Cambio de estado

## 🔄 Sincronización con Supabase

La aplicación se conecta directamente a tu base de datos Supabase existente:

- **Tablas utilizadas**:
  - `rf_citas`: Citas
  - `rf_clientes`: Clientes
  - `rf_tratamientos`: Tratamientos
  - `rf_subtratamientos`: Subtratamientos

- **Funciones principales**:
  - `getCitasPorFecha()`: Obtener citas por fecha
  - `crearCita()`: Crear nueva cita
  - `actualizarCita()`: Actualizar cita existente
  - `buscarCliente()`: Buscar cliente por WhatsApp

## 📱 Características Móviles

- **Diseño Responsivo**: Optimizado para diferentes tamaños de pantalla
- **Navegación por Gestos**: Swipe y tap gestures
- **Teclado Adaptativo**: Manejo automático del teclado
- **Offline Support**: Datos en caché local
- **Push Notifications**: (Próximamente)

## 🚀 Despliegue

### iOS App Store
1. Configurar certificados de desarrollo
2. Generar build de producción
3. Subir a App Store Connect

### Google Play Store
1. Generar APK/AAB de producción
2. Firmar la aplicación
3. Subir a Google Play Console

## 🔧 Configuración de Desarrollo

### Variables de Entorno
Crear archivo `.env`:
```
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima
```

### Debugging
- React Native Debugger
- Flipper para debugging avanzado
- Logs de Supabase en consola

## 📊 Monitoreo y Analytics

- **Crashlytics**: Monitoreo de errores
- **Analytics**: Seguimiento de uso
- **Performance**: Métricas de rendimiento

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🆘 Soporte

Para soporte técnico:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Consultar documentación de Supabase

## 🔮 Roadmap

- [ ] Notificaciones push
- [ ] Modo offline completo
- [ ] Sincronización automática
- [ ] Reportes y estadísticas
- [ ] Integración con WhatsApp Business
- [ ] Pago en línea
- [ ] Historial médico
- [ ] Fotos antes/después 