import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');
    const categoria = searchParams.get('categoria');

    let query = supabase
      .from('rf_egresos')
      .select('*')
      .order('fecha', { ascending: false });

    if (fecha_inicio) {
      query = query.gte('fecha', fecha_inicio);
    }

    if (fecha_fin) {
      query = query.lte('fecha', fecha_fin);
    }

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo egresos:', error);
      return NextResponse.json(
        { error: 'Error al obtener egresos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error en API de egresos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categoria,
      monto,
      descripcion,
      fecha,
      proveedor,
      factura_numero,
      metodo_pago,
      notas
    } = body;

    // Validaciones básicas
    if (!categoria || !monto || !descripcion || !fecha) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rf_egresos')
      .insert({
        categoria,
        monto,
        descripcion,
        fecha,
        proveedor,
        factura_numero,
        metodo_pago: metodo_pago || 'efectivo',
        notas
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando egreso:', error);
      return NextResponse.json(
        { error: 'Error al crear el egreso' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('Error en API de egresos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 