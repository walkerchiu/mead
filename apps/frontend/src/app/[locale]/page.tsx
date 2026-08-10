import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import HomeClient from './HomeClient';

/**
 * 設定首頁 `<title>` 與 `<meta name="description">`（WCAG 2.4.2 Page Titled）。
 * 依當前 locale 從 next-intl 取「教育部藝術設計三大計畫」相關文案。
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portal' });
  const eyebrow = t('eyebrow');
  const siteName = t('footer.siteName');
  return {
    title: `${eyebrow} | ${siteName}`,
    description: t('heading'),
  };
}

export default function Home() {
  return <HomeClient />;
}
