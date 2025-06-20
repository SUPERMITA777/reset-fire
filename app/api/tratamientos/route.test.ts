// app/api/tratamientos/route.test.ts
import { GET, POST } from './route'
import { getTratamientos, crearTratamientoDB } from '../../../lib/supabase'
import { NextRequest } from 'next/server'
import { jest } from '@jest/globals' // Or import { vi } from 'vitest';

// Mock the Supabase client functions
// Note the path to ../../../lib/supabase, adjust if your test setup resolves paths differently (e.g. using moduleNameMapper for @/)
jest.mock('../../../lib/supabase', () => ({
  getTratamientos: jest.fn(),
  crearTratamientoDB: jest.fn(),
}))

describe('API Routes for Tratamientos', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/tratamientos', () => {
    it('should return a list of tratamientos', async () => {
      const mockTratamientos = [
        { id: '1', nombre_tratamiento: 'Masaje Relajante', rf_subtratamientos: [] },
        { id: '2', nombre_tratamiento: 'Limpieza Facial', rf_subtratamientos: [] },
      ]
      ;(getTratamientos as jest.Mock).mockResolvedValue(mockTratamientos)

      const req = new NextRequest('http://localhost/api/tratamientos')
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual(mockTratamientos)
      expect(getTratamientos).toHaveBeenCalledTimes(1)
    })

    it('should return a 500 error if getTratamientos fails', async () => {
      ;(getTratamientos as jest.Mock).mockRejectedValue(new Error('Supabase Down'))

      const req = new NextRequest('http://localhost/api/tratamientos')
      const response = await GET(req)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error).toEqual('Error al obtener tratamientos')
      expect(body.details).toEqual('Supabase Down')
    })
  })

  describe('POST /api/tratamientos', () => {
    it('should create a new tratamiento and return it', async () => {
      const mockTratamientoPayload = {
        nombre: 'Nuevo Tratamiento Test',
        descripcion: 'Descripción de prueba',
        // foto_url: 'http://example.com/foto.jpg' // optional
      }
      // The actual crearTratamientoDB from lib/supabase.ts expects specific params.
      // { nombre: string, descripcion?: string, foto_url?: string }
      // And it maps params.nombre to nombre_tratamiento internally.
      const expectedParamsForDB = {
        nombre: mockTratamientoPayload.nombre,
        descripcion: mockTratamientoPayload.descripcion,
        foto_url: null, // Assuming foto_url is not provided and defaults to null
      };
      const mockCreatedTratamiento = {
        id: 'tratGeneratedId',
        nombre_tratamiento: mockTratamientoPayload.nombre,
        descripcion: mockTratamientoPayload.descripcion,
        foto_url: null,
        box: 1 // default from DB function
      }
      ;(crearTratamientoDB as jest.Mock).mockResolvedValue(mockCreatedTratamiento)

      const req = new NextRequest('http://localhost/api/tratamientos', {
        method: 'POST',
        body: JSON.stringify(mockTratamientoPayload),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body).toEqual(mockCreatedTratamiento)
      expect(crearTratamientoDB).toHaveBeenCalledWith(expectedParamsForDB)
    })

    it('should return 400 if "nombre" is missing', async () => {
      const mockTratamientoPayload = { descripcion: 'Sin nombre' }

      const req = new NextRequest('http://localhost/api/tratamientos', {
        method: 'POST',
        body: JSON.stringify(mockTratamientoPayload),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toEqual('El campo "nombre" es requerido para crear un tratamiento.')
      expect(crearTratamientoDB).not.toHaveBeenCalled()
    })

    it('should return 500 if crearTratamientoDB throws an unexpected error', async () => {
      const mockTratamientoPayload = { nombre: 'Tratamiento Fallido' }
      ;(crearTratamientoDB as jest.Mock).mockRejectedValue(new Error('Unexpected DB Error'))

      const req = new NextRequest('http://localhost/api/tratamientos', {
        method: 'POST',
        body: JSON.stringify(mockTratamientoPayload),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error).toEqual('Error al crear el tratamiento')
      expect(body.details).toEqual('Unexpected DB Error')
    })

     it('should return 409 if crearTratamientoDB indicates a duplicate name', async () => {
      const mockTratamientoPayload = { nombre: 'Tratamiento Duplicado' }
      // Simulate the error message structure for a unique constraint violation
      ;(crearTratamientoDB as jest.Mock).mockRejectedValue(new Error('duplicate key value violates unique constraint "tratamientos_nombre_tratamiento_key"'))

      const req = new NextRequest('http://localhost/api/tratamientos', {
        method: 'POST',
        body: JSON.stringify(mockTratamientoPayload),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(req)
      const body = await response.json()

      expect(response.status).toBe(409)
      expect(body.error).toEqual('Error al crear el tratamiento')
      expect(body.details).toContain('duplicate key value violates unique constraint')
    })
  })
})
