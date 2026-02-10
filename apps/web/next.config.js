/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@agente-tritutario/shared', '@agente-tritutario/rag', '@agente-tritutario/ai-agent'],
};

module.exports = nextConfig;
