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
    // Excluir completamente los archivos de Supabase Functions
    config.module.rules.push({
      test: /supabase\/functions/,
      use: 'null-loader'
    });
    
    // Excluir archivos que contengan imports de Deno
    config.module.rules.push({
      test: /\.(ts|js)$/,
      include: (input) => {
        return input.includes('supabase/functions') || 
               input.includes('deno.land') || 
               input.includes('esm.sh');
      },
      use: 'null-loader'
    });
    
    // Configurar externals para módulos de Deno
    if (!config.externals) {
      config.externals = [];
    }
    
    if (Array.isArray(config.externals)) {
      config.externals.push((context, request, callback) => {
        if (request.includes('deno.land') || request.includes('esm.sh')) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      });
    }
    
    return config;
  },
  // Excluir directorios específicos del build
  experimental: {
    // Remover appDir ya que no es válido en Next.js 15
  }
};

export default nextConfig;
