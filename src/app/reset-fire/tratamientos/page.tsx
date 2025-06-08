import React from 'react';
import { supabase } from '@/lib/supabase';

async function getTratamientos() {
  const { data: tratamientos, error } = await supabase
    .from('rf_tratamientos')
    .select(`
      id,
      nombre_tratamiento,
      box,
      rf_subtratamientos (
        id,
        nombre_subtratamiento,
        precio,
        duracion
      )
    `)
    .order('nombre_tratamiento');

  if (error) {
    console.error('Error fetching tratamientos:', error);
    return [];
  }

  return tratamientos || [];
}

export default async function TratamientosPage() {
  const tratamientos = await getTratamientos();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tratamientos</h1>
        <p className="text-gray-600">Gestiona los tratamientos y subtratamientos disponibles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tratamientos.map((tratamiento) => (
          <div key={tratamiento.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{tratamiento.nombre_tratamiento}</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Box {tratamiento.box}
                </span>
              </div>

              {tratamiento.rf_subtratamientos && tratamiento.rf_subtratamientos.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Subtratamientos</h3>
                  <div className="space-y-2">
                    {tratamiento.rf_subtratamientos.map((sub) => (
                      <div key={sub.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{sub.nombre_subtratamiento}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${sub.precio}</p>
                            <p className="text-sm text-gray-500">{sub.duracion} min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 