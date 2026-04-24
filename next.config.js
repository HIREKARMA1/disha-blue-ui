/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  remotePatterns: [
  {
  protocol: "http",
  hostname: "localhost",
  port: "8000",
  pathname: "/**",
  },
  {
  protocol: "https",
  hostname: "hirekarma.s3.us-east-1.amazonaws.com",
  pathname: "/**",
  },
  {
  protocol: "https",
  hostname: "hirekarma.s3.amazonaws.com",
  pathname: "/**",
  },
  ],
  },
  async rewrites() {
  // Get API configuration from environment variables directly
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_API_BASE_URL");
  }

  return [
  {
  source: "/api/:path*",
  destination: `${apiBaseUrl}/api/:path*`,
  },
  ];
  },
};

module.exports = nextConfig;
