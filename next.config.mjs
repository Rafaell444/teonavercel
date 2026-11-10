/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The Firebase Admin SDK must run as a normal Node dependency, not be bundled
  serverExternalPackages: ['firebase-admin'],
}

export default nextConfig
