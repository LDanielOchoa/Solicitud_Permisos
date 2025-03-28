// next.config.mjs
const nextConfig = {
  experimental: {
    appDir: true, // Activa la nueva estructura de aplicaciones
    outputFileTracing: true, // Optimiza la inclusión de dependencias necesarias
    optimizeCss: false, // Desactiva la optimización de CSS si es necesario
  },

  productionBrowserSourceMaps: true,

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...config.externals || [],
        "chart.js", 
        "recharts", 
        "nodemailer", 
      ];
    }

    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
      },
    };

    return config;
  },

  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
