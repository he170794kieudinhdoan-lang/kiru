import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono, Unbounded } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

const unbounded = Unbounded({
  weight: ['800', '900'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-unbounded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kiru',
  description: 'Website tải & xem ảnh/video theo mã PIN 4 số cực đơn giản với Supabase & Neobrutalism UI',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${spaceGrotesk.variable} ${spaceMono.variable} ${unbounded.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen flex flex-col text-black antialiased selection:bg-neo-yellow selection:text-black font-sans">
        {children}
      </body>
    </html>
  );
}
