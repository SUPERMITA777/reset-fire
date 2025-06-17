import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/">
              Volver al inicio
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/calendario">
              Ir al calendario
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 