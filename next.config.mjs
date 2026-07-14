import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:handle((?!en|bm|api|_next|admin|invite|favicon.ico).*)',
        destination: '/en/verify/:handle',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);