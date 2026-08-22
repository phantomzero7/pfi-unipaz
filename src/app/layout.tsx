import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { PFIProvider } from '@/lib/store';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PFI UNIPAZ · Plataforma del Programa de Formación Integral',
  description: 'Gestión, seguimiento y acreditación oficial del Programa de Formación Integral (PFI) de la Universidad Internacional de La Paz (UNIPAZ).',
  icons: {
    icon: '/logo-unipaz.png',
    apple: '/logo-unipaz.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#F8FAFC] dark:bg-[#0A1526] text-slate-800 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300`}>
        <PFIProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 md:pb-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 py-6 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-unipaz-navy dark:text-white">UNIPAZ</span>
                <span>·</span>
                <span className="font-semibold">Universidad Internacional de La Paz</span>
              </div>
              <p>
                Programa de Formación Integral (PFI) · Sistema Oficial de Acreditación y Titulación
              </p>
            </div>
          </footer>
        </PFIProvider>
      </body>
    </html>
  );
}
