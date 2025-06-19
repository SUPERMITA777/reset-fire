export interface Producto {
  id: string;
  marca: string;
  nombre: string;
  descripcion?: string;
  foto_url?: string;
  costo: number;
  precio_venta: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductoFormData {
  marca: string;
  nombre: string;
  descripcion: string;
  foto_url: string;
  costo: number;
  precio_venta: number;
  stock: number;
}

export interface ProductoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (producto: Producto) => void;
  producto?: Producto | null;
  title?: string;
  description?: string;
} 