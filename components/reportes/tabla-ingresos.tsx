"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Ingreso } from "@/types/reportes";
import { Search, Filter, Download } from "lucide-react";

interface TablaIngresosProps {
  vista: 'dia' | 'semana' | 'mes';
  fechaSeleccionada: Date;
}

export function TablaIngresos({ vista, fechaSeleccionada }: TablaIngresosProps) {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'turno': return 'bg-blue-100 text-blue-800';
      case 'producto': return 'bg-green-100 text-green-800';
      case 'seña': return 'bg-yellow-100 text-yellow-800';
      case 'otro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'turno': return 'Turno';
      case 'producto': return 'Producto';
      case 'seña': return 'Seña';
      case 'otro': return 'Otro';
      default: return tipo;
    }
  };

  const cargarIngresos = async () => {
    try {
      setLoading(true);
      let url = '/api/ingresos?';

      if (vista === 'dia') {
        const fecha = format(fechaSeleccionada, 'yyyy-MM-dd');
        url += `fecha_inicio=${fecha}&fecha_fin=${fecha}`;
      } else if (vista === 'semana') {
        const inicio = format(new Date(fechaSeleccionada.getTime() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const fin = format(fechaSeleccionada, 'yyyy-MM-dd');
        url += `fecha_inicio=${inicio}&fecha_fin=${fin}`;
      } else if (vista === 'mes') {
        const inicio = format(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1), 'yyyy-MM-dd');
        const fin = format(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0), 'yyyy-MM-dd');
        url += `fecha_inicio=${inicio}&fecha_fin=${fin}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.data) {
        setIngresos(result.data);
      }
    } catch (error) {
      console.error('Error cargando ingresos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarIngresos();
  }, [vista, fechaSeleccionada]);

  const ingresosFiltrados = ingresos.filter(ingreso => {
    const cumpleTipo = !filtroTipo || ingreso.tipo === filtroTipo;
    const cumpleBusqueda = !filtroBusqueda || 
      ingreso.descripcion.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      ingreso.cliente?.nombre_completo.toLowerCase().includes(filtroBusqueda.toLowerCase());
    
    return cumpleTipo && cumpleBusqueda;
  });

  const exportarIngresos = () => {
    const data = ingresosFiltrados.map(ingreso => ({
      fecha: ingreso.fecha,
      tipo: getTipoLabel(ingreso.tipo),
      descripcion: ingreso.descripcion,
      monto: ingreso.monto,
      metodo_pago: ingreso.metodo_pago,
      cliente: ingreso.cliente?.nombre_completo || 'N/A',
      notas: ingreso.notas || ''
    }));

    const csv = [
      ['Fecha', 'Tipo', 'Descripción', 'Monto', 'Método de Pago', 'Cliente', 'Notas'],
      ...data.map(row => [
        row.fecha,
        row.tipo,
        row.descripcion,
        row.monto.toString(),
        row.metodo_pago,
        row.cliente,
        row.notas
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingresos-${vista}-${format(fechaSeleccionada, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalIngresos = ingresosFiltrados.reduce((sum, ingreso) => sum + ingreso.monto, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Ingresos Registrados</CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportarIngresos} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por descripción o cliente..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="turno">Turnos</SelectItem>
                <SelectItem value="producto">Productos</SelectItem>
                <SelectItem value="seña">Señas</SelectItem>
                <SelectItem value="otro">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumen */}
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total: {ingresosFiltrados.length} registros</span>
            <span className="font-bold text-green-600">
              {formatCurrency(totalIngresos)}
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingresosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay ingresos registrados para el período seleccionado
                  </TableCell>
                </TableRow>
              ) : (
                ingresosFiltrados.map((ingreso) => (
                  <TableRow key={ingreso.id}>
                    <TableCell>
                      {format(new Date(ingreso.fecha), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(ingreso.tipo)}>
                        {getTipoLabel(ingreso.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ingreso.descripcion}
                    </TableCell>
                    <TableCell>
                      {ingreso.cliente?.nombre_completo || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(ingreso.monto)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{ingreso.metodo_pago}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 