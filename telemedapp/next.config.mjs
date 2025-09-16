import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification for better performance
  swcMinify: true,
  
  experimental: {
    optimizePackageImports: ['react-icons', '@heroicons/react', 'primereact'],
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  poweredByHeader: false,
  compress: true,

  async rewrites() {
    return [
      {
        source: "/login",
        destination:
          "https://telemedicine-pilot-d2anbuaxedbfdba9.southafricanorth-01.azurewebsites.net/login",
      },
    ];
  },

  // Webpack configuration for performance
  webpack: (config, { isServer, dev }) => {
    // Remove console logs in production
    if (!dev && config.optimization?.minimizer?.[0]) {
      try {
        config.optimization.minimizer[0].options.minimizer.options.compress.drop_console = true;
      } catch (e) {
        // Silently fail if structure is different
      }
    }
    
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      };
    }

    // Optimize chunk splitting for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          agora: {
            test: /[\\/]node_modules[\\/](agora)/,
            name: 'agora',
            chunks: 'all',
            priority: 20,
          },
          primereact: {
            test: /[\\/]node_modules[\\/](primereact|primeicons)/,
            name: 'primereact',
            chunks: 'all',
            priority: 20,
          },
          mui: {
            test: /[\\/]node_modules[\\/](@mui)/,
            name: 'mui',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);