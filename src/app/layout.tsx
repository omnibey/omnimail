import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'OmniMail — Temporary Email by OmniBey | Secure, Fast & Disposable',
  description:
    'OmniMail by OmniBey: Instant, disposable temporary email service powered by Cloudflare Email Edge and Supabase. Protect your privacy, prevent spam, and automate QA testing.',
  keywords: [
    'temporary email',
    'disposable email',
    'temp mail',
    'OmniBey',
    'OmniMail',
    'Cloudflare email routing',
    'anonymous email',
    'QA email testing',
  ],
  authors: [{ name: 'OmniBey Engineering' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://omnibey.com'),
  openGraph: {
    title: 'OmniMail — Temporary Email by OmniBey',
    description: 'Instant, disposable email service powered by Cloudflare Email Edge and Supabase.',
    url: 'https://omnibey.com',
    siteName: 'OmniBey',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniMail — Temporary Email by OmniBey',
    description: 'Instant, disposable email service powered by Cloudflare Email Edge and Supabase.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
