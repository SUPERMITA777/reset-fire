export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          Cargando Reset Fire...
        </h2>
        <p className="text-gray-500 mt-2">
          Preparando tu sistema de gestión
        </p>
      </div>
    </div>
  )
} 