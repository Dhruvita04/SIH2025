/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification for better performance
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['react-icons', '@heroicons/react', 'primereact', '@mui/material'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  poweredByHeader: false,
  compress: true,
  
  // Bundle analyzer for production
  webpack: (config, { isServer, dev }) => {
    // Remove console logs in production
    if (!dev) {
      config.optimization.minimizer[0].options.minimizer.options.compress.drop_console = true;
    }
    
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }
    
    // Optimize chunk splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          agora: {
            test: /[\\/]node_modules[\\/](agora)/,
            name: 'agora',
            chunks: 'all',
          },
          mui: {
            test: /[\\/]node_modules[\\/](@mui)/,
            name: 'mui',
            chunks: 'all',
          },
          primereact: {
            test: /[\\/]node_modules[\\/](primereact)/,
            name: 'primereact',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  async rewrites() {
    return [
      {
        source: "/login",
        destination:
          "https://telemedicine-pilot-d2anbuaxedbfdba9.southafricanorth-01.azurewebsites.net/login",
      },
    ];
  },
};

export default nextConfig;
