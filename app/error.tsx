'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
        </p>
        <div className="space-x-4">
          <Button onClick={reset} variant="default">
            Intentar de nuevo
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Volver al inicio
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Detalles del error (solo desarrollo)
            </summary>
            <pre className="mt-2 text-xs text-red-500 bg-red-50 p-4 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
} 