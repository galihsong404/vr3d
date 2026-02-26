/** @type {import('next').NextConfig} */
const nextConfig = {
    // Aktifkan standalone output untuk memperkecil ukuran container (Docker)
    output: 'standalone',
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
    },
};

module.exports = nextConfig;
