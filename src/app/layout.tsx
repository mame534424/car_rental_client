import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'Lumen Car Rental — Premium Vehicle Rentals in Addis Ababa',
  description:
    'Book premium rental cars in Addis Ababa, Ethiopia. Easy online booking, instant Chapa payment, transparent pricing, and 24/7 airport pickup.',
  keywords: [
    'Car Rental Addis Ababa',
    'Ethiopia Car Rental',
    'Rent a Car Bole Airport',
    'Lumen Rentals',
    'Chapa Payment Rental',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
