// app/api/citas/[id]/route.test.ts
import { PUT, DELETE } from './route' // Handlers from the current [id] directory
import { actualizarCita, eliminarCita } from '@/lib/supabase' // Mock Supabase functions
import { NextRequest } from 'next/server'
import { jest } from '@jest/globals'

// Mock the Supabase client functions specifically used by PUT and DELETE
jest.mock('@/lib/supabase', () => ({
  // Important: Ensure getCitasPorFecha and crearCita are not mocked here
  // if they are not used by PUT/DELETE and are mocked in the other test file.
  // If they are part of a shared mock, ensure it's comprehensive or split mocks.
  // For this specific file, we only need actualizarCita and eliminarCita.
  actualizarCita: jest.fn(),
  eliminarCita: jest.fn(),
}))

describe('API Routes for Citas [id]', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('PUT /api/citas/[id]', () => {
    it('should update an existing cita', async () => {
        const citaId = '1';
        const updatePayload = { notas: 'Updated notes' };
        const updatedCita = { id: citaId, notas: 'Updated notes', fecha: '2023-01-01' };
        (actualizarCita as jest.Mock).mockResolvedValue(updatedCita);

        // Construct the URL including the [id] part for clarity, though not strictly used by NextRequest for params
        const req = new NextRequest(`http://localhost/api/citas/${citaId}`, {
            method: 'PUT',
            body: JSON.stringify(updatePayload),
            headers: { 'Content-Type': 'application/json' },
        });

        // The params object needs to be passed to the handler for route segments
        const response = await PUT(req, { params: { id: citaId } });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual(updatedCita);
        expect(actualizarCita).toHaveBeenCalledWith(citaId, updatePayload);
    });

    it('should return 400 if id is missing (though typically handled by routing)', async () => {
        const updatePayload = { notas: 'Updated notes' };
        // Simulate a scenario where params.id might be undefined, though Next.js routing usually prevents this
        const req = new NextRequest(`http://localhost/api/citas/undefined`, {
            method: 'PUT',
            body: JSON.stringify(updatePayload)
        });

        const response = await PUT(req, { params: { id: '' } }); // Simulate empty id from params
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toEqual('ID de cita es requerido');
        expect(actualizarCita).not.toHaveBeenCalled();
    });

    it('should return 500 if actualizarCita fails', async () => {
        const citaId = '1';
        const updatePayload = { notas: 'Updated notes' };
        (actualizarCita as jest.Mock).mockRejectedValue(new Error('Supabase update error'));

        const req = new NextRequest(`http://localhost/api/citas/${citaId}`, {
            method: 'PUT',
            body: JSON.stringify(updatePayload),
            headers: { 'Content-Type': 'application/json' },
        });

        const response = await PUT(req, { params: { id: citaId } });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toContain('Error al actualizar cita');
        expect(actualizarCita).toHaveBeenCalledWith(citaId, updatePayload);
    });
  });

  describe('DELETE /api/citas/[id]', () => {
    it('should delete an existing cita', async () => {
        const citaId = '1';
        (eliminarCita as jest.Mock).mockResolvedValue(undefined); // Supabase delete might not return content

        const req = new NextRequest(`http://localhost/api/citas/${citaId}`, {
            method: 'DELETE'
        });

        const response = await DELETE(req, { params: { id: citaId } });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.message).toEqual(`Cita ${citaId} eliminada correctamente`);
        expect(eliminarCita).toHaveBeenCalledWith(citaId);
    });

    it('should return 400 if id is missing (though typically handled by routing)', async () => {
        const req = new NextRequest(`http://localhost/api/citas/undefined`, {
            method: 'DELETE'
        });

        const response = await DELETE(req, { params: { id: '' } }); // Simulate empty id
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toEqual('ID de cita es requerido');
        expect(eliminarCita).not.toHaveBeenCalled();
    });

    it('should return 500 if eliminarCita fails', async () => {
        const citaId = '1';
        (eliminarCita as jest.Mock).mockRejectedValue(new Error('Supabase delete error'));

        const req = new NextRequest(`http://localhost/api/citas/${citaId}`, {
            method: 'DELETE'
        });

        const response = await DELETE(req, { params: { id: citaId } });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toContain('Error al eliminar cita');
        expect(eliminarCita).toHaveBeenCalledWith(citaId);
    });
  });
})
