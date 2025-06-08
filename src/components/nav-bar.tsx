"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/reset-fire",
  },
  {
    title: "Gestión",
    href: "/reset-fire/gestion",
  },
  {
    title: "Tratamientos",
    href: "/tratamientos",
  },
  {
    title: "Calendario",
    href: "/calendario",
  },
];

export function NavBar() {
  const pathname = usePathname();
  const [fechaHora, setFechaHora] = useState("");

  useEffect(() => {
    const actualizarFechaHora = () => {
      const ahora = new Date();
      setFechaHora(format(ahora, "EEEE, d 'de' MMMM 'de' yyyy HH:mm", { locale: es }));
    };
    actualizarFechaHora();
    const intervalo = setInterval(actualizarFechaHora, 60000); // Actualizar cada minuto
    return () => clearInterval(intervalo);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo%20RESET.png" alt="Logo Reset" className="h-8" />
            <span className="font-bold text-lg">Reset Fire</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            {fechaHora}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 