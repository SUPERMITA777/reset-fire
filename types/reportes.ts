// Tipos para el sistema de reportes financieros

export interface Ingreso {
  id: string;
  tipo: 'turno' | 'producto' | 'seña' | 'otro';
  monto: number;
  descripcion: string;
  fecha: string;
  hora: string;
  cliente_id?: string;
  cita_id?: string;
  transaccion_id?: string;
  metodo_pago: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  cliente?: {
    id: string;
    nombre_completo: string;
    dni: string;
  };
  cita?: {
    id: string;
    fecha: string;
    hora: string;
    box: number;
  };
}

export interface Egreso {
  id: string;
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string;
  hora: string;
  proveedor?: string;
  factura_numero?: string;
  metodo_pago: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriaEgreso {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReporteDiario {
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

export interface ReporteSemanal {
  fecha_inicio: string;
  fecha_fin: string;
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

export interface ReporteMensual {
  anio: number;
  mes: number;
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

export interface EgresoPorCategoria {
  categoria: string;
  total: number;
  cantidad: number;
  porcentaje: number;
}

export interface FiltrosReporte {
  fecha_inicio?: string;
  fecha_fin?: string;
  anio?: number;
  mes?: number;
  tipo_ingreso?: string;
  categoria_egreso?: string;
}

export interface EstadisticasGenerales {
  total_ingresos_periodo: number;
  total_egresos_periodo: number;
  balance_periodo: number;
  promedio_ingresos_diarios: number;
  promedio_egresos_diarios: number;
  cantidad_citas_periodo: number;
  cantidad_transacciones_periodo: number;
  top_categorias_egresos: EgresoPorCategoria[];
}

// Tipos para formularios
export interface FormularioIngreso {
  tipo: 'turno' | 'producto' | 'seña' | 'otro';
  monto: number;
  descripcion: string;
  fecha: string;
  cliente_id?: string;
  cita_id?: string;
  transaccion_id?: string;
  metodo_pago: string;
  notas?: string;
}

export interface FormularioEgreso {
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string;
  proveedor?: string;
  factura_numero?: string;
  metodo_pago: string;
  notas?: string;
}

// Tipos para gráficos
export interface DatosGrafico {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface DatosGraficoIngresos {
  fechas: string[];
  turnos: number[];
  productos: number[];
  senas: number[];
  otros: number[];
}

export interface DatosGraficoEgresos {
  categorias: string[];
  montos: number[];
  colores: string[];
} 