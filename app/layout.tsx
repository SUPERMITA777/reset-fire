import type React from "react"
import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FechaHora } from "@/components/fecha-hora"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Reset Fire",
  description: "Sistema de gestión de tratamientos",
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body 
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col" suppressHydrationWarning>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto py-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <img src="/logo%20RESET.png" alt="Logo Reset" style={{ height: 60 }} />
                  </div>
                  <div className="flex flex-col items-end min-w-[170px]">
                    <FechaHora />
                    <div className="flex flex-row gap-2 w-full">
                      <Link href="/gestion-tratamientos">
                        <Button variant="outline">GESTIÓN DE TRATAMIENTOS</Button>
                      </Link>
                      <Link href="/calendario">
                        <Button variant="outline">CALENDARIO</Button>
                      </Link>
                      <Link href="/disponibilidad">
                        <Button variant="outline">DISPONIBILIDAD</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1" suppressHydrationWarning>
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
