/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    domains: [],
  },
  reactStrictMode: true,
  // Configuración para usar src/app como directorio de rutas
  distDir: '.next',
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // Excluir archivos de Supabase Functions del build
  webpack: (config, { isServer }) => {
    // Excluir archivos de Supabase Functions
    config.module.rules.push({
      test: /supabase\/functions/,
      use: 'ignore-loader'
    });
    
    // Excluir módulos de Deno
    config.externals = config.externals || [];
    config.externals.push({
      'https://deno.land/std@0.168.0/http/server.ts': 'commonjs https://deno.land/std@0.168.0/http/server.ts',
      'https://esm.sh/@supabase/supabase-js@2': 'commonjs https://esm.sh/@supabase/supabase-js@2',
    });
    
    return config;
  },
  // Excluir directorios específicos del build
  experimental: {
    // Remover appDir ya que no es válido en Next.js 15
  }
};

export default nextConfig;
