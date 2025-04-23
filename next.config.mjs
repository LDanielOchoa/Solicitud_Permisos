// next.config.mjs
const nextConfig = {
  // ⚠️ 'experimental.appDir' ya no es necesario y puede causar advertencias.
  // ⚠️ 'outputFileTracing' ya no se configura así en Next 14+

  productionBrowserSourceMaps: true,

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "chart.js",
        "recharts",
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
