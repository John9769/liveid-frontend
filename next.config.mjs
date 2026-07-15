import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:handle((?!en|bm|admin|invite|terms|privacy|api|_next|favicon|register|login|vault|waitlist|payment|reset-password|verify)[a-z0-9_]+)',
        destination: '/en/verify/:handle',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);