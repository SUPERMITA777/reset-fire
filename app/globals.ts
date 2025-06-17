export const siteConfig = {
  name: 'Reset Fire',
  description: 'Sistema completo de gestión de citas y tratamientos para clínicas estéticas',
  url: 'https://reset-fire.vercel.app',
  ogImage: 'https://reset-fire.vercel.app/og.jpg',
  links: {
    twitter: 'https://twitter.com/tu-usuario',
    github: 'https://github.com/tu-usuario/reset-fire',
  },
}

export const appConfig = {
  defaultLocale: 'es',
  supportedLocales: ['es', 'en'],
  timezone: 'America/Argentina/Buenos_Aires',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
}

export const businessConfig = {
  businessHours: {
    start: '09:00',
    end: '18:00',
  },
  defaultDuration: 60, // minutos
  maxClientsPerSlot: 1,
  availableBoxes: [1, 2, 3, 4], // números de boxes disponibles
} 