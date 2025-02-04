/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['media.discordapp.net'], // Add any other image domains you use
    unoptimized: true
  },
  output: 'standalone', // Better for production deployments
  // Remove rewrites if you're using static export
}

module.exports = nextConfig 