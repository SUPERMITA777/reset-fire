import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');
    const tipo = searchParams.get('tipo');
    const cliente_id = searchParams.get('cliente_id');

    let query = supabase
      .from('rf_ingresos')
      .select(`
        *,
        cliente:rf_clientes(id, nombre_completo, dni),
        cita:rf_citas(id, fecha, hora, box)
      `)
      .order('fecha', { ascending: false });

    if (fecha_inicio) {
      query = query.gte('fecha', fecha_inicio);
    }

    if (fecha_fin) {
      query = query.lte('fecha', fecha_fin);
    }

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo ingresos:', error);
      return NextResponse.json(
        { error: 'Error al obtener ingresos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error en API de ingresos:', error);
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
      tipo,
      monto,
      descripcion,
      fecha,
      cliente_id,
      cita_id,
      transaccion_id,
      metodo_pago,
      notas
    } = body;

    // Validaciones básicas
    if (!tipo || !monto || !descripcion || !fecha) {
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
      .from('rf_ingresos')
      .insert({
        tipo,
        monto,
        descripcion,
        fecha,
        cliente_id,
        cita_id,
        transaccion_id,
        metodo_pago: metodo_pago || 'efectivo',
        notas
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando ingreso:', error);
      return NextResponse.json(
        { error: 'Error al crear el ingreso' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('Error en API de ingresos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 