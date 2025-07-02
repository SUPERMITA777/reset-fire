"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CarritoCompras, CarritoItem, CarritoContextType, CarritoItemInput } from '@/types/carrito';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// Estado inicial
interface CarritoState {
  carrito: CarritoCompras | null;
  items: CarritoItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CarritoState = {
  carrito: null,
  items: [],
  loading: false,
  error: null,
};

// Tipos de acciones
type CarritoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CARRITO'; payload: CarritoCompras | null }
  | { type: 'SET_ITEMS'; payload: CarritoItem[] }
  | { type: 'ADD_ITEM'; payload: CarritoItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; item: Partial<CarritoItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CARRITO' };

// Reducer
function carritoReducer(state: CarritoState, action: CarritoAction): CarritoState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CARRITO':
      return { ...state, carrito: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.item } : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_CARRITO':
      return { ...state, carrito: null, items: [] };
    default:
      return state;
  }
}

// Crear contexto
const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
}

// Generar session ID único
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Provider del contexto
interface CarritoProviderProps {
  children: ReactNode;
}

export function CarritoProvider({ children }: CarritoProviderProps) {
  const [state, dispatch] = useReducer(carritoReducer, initialState);

  // Obtener o crear carrito activo
  const obtenerCarritoActivo = async (): Promise<CarritoCompras | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Obtener session ID del localStorage
      let sessionId = localStorage.getItem('carrito_session_id');
      if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('carrito_session_id', sessionId);
      }

      // Buscar carrito activo por session ID
      const { data: carrito, error } = await supabase
        .from('rf_carrito_compras')
        .select(`
          *,
          items:rf_carrito_items(
            *,
            tratamiento:rf_tratamientos(nombre_tratamiento),
            subtratamiento:rf_subtratamientos(nombre_subtratamiento, duracion)
          )
        `)
        .eq('session_id', sessionId)
        .eq('estado', 'activo')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (carrito) {
        dispatch({ type: 'SET_CARRITO', payload: carrito });
        dispatch({ type: 'SET_ITEMS', payload: carrito.items || [] });
      }

      return carrito;
    } catch (error) {
      console.error('Error al obtener carrito activo:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar el carrito' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Crear nuevo carrito
  const crearCarrito = async (): Promise<CarritoCompras> => {
    const sessionId = localStorage.getItem('carrito_session_id') || generateSessionId();
    
    const { data: carrito, error } = await supabase
      .from('rf_carrito_compras')
      .insert({
        session_id: sessionId,
        estado: 'activo',
        total: 0,
        subtotal: 0,
        descuento: 0,
        impuestos: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return carrito;
  };

  // Agregar item al carrito
  const agregarItem = async (itemInput: CarritoItemInput): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Obtener o crear carrito
      let carrito = state.carrito;
      if (!carrito) {
        carrito = await crearCarrito();
        dispatch({ type: 'SET_CARRITO', payload: carrito });
      }

      // Calcular precio total
      const precio_total = itemInput.precio_unitario * itemInput.cantidad;

      // Agregar item al carrito
      const { data: item, error } = await supabase
        .from('rf_carrito_items')
        .insert({
          carrito_id: carrito.id,
          tratamiento_id: itemInput.tratamiento_id,
          subtratamiento_id: itemInput.subtratamiento_id,
          cantidad: itemInput.cantidad,
          precio_unitario: itemInput.precio_unitario,
          precio_total,
          descuento: itemInput.descuento || 0,
          notas: itemInput.notas,
        })
        .select(`
          *,
          tratamiento:rf_tratamientos(nombre_tratamiento),
          subtratamiento:rf_subtratamientos(nombre_subtratamiento, duracion)
        `)
        .single();

      if (error) throw error;

      // Actualizar estado local
      dispatch({ type: 'ADD_ITEM', payload: item });
      
      toast({
        title: "Producto agregado",
        description: "El producto se agregó correctamente al carrito",
      });

    } catch (error) {
      console.error('Error al agregar item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al agregar producto al carrito' });
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Actualizar cantidad de un item
  const actualizarCantidad = async (itemId: string, cantidad: number): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const item = state.items.find(i => i.id === itemId);
      if (!item) throw new Error('Item no encontrado');

      const precio_total = item.precio_unitario * cantidad;

      const { error } = await supabase
        .from('rf_carrito_items')
        .update({ cantidad, precio_total })
        .eq('id', itemId);

      if (error) throw error;

      dispatch({ 
        type: 'UPDATE_ITEM', 
        payload: { id: itemId, item: { cantidad, precio_total } } 
      });

    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar cantidad' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Eliminar item del carrito
  const eliminarItem = async (itemId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase
        .from('rf_carrito_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      });

    } catch (error) {
      console.error('Error al eliminar item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar producto' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Limpiar carrito
  const limpiarCarrito = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (state.carrito) {
        const { error } = await supabase
          .from('rf_carrito_items')
          .delete()
          .eq('carrito_id', state.carrito.id);

        if (error) throw error;
      }

      dispatch({ type: 'CLEAR_CARRITO' });

      toast({
        title: "Carrito limpiado",
        description: "Se eliminaron todos los productos del carrito",
      });

    } catch (error) {
      console.error('Error al limpiar carrito:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al limpiar carrito' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Completar compra
  const completarCompra = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!state.carrito) throw new Error('No hay carrito activo');

      const { error } = await supabase
        .from('rf_carrito_compras')
        .update({ estado: 'completado' })
        .eq('id', state.carrito.id);

      if (error) throw error;

      dispatch({ type: 'CLEAR_CARRITO' });
      localStorage.removeItem('carrito_session_id');

      toast({
        title: "Compra completada",
        description: "¡Gracias por tu compra!",
      });

    } catch (error) {
      console.error('Error al completar compra:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al completar compra' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Cargar carrito al inicializar
  const cargarCarrito = async (): Promise<void> => {
    await obtenerCarritoActivo();
  };

  // Cargar carrito al montar el componente
  useEffect(() => {
    cargarCarrito();
  }, []);

  // Calcular totales
  const total = state.items.reduce((sum, item) => sum + (item.precio_total - item.descuento), 0);
  const cantidadItems = state.items.reduce((sum, item) => sum + item.cantidad, 0);

  const value: CarritoContextType = {
    carrito: state.carrito,
    items: state.items,
    total,
    cantidadItems,
    loading: state.loading,
    error: state.error,
    agregarItem,
    actualizarCantidad,
    eliminarItem,
    limpiarCarrito,
    completarCompra,
    cargarCarrito,
    obtenerCarritoActivo,
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
} 