"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const DEFAULT_TEXTURE = "/nudetexture.png";
const COLOR_PALETTE = [
  // Colores principales
  "#eab308", // Amarillo
  "#60a5fa", // Azul
  "#34d399", // Verde
  "#f87171", // Rojo
  "#f472b6", // Rosa
  "#a78bfa", // Violeta
  "#facc15", // Dorado
  "#fbbf24", // Naranja
  "#64748b", // Gris
  "#000000", // Negro
  "#ffffff", // Blanco
  // Colores adicionales
  "#ef4444", // Rojo intenso
  "#10b981", // Verde esmeralda
  "#3b82f6", // Azul intenso
  "#8b5cf6", // Púrpura
  "#f59e0b", // Ámbar
  "#06b6d4", // Cian
  "#84cc16", // Verde lima
  "#ec4899", // Rosa intenso
  "#6366f1", // Índigo
  "#14b8a6", // Verde azulado
];
const DEFAULT_BUTTON_COLOR = "#eab308";

export function AparienciaTab() {
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [previewTexture, setPreviewTexture] = useState<string>("");
  const [buttonBgColor, setButtonBgColor] = useState<string>(DEFAULT_BUTTON_COLOR);
  const [previewButtonColor, setPreviewButtonColor] = useState<string>(DEFAULT_BUTTON_COLOR);
  const [customColor, setCustomColor] = useState<string>(DEFAULT_BUTTON_COLOR);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("backgroundTexture");
    setBackgroundUrl(saved || DEFAULT_TEXTURE);
    setPreviewTexture(saved || DEFAULT_TEXTURE);
    const savedColor = localStorage.getItem("buttonBgColor");
    const color = savedColor || DEFAULT_BUTTON_COLOR;
    setButtonBgColor(color);
    setPreviewButtonColor(color);
    setCustomColor(color);
  }, []);

  // Redimensionar imagen a máximo 512x512px
  const resizeImage = (file: File, maxSize = 512): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("No se pudo obtener el contexto del canvas");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/png", 0.8);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedDataUrl = await resizeImage(file, 512);
        setPreviewTexture(resizedDataUrl);
      } catch (err) {
        setError("No se pudo procesar la imagen. Intenta con otro archivo.");
      }
    }
  };

  const handleApplyTexture = () => {
    setError("");
    try {
      localStorage.setItem("backgroundTexture", previewTexture);
      setBackgroundUrl(previewTexture);
      toast({
        title: "Textura aplicada",
        description: "La textura de fondo se ha aplicado correctamente.",
      });
    } catch (err: any) {
      if (err.name === "QuotaExceededError" || err.code === 22) {
        setError("La imagen es demasiado grande para ser guardada. Por favor, usa una imagen más pequeña o comprimida.");
      } else {
        setError("Error al guardar la imagen: " + err.message);
      }
    }
  };

  const handleColorSelect = (color: string) => {
    setPreviewButtonColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setPreviewButtonColor(color);
  };

  const handleApplyButtonColor = () => {
    localStorage.setItem("buttonBgColor", previewButtonColor);
    setButtonBgColor(previewButtonColor);
    
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('buttonColorChanged', { 
      detail: { color: previewButtonColor } 
    }));
    
    toast({
      title: "Color aplicado",
      description: "El color de los botones se ha aplicado correctamente.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Textura de fondo */}
      <Card>
        <CardHeader>
          <CardTitle>Textura de fondo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {previewTexture && (
                <img src={previewTexture} alt="Textura actual" className="object-cover w-full h-full" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="input-textura" className="sr-only">Subir nueva textura</label>
              <input
                id="input-textura"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Subir nueva textura
              </Button>
              <Button 
                variant="default" 
                onClick={handleApplyTexture} 
                disabled={previewTexture === backgroundUrl}
              >
                Aplicar textura
              </Button>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <p className="text-muted-foreground text-sm">
            La textura se aplicará como fondo en todo el sistema.
          </p>
        </CardContent>
      </Card>

      {/* Color de botones */}
      <Card>
        <CardHeader>
          <CardTitle>Color de fondo de los botones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview del color actual */}
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Color actual:</span>
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm" 
                style={{ backgroundColor: buttonBgColor }} 
              />
              <span className="text-xs font-mono text-gray-600">{buttonBgColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Color seleccionado:</span>
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm" 
                style={{ backgroundColor: previewButtonColor }} 
              />
              <span className="text-xs font-mono text-gray-600">{previewButtonColor}</span>
            </div>
          </div>

          {/* Paleta de colores */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Paleta de colores</Label>
            <div className="grid grid-cols-10 gap-2 mb-4">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110 ${
                    previewButtonColor === color 
                      ? 'border-black scale-110 ring-2 ring-black ring-offset-2' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  aria-label={`Elegir color ${color}`}
                >
                  {previewButtonColor === color && (
                    <span className="w-4 h-4 bg-white rounded-full border border-black shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color personalizado */}
          <div>
            <Label htmlFor="custom-color" className="text-sm font-medium mb-2 block">
              Color personalizado
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="custom-color"
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-16 h-10 p-1 border rounded cursor-pointer"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const color = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(color)) {
                    setCustomColor(color);
                    setPreviewButtonColor(color);
                  }
                }}
                placeholder="#eab308"
                className="flex-1"
              />
            </div>
          </div>

          {/* Botón aplicar */}
          <div className="flex justify-end">
            <Button 
              onClick={handleApplyButtonColor} 
              disabled={previewButtonColor === buttonBgColor}
              className="min-w-[120px]"
            >
              Aplicar color
            </Button>
          </div>

          <p className="text-muted-foreground text-sm">
            El color seleccionado se aplicará a los botones principales del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 