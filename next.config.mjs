/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true, // Mantén los mapas de fuente en producción si son necesarios

  // Habilita Webpack para excluir dependencias del paquete final
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        "chart.js",
        "recharts",
        "nodemailer", // Excluye dependencias pesadas
      ];
    }

    // Optimiza el manejo de dependencias y módulos
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
      },
    };

    return config;
  },

  experimental: {
    outputFileTracing: true, // Optimiza la inclusión de dependencias necesarias
  },

  // Reduce el tamaño del build excluyendo archivos innecesarios
  poweredByHeader: false, // Opcional: desactiva el header X-Powered-By
};

export default nextConfig;
