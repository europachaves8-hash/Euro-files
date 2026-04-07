import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  devIndicators: false,
  // Permitir imagens do Supabase
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uybvxwjidliyvraaqeop.supabase.co",
      },
    ],
  },
  // Rewrite rotas sem extensao para os arquivos HTML estaticos em public/
  async rewrites() {
    return [
      { source: "/vehicle-details", destination: "/vehicle-details.html" },
      { source: "/vehicles", destination: "/vehicles.html" },
      { source: "/services", destination: "/services.html" },
      { source: "/pricing", destination: "/pricing.html" },
      { source: "/contact", destination: "/contact.html" },
      { source: "/brand-details", destination: "/brand-details.html" },
      { source: "/home", destination: "/home.html" },
      { source: "/index.html", destination: "/home.html" },
    ];
  },
};

export default nextConfig;
