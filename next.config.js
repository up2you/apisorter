/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:slug((?!catalog|apis|reviews|subscribe|webhooks|cron|cron/check-links|auth|admin).+)',
        destination: '/apis/:slug',
      },
    ];
  },
};

module.exports = nextConfig;





