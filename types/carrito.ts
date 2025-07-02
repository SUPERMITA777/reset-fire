export interface CarritoItem {
  id?: string;
  carrito_id?: string;
  tratamiento_id: string;
  subtratamiento_id: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  descuento: number;
  notas?: string;
  created_at?: string;
  // Información adicional para mostrar en el carrito
  tratamiento_nombre?: string;
  subtratamiento_nombre?: string;
  duracion?: number;
}

export interface CarritoCompras {
  id?: string;
  cliente_id?: string;
  session_id?: string;
  estado: 'activo' | 'completado' | 'abandonado';
  total: number;
  subtotal: number;
  descuento: number;
  impuestos: number;
  notas?: string;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  items?: CarritoItem[];
  cliente?: {
    id: string;
    nombre_completo: string;
    dni: string;
    whatsapp: string;
  };
}

export interface CarritoContextType {
  carrito: CarritoCompras | null;
  items: CarritoItem[];
  total: number;
  cantidadItems: number;
  loading: boolean;
  error: string | null;
  
  // Acciones
  agregarItem: (item: CarritoItemInput) => Promise<void>;
  actualizarCantidad: (itemId: string, cantidad: number) => Promise<void>;
  eliminarItem: (itemId: string) => Promise<void>;
  limpiarCarrito: () => Promise<void>;
  completarCompra: () => Promise<void>;
  cargarCarrito: () => Promise<void>;
  obtenerCarritoActivo: () => Promise<CarritoCompras | null>;
}

export interface CarritoItemInput {
  tratamiento_id: string;
  subtratamiento_id: string;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  notas?: string;
} 