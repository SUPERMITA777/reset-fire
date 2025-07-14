import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('rf_categorias_egresos')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error obteniendo categorías:', error);
      return NextResponse.json(
        { error: 'Error al obtener categorías' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error en API de categorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, color } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rf_categorias_egresos')
      .insert({
        nombre,
        descripcion,
        color: color || '#3b82f6'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando categoría:', error);
      return NextResponse.json(
        { error: 'Error al crear la categoría' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('Error en API de categorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 