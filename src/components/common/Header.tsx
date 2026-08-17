'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Search, Menu, X, ShieldCheck, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The admin portal has its own chrome — never render the public header there.
  if (pathname?.startsWith('/admin')) return null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/cars', label: 'Explore Fleet' },
    { href: '/booking/lookup', label: 'Find Reservation' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/60 shadow-xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Ranzi <span className="text-gradient font-black">Rentals</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block -mt-1">
                Addis Ababa • Ethiopia
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/booking/lookup"
              className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-blue-400 transition-colors"
            >
              <Search className="w-4 h-4 text-blue-400" />
              Check Status
            </Link>
            <Link
              href="/cars"
              className="btn-gradient px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              Rent Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <Link
              href="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full btn-gradient py-3 rounded-xl font-semibold text-center block"
            >
              Browse & Reserve Car
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
