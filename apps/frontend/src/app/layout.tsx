import { ReactNode } from 'react';
import { Noto_Sans_TC, Roboto, Roboto_Mono } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto',
});

const notoSansTc = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-tc',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${roboto.variable} ${notoSansTc.variable} ${robotoMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
