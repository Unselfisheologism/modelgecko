/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: '.next',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Disable static optimization to avoid database connections during build
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
}

module.exports = nextConfig
