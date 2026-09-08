import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix 500 en prod (2026-09-07): las fichas de producto eran las ÚNICAS
  // rutas que importaban isomorphic-dompurify (lib/sanitize.ts). Bundleada
  // por Turbopack, su pila jsdom revienta en el runtime Node de Vercel
  // aunque funcione en local; externalizada se resuelve con require normal
  // desde node_modules. (Síntoma clásico: 500 solo en el deploy, 200 local.)
  serverExternalPackages: ["isomorphic-dompurify"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "**.myshopify.com" },
    ],
  },
};

export default nextConfig;
