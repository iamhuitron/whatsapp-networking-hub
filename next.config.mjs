/**
 * La app no usa ninguna funcionalidad de servidor (sin API routes, sin
 * Server Actions con lógica de negocio, sin middleware). Esto permite
 * generar un export 100% estático, compatible tanto con Vercel como con
 * GitHub Pages sin cambios de código.
 *
 * Para GitHub Pages, si el repo se sirve desde una subruta
 * (https://usuario.github.io/whatsapp-networking-hub), define
 * NEXT_PUBLIC_BASE_PATH en el workflow de deployment (ver
 * .github/workflows/deploy-pages.yml).
 *
 * @type {import('next').NextConfig}
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true, // next/image optimization requiere servidor; no la usamos
  },
  trailingSlash: true,
};

export default nextConfig;
