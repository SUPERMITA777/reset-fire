"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, MapPin, Clock, Instagram, Facebook, Twitter, Star, Sparkles, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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

export default function HomePage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    message: "",
  })

  useEffect(() => {
    const savedConfig = localStorage.getItem("spaConfig")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const whatsappMessage = `Hola! Soy ${formData.name}. ${formData.message}`
    const whatsappUrl = `https://wa.me/${config.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, "_blank")
    setFormData({ name: "", whatsapp: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-pearl-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-gold" />
            <span className="text-2xl font-serif text-charcoal">EstiloSpa</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#inicio" className="text-charcoal hover:text-gold transition-colors">
              Inicio
            </a>
            <a href="#tratamientos" className="text-charcoal hover:text-gold transition-colors">
              Tratamientos
            </a>
            <a href="#promociones" className="text-charcoal hover:text-gold transition-colors">
              Promociones
            </a>
            <a href="#contacto" className="text-charcoal hover:text-gold transition-colors">
              Contacto
            </a>
          </nav>
          <Link href="/admin" className="text-sm text-charcoal/60 hover:text-gold transition-colors">
            Admin
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20 z-10"></div>
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Spa ambiente relajante"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif mb-6 animate-fade-in">{config.hero.title}</h1>
          <p className="text-xl md:text-2xl mb-8 font-light leading-relaxed animate-fade-in-delay">
            {config.hero.subtitle}
          </p>
          <Button
            size="lg"
            className="bg-gold hover:bg-gold/90 text-white px-8 py-4 text-lg font-medium animate-fade-in-delay-2"
            onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })}
          >
            {config.hero.buttonText}
          </Button>
        </div>
      </section>

      {/* Treatments Section */}
      <section id="tratamientos" className="py-20 bg-nude/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Nuestros Tratamientos</h2>
            <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
              Experiencias únicas diseñadas para tu bienestar y belleza
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {config.treatments.map((treatment, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={treatment.image || "/placeholder.svg"}
                    alt={treatment.name}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-serif text-charcoal mb-3">{treatment.name}</h3>
                  <p className="text-charcoal/70 leading-relaxed">{treatment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section id="promociones" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Promociones del Mes</h2>
            <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
              Ofertas especiales para que disfrutes de nuestros mejores tratamientos
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.promotions.map((promo, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-nude/20 to-pearl/30"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={promo.image || "/placeholder.svg"}
                    alt={promo.title}
                    width={350}
                    height={250}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full font-medium">
                    {promo.price}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif text-charcoal mb-3">{promo.title}</h3>
                  <p className="text-charcoal/70 leading-relaxed">{promo.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-pearl/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Lo que Dicen Nuestras Clientas</h2>
            <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
              Testimonios reales de quienes confían en nosotros
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-charcoal/80 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold/20 to-nude/40 rounded-full flex items-center justify-center mr-4">
                      <Heart className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{testimonial.name}</p>
                      <p className="text-sm text-charcoal/60">Cliente satisfecha</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4">Contactanos</h2>
            <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
              Estamos aquí para atenderte y hacer realidad tu experiencia de bienestar
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-gold mt-1" />
                <div>
                  <h3 className="font-medium text-charcoal mb-1">Dirección</h3>
                  <p className="text-charcoal/70">{config.contact.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-gold mt-1" />
                <div>
                  <h3 className="font-medium text-charcoal mb-1">Teléfono</h3>
                  <p className="text-charcoal/70">{config.contact.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-gold mt-1" />
                <div>
                  <h3 className="font-medium text-charcoal mb-1">Horarios</h3>
                  <p className="text-charcoal/70">{config.contact.hours}</p>
                </div>
              </div>
            </div>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="border-pearl focus:border-gold"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="WhatsApp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      required
                      className="border-pearl focus:border-gold"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Contanos qué tratamiento te interesa..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      className="border-pearl focus:border-gold"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-white">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-gold" />
                <span className="text-xl font-serif">EstiloSpa</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Tu centro de estética y spa de confianza. Dedicados a tu bienestar y belleza.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Contacto</h3>
              <div className="space-y-2 text-white/70">
                <p>{config.contact.address}</p>
                <p>{config.contact.phone}</p>
                <p>{config.contact.hours}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4">Seguinos</h3>
              <div className="flex space-x-4">
                <Instagram className="h-6 w-6 text-white/70 hover:text-gold cursor-pointer transition-colors" />
                <Facebook className="h-6 w-6 text-white/70 hover:text-gold cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-white/70 hover:text-gold cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/60">
            <p>&copy; 2024 EstiloSpa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
