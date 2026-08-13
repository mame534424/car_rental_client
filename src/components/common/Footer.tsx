'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, MapPin, Phone, Mail, ShieldCheck, Clock, CheckCircle2, Lock } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // The admin portal has its own chrome — never render the public footer there.
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-[#070707] border-t border-slate-800/80 text-slate-400 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Lumen <span className="text-gradient">Rentals</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Premium, reliable car rental service operating in Addis Ababa. Guaranteed transparent pricing, online reservations, and instant customer verification.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-4 h-4" /> Verified Direct Fleet Operator
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/cars" className="hover:text-blue-400 transition-colors">Browse All Vehicles</Link>
              </li>
              <li>
                <Link href="/booking/lookup" className="hover:text-blue-400 transition-colors">Check Reservation Status</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Contact & Location</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>Bole International Airport Area, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+251 911 22 33 44</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@lumenrentals.et</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Daily 07:00 – 21:00 (UTC+3)</span>
              </li>
            </ul>
          </div>

          {/* Trust Guarantee */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Rental Guarantees</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No Hidden Fees or Deposit Traps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fully Insured & Maintained Vehicles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Online Chapa Payment Support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 Roadside Assistance</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 text-xs text-center text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Lumen Car Rental System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-400 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
            <span className="text-slate-700">•</span>
            <p className="text-slate-500 font-mono">API v1.0.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
