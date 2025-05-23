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
    <header className="sticky top-0 z-50 w-full border-b bg-deep-amethyst/95 backdrop-blur supports-[backdrop-filter]:bg-deep-amethyst/60 dark:text-black">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-isabelline dark:text-black">Reset Pro</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/calendario"
              className="transition-colors hover:text-languid-lavender text-isabelline dark:text-black dark:hover:text-black/80"
            >
              Calendario
            </Link>
            <Link
              href="/clientes"
              className="transition-colors hover:text-languid-lavender text-isabelline dark:text-black dark:hover:text-black/80"
            >
              Clientes
            </Link>
            <Link
              href="/tratamientos"
              className="transition-colors hover:text-languid-lavender text-isabelline dark:text-black dark:hover:text-black/80"
            >
              Tratamientos
            </Link>
            <Link
              href="/carrito"
              className="transition-colors hover:text-languid-lavender text-isabelline dark:text-black dark:hover:text-black/80"
            >
              Carrito
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
