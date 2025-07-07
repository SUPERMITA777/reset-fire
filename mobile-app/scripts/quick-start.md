# 🚀 Guía de Inicio Rápido - Reset Fire Mobile

## Requisitos Previos

### Para iOS:
- macOS con Xcode instalado
- Node.js (v16 o superior)
- React Native CLI

### Para Android:
- Android Studio instalado
- Node.js (v16 o superior)
- React Native CLI
- Variables de entorno configuradas

## ⚡ Instalación Rápida

### 1. Clonar y configurar
```bash
# Clonar el proyecto
git clone <tu-repositorio>
cd mobile-app

# Instalar dependencias
npm install
```

### 2. Configurar Supabase
Editar `src/lib/supabase.ts`:
```typescript
const supabaseUrl = 'TU_URL_DE_SUPABASE'
const supabaseAnonKey = 'TU_CLAVE_ANONIMA'
```

### 3. Ejecutar scripts de configuración

**Para iOS:**
```bash
chmod +x scripts/setup-ios.sh
./scripts/setup-ios.sh
```

**Para Android:**
```bash
chmod +x scripts/setup-android.sh
./scripts/setup-android.sh
```

### 4. Ejecutar la aplicación

**iOS:**
```bash
npx react-native run-ios
```

**Android:**
```bash
npx react-native run-android
```

## 🔧 Configuración Manual

### Variables de Entorno
Crear archivo `.env` en la raíz:
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima
APP_NAME=Reset Fire Mobile
```

### Dependencias de iOS
```bash
cd ios
pod install
cd ..
```

### Dependencias de Android
```bash
cd android
./gradlew clean
cd ..
```

## 📱 Funcionalidades Principales

### Calendario
- Vista mensual con citas marcadas
- Selección de fechas
- Lista de citas del día

### Nueva Cita
- Formulario completo
- Búsqueda automática de clientes
- Verificación de disponibilidad

### Gestión
- Editar citas existentes
- Cambiar estados
- Eliminar citas

## 🐛 Solución de Problemas

### Error de dependencias
```bash
# Limpiar caché
npm start -- --reset-cache
# o
npx react-native start --reset-cache
```

### Error de Metro
```bash
# Limpiar y reinstalar
rm -rf node_modules
npm install
```

### Error de iOS
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Error de Android
```bash
cd android
./gradlew clean
cd ..
```

## 📞 Soporte

- Revisar logs en consola
- Verificar configuración de Supabase
- Consultar documentación de React Native

## 🎯 Próximos Pasos

1. Configurar notificaciones push
2. Implementar modo offline
3. Agregar reportes y estadísticas
4. Integrar con WhatsApp Business 