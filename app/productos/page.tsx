"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Producto } from "@/types/producto";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { ProductoModal } from "@/components/modals/producto-modal";

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMarca, setFilterMarca] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [marcas, setMarcas] = useState<string[]>([]);
  
  const supabase = createClientComponentClient<Database>();

  // Cargar productos
  const cargarProductos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rf_productos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProductos(data || []);
      
      // Extraer marcas únicas
      const marcasUnicas = [...new Set(data?.map(p => p.marca) || [])];
      setMarcas(marcasUnicas);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;

    try {
      const { error } = await supabase
        .from("rf_productos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      });

      cargarProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    const matchesSearch = 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMarca = filterMarca === "all" || producto.marca === filterMarca;

    const matchesStock = filterStock === "all" ||
      (filterStock === "con_stock" && producto.stock > 0) ||
      (filterStock === "sin_stock" && producto.stock === 0) ||
      (filterStock === "bajo_stock" && producto.stock <= 10 && producto.stock > 0);

    return matchesSearch && matchesMarca && matchesStock;
  });

  // Calcular estadísticas
  const estadisticas = {
    total: productos.length,
    conStock: productos.filter(p => p.stock > 0).length,
    sinStock: productos.filter(p => p.stock === 0).length,
    bajoStock: productos.filter(p => p.stock <= 10 && p.stock > 0).length,
    valorTotal: productos.reduce((sum, p) => sum + (p.precio_venta * p.stock), 0),
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleSubmit = async (producto: Producto) => {
    await cargarProductos();
  };

  const abrirModal = (producto?: Producto) => {
    setProductoSeleccionado(producto || null);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setProductoSeleccionado(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">
            Administra tu inventario de productos
          </p>
        </div>
        <Button onClick={() => abrirModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Productos ({productosFiltrados.length} de {productos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No hay productos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {productos.length === 0 
                  ? "Comienza agregando tu primer producto." 
                  : "No se encontraron productos con los filtros aplicados."}
              </p>
              {productos.length === 0 && (
                <Button onClick={() => abrirModal()} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Precio Venta</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {producto.foto_url && (
                            <img
                              src={producto.foto_url}
                              alt={producto.nombre}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{producto.nombre}</p>
                            {producto.descripcion && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {producto.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{producto.marca}</Badge>
                      </TableCell>
                      <TableCell>${producto.costo.toFixed(2)}</TableCell>
                      <TableCell>${producto.precio_venta.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            producto.stock === 0 
                              ? "destructive" 
                              : producto.stock <= 10 
                                ? "secondary" 
                                : "default"
                          }
                        >
                          {producto.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModal(producto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarProducto(producto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <ProductoModal
        open={showModal}
        onOpenChange={cerrarModal}
        onSubmit={handleSubmit}
        producto={productoSeleccionado}
      />
    </div>
  );
} 