/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exportación estática para poder alojarlo en GitHub Pages.
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Si publicas en https://usuario.github.io/nombre-repo, descomenta y ajusta:
  // basePath: '/nombre-repo',
  // assetPrefix: '/nombre-repo/',
}

export default nextConfig
