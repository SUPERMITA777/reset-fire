# 📊 Sistema de Reportes Financieros

## 🎯 Descripción
Se ha implementado un sistema completo de reportes financieros que permite gestionar ingresos, egresos y generar reportes detallados del negocio.

## 🗄️ Base de Datos

### Tablas Creadas

#### 1. `rf_ingresos`
- Registra todos los ingresos del negocio
- Tipos: turno, producto, seña, otro
- Campos: monto, descripción, fecha, cliente, método de pago, etc.

#### 2. `rf_egresos`
- Registra todos los gastos del negocio
- Categorías: Insumos, Equipamiento, Servicios, Personal, Marketing, etc.
- Campos: monto, descripción, fecha, proveedor, factura, método de pago, etc.

#### 3. `rf_categorias_egresos`
- Categorías predefinidas para clasificar egresos
- Incluye colores para visualización

### Funciones SQL

#### 1. `obtener_reporte_diario(fecha)`
- Genera reporte financiero para un día específico
- Incluye ingresos por tipo, egresos, balance y estadísticas

#### 2. `obtener_reporte_semanal(fecha_inicio, fecha_fin)`
- Genera reporte financiero para un período semanal
- Mismas métricas que el reporte diario

#### 3. `obtener_reporte_mensual(año, mes)`
- Genera reporte financiero para un mes específico
- Mismas métricas que los otros reportes

#### 4. `obtener_egresos_por_categoria(fecha_inicio, fecha_fin)`
- Desglosa egresos por categoría con porcentajes
- Útil para análisis de gastos

#### 5. `registrar_ingreso_cita()`
- Trigger automático que registra ingresos cuando se completa una cita
- Se ejecuta automáticamente al cambiar estado de cita a "completado"

## 🚀 Instalación

### Paso 1: Ejecutar Migración
```bash
node scripts/ejecutar-migracion-reportes.js
```

### Paso 2: Verificar Instalación
El sistema ya está integrado en:
- ✅ Header principal con botón "REPORTES"
- ✅ Página de reportes con todas las funcionalidades
- ✅ APIs para gestionar ingresos y egresos
- ✅ Componentes de gráficos y tablas

## 📱 Funcionalidades

### 1. Página Principal de Reportes (`/reportes`)
- **Vistas**: Diario, Semanal, Mensual
- **Métricas**: Ingresos, Egresos, Balance, Actividad
- **Gráficos**: Distribución de ingresos y egresos
- **Tablas**: Lista detallada de ingresos y egresos
- **Exportación**: Reportes en JSON y CSV

### 2. Gestión de Ingresos
- **Tipos**: Turnos, Productos, Señas, Otros
- **Campos**: Monto, descripción, fecha, cliente, método de pago
- **Registro automático**: Se registran automáticamente al completar citas

### 3. Gestión de Egresos
- **Categorías**: Insumos, Equipamiento, Servicios, Personal, Marketing, etc.
- **Campos**: Monto, descripción, fecha, proveedor, factura, método de pago
- **Filtros**: Por categoría, fecha, descripción

### 4. Reportes Automáticos
- **Diario**: Resumen del día actual
- **Semanal**: Últimos 7 días
- **Mensual**: Mes actual
- **Categorías**: Desglose de egresos por categoría

## 🎨 Componentes Creados

### Modales
- `ModalIngreso`: Formulario para registrar ingresos
- `ModalEgreso`: Formulario para registrar egresos

### Gráficos
- `GraficoIngresos`: Visualización de distribución de ingresos
- `GraficoEgresos`: Visualización de egresos por categoría

### Tablas
- `TablaIngresos`: Tabla con filtros y exportación
- `TablaEgresos`: Tabla con filtros y exportación

### APIs
- `/api/reportes`: Obtener reportes por tipo
- `/api/ingresos`: CRUD de ingresos
- `/api/egresos`: CRUD de egresos
- `/api/categorias-egresos`: Obtener categorías

## 📊 Tipos de Reportes

### 1. Reporte Diario
```typescript
{
  fecha: string;
  ingresos_turnos: number;
  ingresos_productos: number;
  ingresos_senas: number;
  ingresos_otros: number;
  total_ingresos: number;
  total_egresos: number;
  balance: number;
  cantidad_citas: number;
  cantidad_transacciones: number;
}
```

### 2. Reporte Semanal/Mensual
- Misma estructura que el diario
- Período configurable

### 3. Egresos por Categoría
```typescript
{
  categoria: string;
  total: number;
  cantidad: number;
  porcentaje: number;
}
```

## 🔧 Configuración

### Categorías de Egresos Predefinidas
- **Insumos**: Materiales y productos para tratamientos
- **Equipamiento**: Compra y mantenimiento de equipos
- **Servicios**: Servicios externos (limpieza, mantenimiento)
- **Personal**: Salarios y beneficios del personal
- **Marketing**: Publicidad y promociones
- **Alquiler**: Pago de alquiler del local
- **Servicios Públicos**: Luz, agua, gas, internet
- **Seguros**: Pólizas de seguro
- **Otros**: Otros gastos varios

### Métodos de Pago
- Efectivo
- Tarjeta
- Transferencia
- Otro

## 📈 Uso del Sistema

### 1. Registrar Ingreso
1. Ir a la pestaña "REPORTES"
2. Hacer clic en "Registrar Ingreso"
3. Completar el formulario
4. Guardar

### 2. Registrar Egreso
1. Ir a la pestaña "REPORTES"
2. Hacer clic en "Registrar Egreso"
3. Seleccionar categoría
4. Completar el formulario
5. Guardar

### 3. Ver Reportes
1. Seleccionar vista (Diario/Semanal/Mensual)
2. Seleccionar fecha
3. Ver métricas y gráficos
4. Exportar si es necesario

### 4. Filtrar Datos
- Usar filtros en las tablas
- Buscar por descripción o cliente/proveedor
- Filtrar por tipo de ingreso o categoría de egreso

## 🔄 Integración Automática

### Registro Automático de Ingresos
- Cuando una cita se marca como "completada"
- Se registra automáticamente un ingreso del tipo "turno"
- Monto igual al precio de la cita
- Descripción automática basada en las notas de la cita

### Triggers SQL
- `trigger_registrar_ingreso_cita`: Se ejecuta al actualizar estado de cita
- `update_ingresos_updated_at`: Actualiza timestamp automáticamente
- `update_egresos_updated_at`: Actualiza timestamp automáticamente

## 📋 Próximos Pasos

1. **Ejecutar la migración** en Supabase
2. **Probar el sistema** registrando algunos datos de prueba
3. **Configurar categorías** adicionales si es necesario
4. **Personalizar reportes** según necesidades específicas
5. **Configurar exportaciones** automáticas si se requiere

## 🛠️ Mantenimiento

### Limpieza de Datos
- Los datos se mantienen indefinidamente
- Se pueden agregar políticas de retención si es necesario

### Backup
- Los datos se incluyen en el backup automático de Supabase
- Se pueden exportar manualmente en formato CSV

### Monitoreo
- Revisar regularmente los reportes
- Verificar que los ingresos automáticos se registren correctamente
- Validar categorías de egresos

## 🎯 Beneficios

1. **Visibilidad Financiera**: Control total de ingresos y egresos
2. **Automatización**: Registro automático de ingresos por citas
3. **Análisis**: Reportes detallados por período
4. **Exportación**: Datos disponibles en múltiples formatos
5. **Categorización**: Organización clara de gastos
6. **Filtros**: Búsqueda y filtrado avanzado
7. **Gráficos**: Visualización intuitiva de datos

---

¡El sistema de reportes está listo para usar! 🎉 