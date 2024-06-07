/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'api.scryfall.com',
            port: '',
            pathname: '/cards/**',
          },
        ],
    },
}

module.exports = nextConfig
