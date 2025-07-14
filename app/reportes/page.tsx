"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, BarChart3, Plus, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ReporteDiario, ReporteSemanal, ReporteMensual, EgresoPorCategoria } from "@/types/reportes";
import { VistaSelector } from "@/components/vista-selector";
import { ModalIngreso } from "@/components/modals/modal-ingreso";
import { ModalEgreso } from "@/components/modals/modal-egreso";
import { GraficoIngresos } from "@/components/reportes/grafico-ingresos";
import { GraficoEgresos } from "@/components/reportes/grafico-egresos";
import { TablaIngresos } from "@/components/reportes/tabla-ingresos";
import { TablaEgresos } from "@/components/reportes/tabla-egresos";
import { toast } from "@/components/ui/use-toast";

export default function ReportesPage() {
  const [vista, setVista] = useState<'diario' | 'semanal' | 'mensual'>('diario');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [reporte, setReporte] = useState<ReporteDiario | ReporteSemanal | ReporteMensual | null>(null);
  const [egresosCategoria, setEgresosCategoria] = useState<EgresoPorCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalIngresoOpen, setModalIngresoOpen] = useState(false);
  const [modalEgresoOpen, setModalEgresoOpen] = useState(false);

  // Cargar reporte según la vista seleccionada
  const cargarReporte = async () => {
    try {
      setLoading(true);
      let url = `/api/reportes?tipo=${vista}`;

      if (vista === 'diario') {
        const fecha = format(fechaSeleccionada, 'yyyy-MM-dd');
        url += `&fecha=${fecha}`;
      } else if (vista === 'semanal') {
        const inicio = format(new Date(fechaSeleccionada.getTime() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const fin = format(fechaSeleccionada, 'yyyy-MM-dd');
        url += `&fecha_inicio=${inicio}&fecha_fin=${fin}`;
      } else if (vista === 'mensual') {
        const anio = fechaSeleccionada.getFullYear();
        const mes = fechaSeleccionada.getMonth() + 1;
        url += `&anio=${anio}&mes=${mes}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.data && result.data.length > 0) {
        setReporte(result.data[0]);
      } else {
        setReporte(null);
      }

      // Cargar egresos por categoría
      const responseEgresos = await fetch(`/api/reportes?tipo=egresos_categoria&fecha_inicio=${format(new Date(fechaSeleccionada.getTime() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}&fecha_fin=${format(fechaSeleccionada, 'yyyy-MM-dd')}`);
      const resultEgresos = await responseEgresos.json();
      
      if (resultEgresos.data) {
        setEgresosCategoria(resultEgresos.data);
      }

    } catch (error) {
      console.error('Error cargando reporte:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [vista, fechaSeleccionada]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getVistaTitle = () => {
    switch (vista) {
      case 'diario':
        return `Reporte del ${format(fechaSeleccionada, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}`;
      case 'semanal':
        const inicio = format(new Date(fechaSeleccionada.getTime() - 6 * 24 * 60 * 60 * 1000), 'd \'de\' MMM', { locale: es });
        const fin = format(fechaSeleccionada, 'd \'de\' MMM \'de\' yyyy', { locale: es });
        return `Reporte Semanal del ${inicio} al ${fin}`;
      case 'mensual':
        return `Reporte de ${format(fechaSeleccionada, 'MMMM \'de\' yyyy', { locale: es })}`;
      default:
        return 'Reporte';
    }
  };

  const exportarReporte = () => {
    if (!reporte) return;

    const data = {
      titulo: getVistaTitle(),
      fecha: new Date().toLocaleDateString('es-AR'),
      datos: reporte
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${vista}-${format(fechaSeleccionada, 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Reporte exportado",
      description: "El reporte se ha descargado correctamente",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">📊 Reportes Financieros</h1>
          <p className="text-muted-foreground">Gestiona y visualiza la información financiera del negocio</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setModalIngresoOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Registrar Ingreso
          </Button>
          <Button onClick={() => setModalEgresoOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Registrar Egreso
          </Button>
          <Button onClick={exportarReporte} disabled={!reporte}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Selector de vista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {getVistaTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <VistaSelector vista={vista} setVista={setVista} />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <input
                type="date"
                value={format(fechaSeleccionada, 'yyyy-MM-dd')}
                onChange={(e) => setFechaSeleccionada(new Date(e.target.value))}
                className="border rounded px-3 py-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : reporte ? (
        <>
          {/* Resumen de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reporte.total_ingresos)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <div>Turnos: {formatCurrency(reporte.ingresos_turnos)}</div>
                  <div>Productos: {formatCurrency(reporte.ingresos_productos)}</div>
                  <div>Señas: {formatCurrency(reporte.ingresos_senas)}</div>
                  <div>Otros: {formatCurrency(reporte.ingresos_otros)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reporte.total_egresos)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${reporte.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(reporte.balance)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actividad</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {reporte.cantidad_citas}
                </div>
                <div className="text-xs text-muted-foreground">
                  Citas • {reporte.cantidad_transacciones} Transacciones
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs con gráficos y tablas */}
          <Tabs defaultValue="graficos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="graficos">Gráficos</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
              <TabsTrigger value="egresos">Egresos</TabsTrigger>
            </TabsList>

            <TabsContent value="graficos" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Ingresos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GraficoIngresos reporte={reporte} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Egresos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GraficoEgresos egresosCategoria={egresosCategoria} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ingresos">
              <TablaIngresos vista={vista} fechaSeleccionada={fechaSeleccionada} />
            </TabsContent>

            <TabsContent value="egresos">
              <TablaEgresos vista={vista} fechaSeleccionada={fechaSeleccionada} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay datos disponibles para el período seleccionado</p>
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      <ModalIngreso 
        open={modalIngresoOpen} 
        onOpenChange={setModalIngresoOpen}
        onSuccess={() => {
          setModalIngresoOpen(false);
          cargarReporte();
        }}
      />

      <ModalEgreso 
        open={modalEgresoOpen} 
        onOpenChange={setModalEgresoOpen}
        onSuccess={() => {
          setModalEgresoOpen(false);
          cargarReporte();
        }}
      />
    </div>
  );
} 