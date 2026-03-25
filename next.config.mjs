/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.agoda.net' },
      { protocol: 'https', hostname: '*.akamaized.net' },
      { protocol: 'https', hostname: 'pix8.agoda.net' },
    ],
  },
};

export default nextConfig;
