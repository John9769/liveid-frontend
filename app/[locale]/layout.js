import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";

export const metadata = {
  title: "LiveID — Own it before someone else does",
  description: "Claim a verified handle. Prove you're a real human, instantly.",
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ms' }];
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}