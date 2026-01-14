import localFont from 'next/font/local';
import type { Metadata } from 'next';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Providers from './providers';

const outfit = localFont({
  src: [
    { path: 'Outfit-Regular.woff2', weight: '400', style: 'normal' },
    { path: 'Outfit-Medium.woff2',  weight: '500', style: 'normal' },
    { path: 'Outfit-Bold.woff2',    weight: '700', style: 'normal' },
  ],
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'TECHEM - Espace client',
  description: 'Espace client TECHEM',
  icons: {
    icon: '/images/techem/logo.svg',
    shortcut: '/images/techem/logo.svg',
    apple: '/images/techem/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Providers>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
