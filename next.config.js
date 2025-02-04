/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  output: 'standalone', // Better for production deployments
  // Remove rewrites if you're using static export
}

module.exports = nextConfig 