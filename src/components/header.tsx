import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-black text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/reset-fire" className="text-2xl font-bold tracking-wider hover:text-gray-300 transition-colors">
          RESET FIRE
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link href="/reset-fire/tratamientos" className="hover:text-gray-300 transition-colors">
            Tratamientos
          </Link>
          <Link href="/reset-fire/gestion" className="hover:text-gray-300 transition-colors">
            Gestión
          </Link>
          <Link href="/reset-fire/calendario" className="hover:text-gray-300 transition-colors">
            Calendario
          </Link>
          <Link href="/reset-fire/clientes" className="hover:text-gray-300 transition-colors">
            Clientes
          </Link>
          <Link href="/reset-fire/reportes" className="hover:text-gray-300 transition-colors">
            Reportes
          </Link>
        </nav>
      </div>
    </header>
  );
} 