// app/api/citas/route.test.ts
import { GET, POST } from './route' // PUT & DELETE are now in [id]/route.ts
import { getCitasPorFecha, crearCita } from '@/lib/supabase' // Only import mocks needed for GET & POST
import { NextRequest } from 'next/server'
import { jest } from '@jest/globals' // Or import { vi } from 'vitest'; if using Vitest

// Mock the Supabase client functions
jest.mock('@/lib/supabase', () => ({
  getCitasPorFecha: jest.fn(),
  crearCita: jest.fn(),
  // actualizarCita and eliminarCita are mocked in [id]/route.test.ts
  // If this shared mock causes issues, consider more targeted mocking or jest.requireActual
  actualizarCita: jest.fn(), // Keep if other tests in this file might somehow trigger it, otherwise remove
  eliminarCita: jest.fn(),   // Keep if other tests in this file might somehow trigger it, otherwise remove
}))

describe('API Routes for Citas (/api/citas)', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/citas', () => {
    it('should return citas for a given date', async () => {
      const mockDate = '2023-10-27'
      const mockCitas = { [mockDate]: [{ id: '1', fecha: mockDate, hora: '10:00', notas: 'Test Cita' }] }
      ;(getCitasPorFecha as jest.Mock).mockResolvedValue(mockCitas)

      const req = new NextRequest(`http://localhost/api/citas?fecha=${mockDate}`)
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual(mockCitas)
      expect(getCitasPorFecha).toHaveBeenCalledWith(new Date(mockDate + 'T00:00:00.000Z'), false) // parseISO in handler adds timezone
    })

    it('should return 400 if fecha parameter is missing', async () => {
      const req = new NextRequest('http://localhost/api/citas')
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toEqual('El parámetro fecha es requerido')
      expect(getCitasPorFecha).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/citas', () => {
    it('should create a new cita and return it', async () => {
      const mockCitaPayload = {
        cliente_id: 'cliente1',
        tratamiento_id: 'trat1',
        subtratamiento_id: 'subtrat1',
        precio: 100,
        sena: 50,
        fecha: '2023-11-15', // আসবে ISO string হিসেবে
        hora: '14:30',
        box: 1,
        estado: 'reservado',
        notas: 'Test notes',
        duracion: 60,
        es_multiple: false,
      }
      const mockCreatedCita = { id: 'citaGeneratedId', ...mockCitaPayload, fecha: '2023-11-15' } // Supabase might return formatted date
      ;(crearCita as jest.Mock).mockResolvedValue(mockCreatedCita)

      const req = new NextRequest('http://localhost/api/citas', {
        method: 'POST',
        body: JSON.stringify(mockCitaPayload),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(200) // Or 201 if you change it in the handler
      expect(body).toEqual(mockCreatedCita)
      expect(crearCita).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockCitaPayload,
          fecha: '2023-11-15', // Handler formats date
        })
      )
    })

    it('should return 500 if creating cita fails', async () => {
      const mockCitaPayload = { fecha: '2023-11-15', hora: '10:00' } // Simplified
      ;(crearCita as jest.Mock).mockRejectedValue(new Error('Supabase error'))

      const req = new NextRequest('http://localhost/api/citas', {
        method: 'POST',
        body: JSON.stringify(mockCitaPayload),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error).toContain('Error al crear cita')
    })
  })

  // PUT and DELETE describe blocks have been moved to app/api/citas/[id]/route.test.ts
})
