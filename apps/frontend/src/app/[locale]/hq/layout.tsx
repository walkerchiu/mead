import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HQ Dashboard',
  description: 'HQ Dashboard - Audit Logs',
};

export default function HQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
