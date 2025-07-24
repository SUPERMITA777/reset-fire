import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // 'diario', 'semanal', 'mensual'
    const fecha = searchParams.get('fecha');
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');
    const anio = searchParams.get('anio');
    const mes = searchParams.get('mes');

    let data: unknown = null;
    let error: unknown = null;

    switch (tipo) {
      case 'diario':
        const fechaReporte = fecha || new Date().toISOString().split('T')[0];
        const { data: reporteDiario, error: errorDiario } = await supabase
          .rpc('obtener_reporte_diario', { fecha_reporte: fechaReporte });
        
        data = reporteDiario;
        error = errorDiario;
        break;

      case 'semanal':
        const inicio = fecha_inicio || new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const fin = fecha_fin || new Date().toISOString().split('T')[0];
        
        const { data: reporteSemanal, error: errorSemanal } = await supabase
          .rpc('obtener_reporte_semanal', { 
            fecha_inicio: inicio, 
            fecha_fin: fin 
          });
        
        data = reporteSemanal;
        error = errorSemanal;
        break;

      case 'mensual':
        const año = parseInt(anio || new Date().getFullYear().toString());
        const mesActual = parseInt(mes || (new Date().getMonth() + 1).toString());
        
        const { data: reporteMensual, error: errorMensual } = await supabase
          .rpc('obtener_reporte_mensual', { 
            anio: año, 
            mes: mesActual 
          });
        
        data = reporteMensual;
        error = errorMensual;
        break;

      case 'egresos_categoria':
        const inicioCat = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const finCat = fecha_fin || new Date().toISOString().split('T')[0];
        
        const { data: egresosCategoria, error: errorCategoria } = await supabase
          .rpc('obtener_egresos_por_categoria', { 
            fecha_inicio: inicioCat, 
            fecha_fin: finCat 
          });
        
        data = egresosCategoria;
        error = errorCategoria;
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de reporte no válido. Use: diario, semanal, mensual, o egresos_categoria' },
          { status: 400 }
        );
    }

    if (error) {
      console.error('Error obteniendo reporte:', error);
      return NextResponse.json(
        { error: 'Error al obtener el reporte' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error en API de reportes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 