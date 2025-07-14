"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReporteDiario, ReporteSemanal, ReporteMensual } from "@/types/reportes";

interface GraficoIngresosProps {
  reporte: ReporteDiario | ReporteSemanal | ReporteMensual;
}

export function GraficoIngresos({ reporte }: GraficoIngresosProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const total = reporte.total_ingresos;
  const turnos = reporte.ingresos_turnos;
  const productos = reporte.ingresos_productos;
  const senas = reporte.ingresos_senas;
  const otros = reporte.ingresos_otros;

  const calcularPorcentaje = (valor: number) => {
    return total > 0 ? (valor / total) * 100 : 0;
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'turnos': return 'bg-blue-500';
      case 'productos': return 'bg-green-500';
      case 'senas': return 'bg-yellow-500';
      case 'otros': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'turnos': return '🏥';
      case 'productos': return '🛍️';
      case 'senas': return '💰';
      case 'otros': return '📊';
      default: return '📈';
    }
  };

  const datos = [
    { tipo: 'turnos', valor: turnos, porcentaje: calcularPorcentaje(turnos) },
    { tipo: 'productos', valor: productos, porcentaje: calcularPorcentaje(productos) },
    { tipo: 'senas', valor: senas, porcentaje: calcularPorcentaje(senas) },
    { tipo: 'otros', valor: otros, porcentaje: calcularPorcentaje(otros) }
  ].filter(item => item.valor > 0);

  if (datos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="text-4xl mb-2">📊</div>
        <p>No hay datos de ingresos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4">
        {datos.map((item) => (
          <Card key={item.tipo} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getIcon(item.tipo)}</span>
                <div>
                  <p className="font-medium capitalize">{item.tipo}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.porcentaje.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(item.valor)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div className="space-y-2">
        <h4 className="font-medium">Distribución de Ingresos</h4>
        <div className="space-y-2">
          {datos.map((item) => (
            <div key={item.tipo} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{item.tipo}</span>
                <span>{formatCurrency(item.valor)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getColor(item.tipo)}`}
                  style={{ width: `${item.porcentaje}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(total)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 