import { create } from 'zustand'
import { CitaWithRelations, Tratamiento, SubTratamiento } from '../lib/supabase'

interface CitasState {
  citas: CitaWithRelations[]
  tratamientos: Tratamiento[]
  subtratamientos: SubTratamiento[]
  loading: boolean
  selectedDate: string
  selectedCita: CitaWithRelations | null
  
  // Actions
  setCitas: (citas: CitaWithRelations[]) => void
  setTratamientos: (tratamientos: Tratamiento[]) => void
  setSubtratamientos: (subtratamientos: SubTratamiento[]) => void
  setLoading: (loading: boolean) => void
  setSelectedDate: (date: string) => void
  setSelectedCita: (cita: CitaWithRelations | null) => void
  addCita: (cita: CitaWithRelations) => void
  updateCita: (id: string, cita: Partial<CitaWithRelations>) => void
  removeCita: (id: string) => void
  clearCitas: () => void
}

export const useCitasStore = create<CitasState>((set, get) => ({
  citas: [],
  tratamientos: [],
  subtratamientos: [],
  loading: false,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedCita: null,

  setCitas: (citas) => set({ citas }),
  setTratamientos: (tratamientos) => set({ tratamientos }),
  setSubtratamientos: (subtratamientos) => set({ subtratamientos }),
  setLoading: (loading) => set({ loading }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedCita: (cita) => set({ selectedCita: cita }),
  
  addCita: (cita) => set((state) => ({ 
    citas: [...state.citas, cita] 
  })),
  
  updateCita: (id, cita) => set((state) => ({
    citas: state.citas.map(c => 
      c.id === id ? { ...c, ...cita } : c
    )
  })),
  
  removeCita: (id) => set((state) => ({
    citas: state.citas.filter(c => c.id !== id)
  })),
  
  clearCitas: () => set({ citas: [] }),
})) 