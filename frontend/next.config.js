/** @type {import('next').NextConfig} */
const nextConfig = {
    // Aktifkan standalone output untuk memperkecil ukuran container (Docker)
    output: 'standalone',
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
    },
    // Proxy API requests to Go backend — fixes sign-to-login flow
    async rewrites() {
        return [
            {
                source: '/api/v1/:path*',
                destination: `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/v1/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
