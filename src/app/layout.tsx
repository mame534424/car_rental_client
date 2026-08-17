import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Ranzi Car Rental — Premium Vehicle Rentals in Addis Ababa',
  description:
    'Book premium rental cars in Addis Ababa, Ethiopia. Easy online booking, manual receipt-based payment verification, transparent pricing, and 24/7 airport pickup.',
  keywords: [
    'Car Rental Addis Ababa',
    'Ethiopia Car Rental',
    'Rent a Car Bole Airport',
    'Ranzi Rentals',
    'Receipt Payment Rental',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full dark ${geistSans.variable} ${geistMono.variable} bg-neutral-950`}>
      <body className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-neutral-200 selection:text-neutral-950">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
