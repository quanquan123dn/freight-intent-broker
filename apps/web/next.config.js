/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        // In development, proxy API calls to NestJS
        return process.env.NODE_ENV === 'development'
            ? [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:3001/:path*',
                },
            ]
            : [];
    },
};

module.exports = nextConfig;
