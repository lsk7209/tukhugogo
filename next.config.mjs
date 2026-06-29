/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  trailingSlash: true,
  async rewrites() {
    return [
      { source: "/uBCC0uD615uC548.html", destination: "/" },
      { source: "/byeonhyeongan", destination: "/" },
      { source: "/variants", destination: "/" }
    ];
  }
};

export default nextConfig;
