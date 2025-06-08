"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, Scissors, Settings, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { RelojFecha } from "@/components/reloj-fecha"
import { ThemeToggle } from "@/components/theme-toggle"

const routes = [
  {
    href: "/",
    label: "Agenda",
    icon: Calendar,
  },
  {
    href: "/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/tratamientos",
    label: "Tratamientos",
    icon: Scissors,
  },
  {
    href: "/configuracion",
    label: "Configuración",
    icon: Settings,
  },
]

export function NavBar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
      <div className="container flex h-16 items-center justify-between" suppressHydrationWarning>
        <div className="flex items-center" suppressHydrationWarning>
          <Link href="/" className="flex items-center space-x-2" suppressHydrationWarning>
            <span className="font-bold" suppressHydrationWarning>Sistema de Citas</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-8" suppressHydrationWarning>
          <Link
            href="/calendario"
            className="text-base font-medium text-black transition-colors hover:text-gray-600"
            suppressHydrationWarning
          >
            Calendario
          </Link>
          <Link
            href="/clientes"
            className="text-base font-medium text-black transition-colors hover:text-gray-600"
            suppressHydrationWarning
          >
            Clientes
          </Link>
          <Link
            href="/tratamientos"
            className="text-base font-medium text-black transition-colors hover:text-gray-600"
            suppressHydrationWarning
          >
            Tratamientos
          </Link>
          <Link
            href="/carrito"
            className="text-base font-medium text-black transition-colors hover:text-gray-600"
            suppressHydrationWarning
          >
            Carrito
          </Link>
        </nav>

        <div className="flex items-center space-x-2" suppressHydrationWarning>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
