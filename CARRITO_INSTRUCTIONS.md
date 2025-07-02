# Sistema de Carrito de Compras - Instrucciones de Implementación

## 🛒 Descripción
Se ha creado un sistema completo de carrito de compras para gestionar la parte financiera de los turnos en los modales de crear y editar citas.

## 📋 Componentes Creados

### 1. Base de Datos
- **Tabla `rf_carrito_compras`**: Almacena los carritos de compras
- **Tabla `rf_carrito_items`**: Almacena los items individuales del carrito
- **Triggers automáticos**: Para calcular totales
- **Políticas RLS**: Para seguridad de datos

### 2. Frontend
- **Contexto del carrito** (`contexts/CarritoContext.tsx`): Maneja el estado global
- **Widget del carrito** (`components/carrito/carrito-widget.tsx`): Muestra el carrito en el header
- **Botón agregar al carrito** (`components/carrito/agregar-al-carrito.tsx`): Para agregar productos
- **Tipos TypeScript** (`types/carrito.ts`): Definiciones de tipos

### 3. Integración en Modales
- **Modal de citas** (`components/modals/cita-modal.tsx`): Integrado con 3 pestañas:
  - Cita Individual
  - Cita Múltiple  
  - Carrito

## 🚀 Pasos para Implementar

### Paso 1: Crear las Tablas en Supabase
1. Ve al **SQL Editor** de tu proyecto Supabase
2. Copia y pega el contenido del archivo `scripts/crear-carrito-manual.sql`
3. Ejecuta el script completo

### Paso 2: Verificar la Instalación
El sistema ya está integrado en:
- ✅ Layout principal con `CarritoProvider`
- ✅ Header con widget del carrito
- ✅ Modal de citas con pestaña del carrito
- ✅ Página de tratamientos con botones de agregar al carrito

### Paso 3: Probar el Sistema
1. **Abrir modal de nueva cita**
2. **Seleccionar tratamiento y subtratamiento**
3. **Hacer clic en "Agregar al Carrito"**
4. **Ir a la pestaña "Carrito" para ver los items**
5. **Completar la compra o limpiar el carrito**

## 🎯 Funcionalidades

### Carrito Widget (Header)
- Muestra cantidad de items
- Panel desplegable con lista de productos
- Controles de cantidad
- Botones para limpiar y completar compra

### Modal de Citas
- **Pestaña Individual**: Formulario + botón agregar al carrito
- **Pestaña Múltiple**: Formulario múltiple + botón agregar al carrito  
- **Pestaña Carrito**: Vista completa del carrito con totales

### Gestión de Estado
- Persistencia en localStorage
- Sincronización con base de datos
- Manejo de errores y loading states
- Notificaciones toast

## 🔧 Configuración Adicional

### Personalizar Estilos
Los componentes usan Tailwind CSS y pueden personalizarse modificando las clases en:
- `components/carrito/carrito-widget.tsx`
- `components/carrito/agregar-al-carrito.tsx`

### Agregar Más Funcionalidades
- Descuentos por cantidad
- Cupones de descuento
- Múltiples métodos de pago
- Historial de compras

## 📱 Responsive Design
El sistema está optimizado para:
- ✅ Desktop (pantallas grandes)
- ✅ Tablet (pantallas medianas)
- ✅ Mobile (pantallas pequeñas)

## 🛡️ Seguridad
- Row Level Security (RLS) habilitado
- Validación de datos en frontend y backend
- Manejo seguro de sesiones
- Políticas de acceso por cliente

## 🔍 Debugging
Para verificar que todo funciona:
1. Abre las herramientas de desarrollador
2. Ve a la pestaña "Console"
3. Busca mensajes relacionados con el carrito
4. Verifica que las tablas se crearon en Supabase

## 📞 Soporte
Si encuentras algún problema:
1. Verifica que las tablas se crearon correctamente
2. Revisa la consola del navegador para errores
3. Confirma que el `CarritoProvider` está envolviendo la aplicación

¡El sistema de carrito está listo para usar! 🎉 