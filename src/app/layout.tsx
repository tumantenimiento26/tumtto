import type { Metadata } from 'next';
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/lib/auth';
import { THEME_SCRIPT } from '@/lib/theme';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-manrope',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-jbmono',
});

export const metadata: Metadata = {
  // Cada ruta pone su título: «Servicios · Tumantenimiento».
  title: { default: 'Tumantenimiento', template: '%s · Tumantenimiento' },
  description:
    'Mantenimiento a domicilio con técnicos verificados en la zona metropolitana de Guadalajara.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${manrope.variable} ${mono.variable}`}
      // data-theme lo pone THEME_SCRIPT antes de hidratar.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
