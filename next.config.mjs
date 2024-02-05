

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ["./src/styles"],
  },
  images: {
    remotePatterns: {
      protocol: 'https',
      hostname: 'cdn1.epicgames.com',
      port: ''
    }
  }
};

export default nextConfig;
