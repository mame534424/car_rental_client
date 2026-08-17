'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { AvailabilitySearch } from '@/components/cars/AvailabilitySearch';
import { CarCard } from '@/components/cars/CarCard';
import { CarGridSkeleton } from '@/components/common/LoadingSkeleton';
import { getCars } from '@/lib/api/cars';
import { Car } from '@/types/car';
import {
  Car as CarIcon,
  ShieldCheck,
  Zap,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCars() {
      try {
        setLoading(true);
        const data = await getCars();
        setFeaturedCars(data);
      } catch (err: any) {
        console.error('Failed to load cars:', err);
        setError('Could not connect to the backend server. Please verify backend is running on http://localhost:4000');
      } finally {
        setLoading(false);
      }
    }
    loadCars();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          {/* Top Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300 backdrop-blur-md shadow-lg">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Direct Online Car Reservations in Addis Ababa</span>
            </div>
          </div>

          {/* Hero Headlines */}
          <div className="text-center space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Drive with Confidence in Ethiopia with{' '}
              <span className="text-gradient">Ranzi Rentals</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Rent verified SUVs, sedans, and compact vehicles. Transparent daily pricing, manual receipt-based payment verification, and airport pickup.
            </p>
          </div>

          {/* Availability Search Card Component */}
          <div className="max-w-5xl mx-auto">
            <Suspense fallback={<div className="glass-panel p-6 rounded-3xl text-slate-400 text-center">Loading availability search...</div>}>
              <AvailabilitySearch />
            </Suspense>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center border-t border-slate-800/80">
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium">Verified Vehicles</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">0 ETB</div>
              <div className="text-xs text-slate-400 font-medium">Hidden Booking Fees</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">24/7</div>
              <div className="text-xs text-slate-400 font-medium">Bole Airport Pickup</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">Manual</div>
              <div className="text-xs text-slate-400 font-medium">Receipt Upload Payment</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fleet Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
              Available Fleet
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Featured Rental Vehicles
            </h2>
          </div>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View All Cars ({featuredCars.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <CarGridSkeleton count={3} />
        ) : error ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto border-rose-500/30">
            <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Backend Connection Notice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            <Link
              href="/cars"
              className="inline-block btn-gradient px-6 py-2.5 rounded-xl font-semibold text-xs"
            >
              Retry Connection
            </Link>
          </div>
        ) : featuredCars.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center space-y-3">
            <CarIcon className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No cars currently listed</h3>
            <p className="text-xs text-slate-400">Please check back later or refresh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.slice(0, 3).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Seamless Experience
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Rent Your Vehicle in 4 Easy Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4 border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-lg">
              01
            </div>
            <h3 className="text-base font-bold text-white">Select Vehicle & Dates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse our fleet of verified vehicles, select your pickup & return dates and choose your desired pickup location.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-lg">
              02
            </div>
            <h3 className="text-base font-bold text-white">Enter Info & Upload ID</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provide your details and upload a photo of your Fayda ID, National ID, Passport, or Driver’s License.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-lg">
              03
            </div>
            <h3 className="text-base font-bold text-white">Complete Online Payment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay securely via Chapa integration or mock checkout gate. Receive instant payment verification.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-lg">
              04
            </div>
            <h3 className="text-base font-bold text-white">Pick Up & Drive</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once verified by our admin team, pick up your vehicle at Bole Airport or your selected location and hit the road!
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Ranzi Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-blue-500/20 shadow-2xl">
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> Trusted Local Operator
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Why Thousands Choose <span className="text-gradient">Ranzi Rentals</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you need a reliable SUV for upcountry travel or a sleek sedan for business meetings in Addis Ababa, our direct rental system delivers unmatched transparency.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Real-time car availability matching exact rental windows</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Secure private document storage with signed URLs</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Manual receipt submission with admin verification</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/cars"
                  className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl inline-flex items-center gap-2"
                >
                  <CarIcon className="w-4 h-4" />
                  <span>Explore Available Vehicles</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl space-y-2 border-slate-800">
                <Zap className="w-8 h-8 text-blue-400" />
                <div className="text-base font-bold text-white">Instant Reserve</div>
                <p className="text-xs text-slate-400">Lock in your dates with zero delay.</p>
              </div>
              <div className="glass-card p-5 rounded-2xl space-y-2 border-slate-800">
                <CreditCard className="w-8 h-8 text-blue-400" />
                <div className="text-base font-bold text-white">Chapa Payment</div>
                <p className="text-xs text-slate-400">Fast local currency payments.</p>
              </div>
              <div className="glass-card p-5 rounded-2xl space-y-2 border-slate-800">
                <MapPin className="w-8 h-8 text-blue-400" />
                <div className="text-base font-bold text-white">Key Hub Pickups</div>
                <p className="text-xs text-slate-400">Bole Airport & city centers.</p>
              </div>
              <div className="glass-card p-5 rounded-2xl space-y-2 border-slate-800">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <div className="text-base font-bold text-white">Full Protection</div>
                <p className="text-xs text-slate-400">Comprehensive vehicle coverage.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
