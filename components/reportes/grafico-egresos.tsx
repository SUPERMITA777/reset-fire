"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { EgresoPorCategoria } from "@/types/reportes";

interface GraficoEgresosProps {
  egresosCategoria: EgresoPorCategoria[];
}

export function GraficoEgresos({ egresosCategoria }: GraficoEgresosProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getColor = (index: number) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  const getIcon = (categoria: string) => {
    const iconMap: { [key: string]: string } = {
      'Insumos': '🧴',
      'Equipamiento': '🔧',
      'Servicios': '🛠️',
      'Personal': '👥',
      'Marketing': '📢',
      'Alquiler': '🏢',
      'Servicios Públicos': '⚡',
      'Seguros': '🛡️',
      'Otros': '📋'
    };
    return iconMap[categoria] || '💰';
  };

  if (egresosCategoria.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="text-4xl mb-2">📊</div>
        <p>No hay datos de egresos para mostrar</p>
      </div>
    );
  }

  const totalEgresos = egresosCategoria.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      {/* Resumen por categoría */}
      <div className="space-y-3">
        {egresosCategoria.slice(0, 5).map((item, index) => (
          <Card key={item.categoria} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getIcon(item.categoria)}</span>
                <div>
                  <p className="font-medium">{item.categoria}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.cantidad} registros • {item.porcentaje.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">{formatCurrency(item.total)}</p>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getColor(index)}`}
                style={{ width: `${item.porcentaje}%` }}
              ></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráfico circular simplificado */}
      <div className="space-y-2">
        <h4 className="font-medium">Distribución por Categoría</h4>
        <div className="grid grid-cols-2 gap-2">
          {egresosCategoria.map((item, index) => (
            <div key={item.categoria} className="flex items-center gap-2 p-2 rounded border">
              <div
                className={`w-3 h-3 rounded-full ${getColor(index)}`}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.categoria}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Egresos</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(totalEgresos)}
              </p>
            </div>
            <div className="text-4xl">💸</div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas adicionales */}
      {egresosCategoria.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Categorías</p>
              <p className="text-xl font-bold">{egresosCategoria.length}</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Promedio</p>
              <p className="text-xl font-bold">
                {formatCurrency(totalEgresos / egresosCategoria.length)}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 