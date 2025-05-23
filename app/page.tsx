import { Calendario } from "@/components/calendario"

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Calendario />
        </main>
      </div>
    </div>
  )
}
