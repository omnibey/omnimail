/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support server-side mailparser and node buffers safely
  serverExternalPackages: ['mailparser'],
};

export default nextConfig;
