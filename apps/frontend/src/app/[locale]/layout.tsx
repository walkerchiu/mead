import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { routing, Locale } from '@/i18n/routing';
import { Providers } from './providers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  // 從 middleware 讀取 nonce 並傳遞給客戶端組件
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers nonce={nonce}>{children}</Providers>
    </NextIntlClientProvider>
  );
}
