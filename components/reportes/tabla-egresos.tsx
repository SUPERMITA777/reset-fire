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
import { Egreso } from "@/types/reportes";
import { Search, Download } from "lucide-react";

interface TablaEgresosProps {
  vista: 'diario' | 'semanal' | 'mensual';
  fechaSeleccionada: Date;
}

export function TablaEgresos({ vista, fechaSeleccionada }: TablaEgresosProps) {
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getCategoriaColor = (categoria: string) => {
    const colorMap: { [key: string]: string } = {
      'Insumos': 'bg-red-100 text-red-800',
      'Equipamiento': 'bg-orange-100 text-orange-800',
      'Servicios': 'bg-green-100 text-green-800',
      'Personal': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-blue-100 text-blue-800',
      'Alquiler': 'bg-yellow-100 text-yellow-800',
      'Servicios Públicos': 'bg-pink-100 text-pink-800',
      'Seguros': 'bg-indigo-100 text-indigo-800',
      'Otros': 'bg-gray-100 text-gray-800'
    };
    return colorMap[categoria] || 'bg-gray-100 text-gray-800';
  };

  const cargarEgresos = async () => {
    try {
      setLoading(true);
      let url = '/api/egresos?';

      if (vista === 'diario') {
        const fecha = format(fechaSeleccionada, 'yyyy-MM-dd');
        url += `fecha_inicio=${fecha}&fecha_fin=${fecha}`;
      } else if (vista === 'semanal') {
        const inicio = format(new Date(fechaSeleccionada.getTime() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const fin = format(fechaSeleccionada, 'yyyy-MM-dd');
        url += `fecha_inicio=${inicio}&fecha_fin=${fin}`;
      } else if (vista === 'mensual') {
        const inicio = format(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1), 'yyyy-MM-dd');
        const fin = format(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0), 'yyyy-MM-dd');
        url += `fecha_inicio=${inicio}&fecha_fin=${fin}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.data) {
        setEgresos(result.data);
        // Extraer categorías únicas
        const categoriasUnicas = [...new Set(result.data.map((egreso: Egreso) => egreso.categoria))] as string[];
        setCategorias(categoriasUnicas);
      }
    } catch (error) {
      console.error('Error cargando egresos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEgresos();
  }, [vista, fechaSeleccionada]);

  const egresosFiltrados = egresos.filter(egreso => {
    const cumpleCategoria = !filtroCategoria || egreso.categoria === filtroCategoria;
    const cumpleBusqueda = !filtroBusqueda || 
      egreso.descripcion.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      (egreso.proveedor && egreso.proveedor.toLowerCase().includes(filtroBusqueda.toLowerCase()));
    
    return cumpleCategoria && cumpleBusqueda;
  });

  const exportarEgresos = () => {
    const data = egresosFiltrados.map(egreso => ({
      fecha: egreso.fecha,
      categoria: egreso.categoria,
      descripcion: egreso.descripcion,
      monto: egreso.monto,
      proveedor: egreso.proveedor || 'N/A',
      factura_numero: egreso.factura_numero || 'N/A',
      metodo_pago: egreso.metodo_pago,
      notas: egreso.notas || ''
    }));

    const csv = [
      ['Fecha', 'Categoría', 'Descripción', 'Monto', 'Proveedor', 'N° Factura', 'Método de Pago', 'Notas'],
      ...data.map(row => [
        row.fecha,
        row.categoria,
        row.descripcion,
        row.monto.toString(),
        row.proveedor,
        row.factura_numero,
        row.metodo_pago,
        row.notas
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `egresos-${vista}-${format(fechaSeleccionada, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalEgresos = egresosFiltrados.reduce((sum, egreso) => sum + egreso.monto, 0);

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
          <CardTitle>Egresos Registrados</CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportarEgresos} variant="outline" size="sm">
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
                placeholder="Buscar por descripción o proveedor..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumen */}
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total: {egresosFiltrados.length} registros</span>
            <span className="font-bold text-red-600">
              {formatCurrency(totalEgresos)}
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>N° Factura</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {egresosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay egresos registrados para el período seleccionado
                  </TableCell>
                </TableRow>
              ) : (
                egresosFiltrados.map((egreso) => (
                  <TableRow key={egreso.id}>
                    <TableCell>
                      {format(new Date(egreso.fecha), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoriaColor(egreso.categoria)}>
                        {egreso.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {egreso.descripcion}
                    </TableCell>
                    <TableCell>
                      {egreso.proveedor || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {egreso.factura_numero || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(egreso.monto)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{egreso.metodo_pago}</span>
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