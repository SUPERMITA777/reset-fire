"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface SiteConfig {
  hero: {
    title: string
    subtitle: string
    buttonText: string
  }
  treatments: Array<{
    name: string
    description: string
    image: string
  }>
  promotions: Array<{
    title: string
    description: string
    price: string
    image: string
  }>
  testimonials: Array<{
    name: string
    text: string
    rating: number
  }>
  contact: {
    address: string
    phone: string
    whatsapp: string
    hours: string
  }
}

const defaultConfig: SiteConfig = {
  hero: {
    title: "Tu Bienestar, Nuestra Pasión",
    subtitle:
      "Descubre la experiencia de relajación y belleza más exclusiva. Tratamientos personalizados en un ambiente de lujo y tranquilidad.",
    buttonText: "Reservá tu turno",
  },
  treatments: [
    {
      name: "Faciales",
      description: "Tratamientos faciales personalizados para todo tipo de piel",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      name: "Masajes",
      description: "Técnicas de relajación y descontractura muscular",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      name: "Depilación",
      description: "Depilación láser y tradicional con los mejores productos",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      name: "Cuerpo",
      description: "Tratamientos corporales para modelar y tonificar",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],
  promotions: [
    {
      title: "Facial Hidratante + Limpieza",
      description: "Tratamiento completo para revitalizar tu piel",
      price: "$8.500",
      image: "/placeholder.svg?height=250&width=350",
    },
    {
      title: "Masaje Relajante 60min",
      description: "Descontractura y relajación total",
      price: "$6.200",
      image: "/placeholder.svg?height=250&width=350",
    },
    {
      title: "Paquete Novia",
      description: "Preparación completa para tu día especial",
      price: "$15.000",
      image: "/placeholder.svg?height=250&width=350",
    },
  ],
  testimonials: [
    {
      name: "María González",
      text: "Un lugar increíble, me siento renovada después de cada visita. El personal es muy profesional y cálido.",
      rating: 5,
    },
    {
      name: "Ana Rodríguez",
      text: "Los mejores tratamientos faciales de la ciudad. Siempre salgo con la piel radiante.",
      rating: 5,
    },
    {
      name: "Laura Martínez",
      text: "El ambiente es súper relajante y los masajes son divinos. Lo recomiendo 100%.",
      rating: 5,
    },
  ],
  contact: {
    address: "Av. Corrientes 1234, CABA",
    phone: "+54 11 4567-8900",
    whatsapp: "+54 9 11 1234-5678",
    hours: "Lun a Vie: 9:00 - 20:00 | Sáb: 9:00 - 18:00",
  },
}

export default function AdminPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedConfig = localStorage.getItem("spaConfig")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const saveConfig = () => {
    localStorage.setItem("spaConfig", JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateHero = (field: keyof typeof config.hero, value: string) => {
    setConfig((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }))
  }

  const updateTreatment = (index: number, field: keyof (typeof config.treatments)[0], value: string) => {
    setConfig((prev) => ({
      ...prev,
      treatments: prev.treatments.map((treatment, i) => (i === index ? { ...treatment, [field]: value } : treatment)),
    }))
  }

  const addTreatment = () => {
    setConfig((prev) => ({
      ...prev,
      treatments: [
        ...prev.treatments,
        {
          name: "Nuevo Tratamiento",
          description: "Descripción del tratamiento",
          image: "/placeholder.svg?height=300&width=400",
        },
      ],
    }))
  }

  const removeTreatment = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      treatments: prev.treatments.filter((_, i) => i !== index),
    }))
  }

  const updatePromotion = (index: number, field: keyof (typeof config.promotions)[0], value: string) => {
    setConfig((prev) => ({
      ...prev,
      promotions: prev.promotions.map((promo, i) => (i === index ? { ...promo, [field]: value } : promo)),
    }))
  }

  const addPromotion = () => {
    setConfig((prev) => ({
      ...prev,
      promotions: [
        ...prev.promotions,
        {
          title: "Nueva Promoción",
          description: "Descripción de la promoción",
          price: "$0",
          image: "/placeholder.svg?height=250&width=350",
        },
      ],
    }))
  }

  const removePromotion = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      promotions: prev.promotions.filter((_, i) => i !== index),
    }))
  }

  const updateTestimonial = (index: number, field: keyof (typeof config.testimonials)[0], value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((testimonial, i) =>
        i === index ? { ...testimonial, [field]: value } : testimonial,
      ),
    }))
  }

  const addTestimonial = () => {
    setConfig((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        {
          name: "Nuevo Cliente",
          text: "Testimonio del cliente",
          rating: 5,
        },
      ],
    }))
  }

  const removeTestimonial = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }))
  }

  const updateContact = (field: keyof typeof config.contact, value: string) => {
    setConfig((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }))
  }

  return (
    <div className="min-h-screen bg-nude/10 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-charcoal hover:text-gold transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver al sitio</span>
            </Link>
            <h1 className="text-3xl font-serif text-charcoal">Panel de Administración</h1>
          </div>
          <Button onClick={saveConfig} className={`${saved ? "bg-green-600" : "bg-gold"} hover:bg-gold/90 text-white`}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Guardado!" : "Guardar Cambios"}
          </Button>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
            <TabsTrigger value="promotions">Promociones</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Sección Hero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título Principal</label>
                  <Input
                    value={config.hero.title}
                    onChange={(e) => updateHero("title", e.target.value)}
                    placeholder="Título principal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtítulo</label>
                  <Textarea
                    value={config.hero.subtitle}
                    onChange={(e) => updateHero("subtitle", e.target.value)}
                    placeholder="Subtítulo descriptivo"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Texto del Botón</label>
                  <Input
                    value={config.hero.buttonText}
                    onChange={(e) => updateHero("buttonText", e.target.value)}
                    placeholder="Texto del botón"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treatments">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif text-charcoal">Tratamientos</h2>
                <Button onClick={addTreatment} className="bg-gold hover:bg-gold/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Tratamiento
                </Button>
              </div>
              {config.treatments.map((treatment, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Tratamiento {index + 1}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTreatment(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre</label>
                      <Input
                        value={treatment.name}
                        onChange={(e) => updateTreatment(index, "name", e.target.value)}
                        placeholder="Nombre del tratamiento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Descripción</label>
                      <Textarea
                        value={treatment.description}
                        onChange={(e) => updateTreatment(index, "description", e.target.value)}
                        placeholder="Descripción del tratamiento"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                      <Input
                        value={treatment.image}
                        onChange={(e) => updateTreatment(index, "image", e.target.value)}
                        placeholder="URL de la imagen"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="promotions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif text-charcoal">Promociones</h2>
                <Button onClick={addPromotion} className="bg-gold hover:bg-gold/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Promoción
                </Button>
              </div>
              {config.promotions.map((promo, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Promoción {index + 1}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePromotion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <Input
                        value={promo.title}
                        onChange={(e) => updatePromotion(index, "title", e.target.value)}
                        placeholder="Título de la promoción"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Descripción</label>
                      <Textarea
                        value={promo.description}
                        onChange={(e) => updatePromotion(index, "description", e.target.value)}
                        placeholder="Descripción de la promoción"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Precio</label>
                      <Input
                        value={promo.price}
                        onChange={(e) => updatePromotion(index, "price", e.target.value)}
                        placeholder="Precio (ej: $8.500)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                      <Input
                        value={promo.image}
                        onChange={(e) => updatePromotion(index, "image", e.target.value)}
                        placeholder="URL de la imagen"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="testimonials">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif text-charcoal">Testimonios</h2>
                <Button onClick={addTestimonial} className="bg-gold hover:bg-gold/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Testimonio
                </Button>
              </div>
              {config.testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Testimonio {index + 1}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTestimonial(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre</label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                        placeholder="Nombre del cliente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Testimonio</label>
                      <Textarea
                        value={testimonial.text}
                        onChange={(e) => updateTestimonial(index, "text", e.target.value)}
                        placeholder="Testimonio del cliente"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Calificación (1-5)</label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating}
                        onChange={(e) => updateTestimonial(index, "rating", Number.parseInt(e.target.value))}
                        placeholder="Calificación"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dirección</label>
                  <Input
                    value={config.contact.address}
                    onChange={(e) => updateContact("address", e.target.value)}
                    placeholder="Dirección completa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <Input
                    value={config.contact.phone}
                    onChange={(e) => updateContact("phone", e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp</label>
                  <Input
                    value={config.contact.whatsapp}
                    onChange={(e) => updateContact("whatsapp", e.target.value)}
                    placeholder="Número de WhatsApp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Horarios</label>
                  <Input
                    value={config.contact.hours}
                    onChange={(e) => updateContact("hours", e.target.value)}
                    placeholder="Horarios de atención"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
