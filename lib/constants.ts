// Constantes de la aplicación
export const APP_CONSTANTS = {
  NAME: 'Reset Fire',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de gestión de tratamientos',
  AUTHOR: 'Tu Nombre',
  REPOSITORY: 'https://github.com/tu-usuario/reset-fire',
} as const

// Constantes de la base de datos
export const DB_CONSTANTS = {
  TABLES: {
    TRATAMIENTOS: 'rf_tratamientos',
    SUB_TRATAMIENTOS: 'rf_subtratamientos',
    CLIENTES: 'rf_clientes',
    CITAS: 'rf_citas',
    DISPONIBILIDAD: 'rf_disponibilidad',
  },
  ROWS_PER_PAGE: 10,
  MAX_ROWS_PER_PAGE: 100,
} as const

// Constantes de tiempo
export const TIME_CONSTANTS = {
  MIN_DURATION: 15, // minutos
  MAX_DURATION: 480, // 8 horas
  DEFAULT_DURATION: 60, // 1 hora
  BUSINESS_HOURS: {
    START: '09:00',
    END: '18:00',
  },
  TIMEZONE: 'America/Argentina/Buenos_Aires',
} as const

// Constantes de UI
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300, // ms
  DEBOUNCE_DELAY: 500, // ms
  TOAST_DURATION: 5000, // ms
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const

// Constantes de validación
export const VALIDATION_CONSTANTS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 254,
  MIN_PRICE: 0,
  MAX_PRICE: 999999.99,
  MIN_BOX_NUMBER: 1,
  MAX_BOX_NUMBER: 10,
} as const

// Constantes de estados
export const STATUS_CONSTANTS = {
  CITA: {
    PENDIENTE: 'pendiente',
    CONFIRMADA: 'confirmada',
    CANCELADA: 'cancelada',
    COMPLETADA: 'completada',
    NO_SHOW: 'no_show',
  },
  TRATAMIENTO: {
    ACTIVO: 'activo',
    INACTIVO: 'inactivo',
  },
  CLIENTE: {
    ACTIVO: 'activo',
    INACTIVO: 'inactivo',
  },
} as const

// Constantes de rutas
export const ROUTES = {
  HOME: '/',
  CALENDARIO: '/calendario',
  CLIENTES: '/clientes',
  TRATAMIENTOS: '/tratamientos',
  CONFIGURACION: '/configuracion',
  DISPONIBILIDAD: '/disponibilidad',
  API: {
    CITAS: '/api/citas',
    CLIENTES: '/api/clientes',
    TRATAMIENTOS: '/api/tratamientos',
    DISPONIBILIDAD: '/api/disponibilidad',
  },
} as const

// Constantes de mensajes
export const MESSAGES = {
  SUCCESS: {
    CITA_CREADA: 'Cita creada exitosamente',
    CITA_ACTUALIZADA: 'Cita actualizada exitosamente',
    CITA_ELIMINADA: 'Cita eliminada exitosamente',
    CLIENTE_CREADO: 'Cliente creado exitosamente',
    CLIENTE_ACTUALIZADO: 'Cliente actualizado exitosamente',
    CLIENTE_ELIMINADO: 'Cliente eliminado exitosamente',
    TRATAMIENTO_CREADO: 'Tratamiento creado exitosamente',
    TRATAMIENTO_ACTUALIZADO: 'Tratamiento actualizado exitosamente',
    TRATAMIENTO_ELIMINADO: 'Tratamiento eliminado exitosamente',
  },
  ERROR: {
    CITA_NO_ENCONTRADA: 'Cita no encontrada',
    CLIENTE_NO_ENCONTRADO: 'Cliente no encontrado',
    TRATAMIENTO_NO_ENCONTRADO: 'Tratamiento no encontrado',
    DISPONIBILIDAD_NO_ENCONTRADA: 'Disponibilidad no encontrada',
    ERROR_GENERICO: 'Ha ocurrido un error inesperado',
    VALIDACION_ERROR: 'Error de validación',
    NO_AUTORIZADO: 'No autorizado',
    ACCESO_DENEGADO: 'Acceso denegado',
  },
  WARNING: {
    CONFIRMAR_ELIMINACION: '¿Estás seguro de que quieres eliminar este elemento?',
    CAMBIOS_NO_GUARDADOS: 'Tienes cambios sin guardar',
  },
} as const 