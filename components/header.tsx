"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FechaHora } from "@/components/fecha-hora"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <img src="/logo%20RESET.png" alt="Logo Reset" style={{ height: 60 }} className="cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          <div className="flex flex-col items-end gap-2">
            <FechaHora />
            <div className="flex flex-row gap-2">
              <Link href="/institucional">
                <Button variant="default" className="bg-green-600 hover:bg-green-700">
                  🏥 INSTITUCIONAL
                </Button>
              </Link>
              <Link href="/gestion-tratamientos">
                <Button variant="outline">GESTIÓN DE TRATAMIENTOS</Button>
              </Link>
              <Link href="/calendario">
                <Button variant="outline">CALENDARIO</Button>
              </Link>
              <Link href="/clientes">
                <Button variant="outline">CLIENTES</Button>
              </Link>
              <Link href="/productos">
                <Button variant="outline">PRODUCTOS</Button>
              </Link>
              <Link href="/disponibilidad">
                <Button variant="outline">DISPONIBILIDAD</Button>
              </Link>
              <Link href="/configuracion">
                <Button variant="outline">CONFIGURACIÓN</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 