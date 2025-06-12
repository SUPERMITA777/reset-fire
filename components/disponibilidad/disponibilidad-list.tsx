import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2, Trash2 } from "lucide-react";

interface Disponibilidad {
  id: string;
  tratamiento_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  boxes_disponibles: number[];
  rf_tratamientos: {
    id: string;
    nombre_tratamiento: string;
  } | null;
}

interface DisponibilidadListProps {
  disponibilidades: Disponibilidad[];
  onEdit: (disponibilidad: Disponibilidad) => void;
  onDelete: (disponibilidad: Disponibilidad) => void;
}

const formatearHora = (hora: string) => {
  const [horas, minutos] = hora.split(":");
  return `${horas}:${minutos}`;
};

export function DisponibilidadList({ disponibilidades, onEdit, onDelete }: DisponibilidadListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {disponibilidades.map((disp) => (
        <Card key={disp.id} className="cursor-pointer hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle>
              {format(parseISO(disp.fecha_inicio), "EEEE d 'de' MMMM", { locale: es })}
              {disp.fecha_fin && disp.fecha_fin !== disp.fecha_inicio && (
                <> - {format(parseISO(disp.fecha_fin), "EEEE d 'de' MMMM", { locale: es })}</>
              )}
            </CardTitle>
            <CardDescription>
              {formatearHora(disp.hora_inicio)} a {formatearHora(disp.hora_fin)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {disp.boxes_disponibles.map((box) => (
                <Badge key={box} variant="secondary">
                  Box {box}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(disp)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(disp)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 