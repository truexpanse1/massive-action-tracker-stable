/** @type {import('next').NextConfig} */
const nextConfig = {
  // This forces Next.js to treat /api routes as real API routes — NO MORE hijacking
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
