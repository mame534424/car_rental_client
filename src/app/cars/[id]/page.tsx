'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCarById } from '@/lib/api/cars';
import { Car } from '@/types/car';
import { Badge } from '@/components/common/Badge';
import { CarImage } from '@/components/cars/CarImage';
import { CarDetailSkeleton } from '@/components/common/LoadingSkeleton';
import { formatCurrency, calculateRentalDays, calculateTotalPrice } from '@/lib/utils';
import {
  Car as CarIcon,
  Users,
  Fuel,
  ShieldCheck,
  Calendar,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

function CarDetailContent({ params }: CarDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default dates: tomorrow -> +3 days
  const defaultPickup = new Date(Date.now() + 86400000);
  defaultPickup.setHours(9, 0, 0, 0);
  const defaultReturn = new Date(Date.now() + 4 * 86400000);
  defaultReturn.setHours(9, 0, 0, 0);

  const formatInputDateTime = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const initialPickup = searchParams.get('pickupDate')
    ? formatInputDateTime(new Date(searchParams.get('pickupDate')!))
    : formatInputDateTime(defaultPickup);

  const initialReturn = searchParams.get('returnDate')
    ? formatInputDateTime(new Date(searchParams.get('returnDate')!))
    : formatInputDateTime(defaultReturn);

  const [pickupDate, setPickupDate] = useState(initialPickup);
  const [returnDate, setReturnDate] = useState(initialReturn);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCar() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCarById(id);
        setCar(data);
      } catch (err: any) {
        console.error('Error fetching car:', err);
        setError(err.message || 'Vehicle not found or server unavailable');
      } finally {
        setLoading(false);
      }
    }
    loadCar();
  }, [id]);

  const rentalDays = calculateRentalDays(pickupDate, returnDate);
  const totalPrice = car ? calculateTotalPrice(car.pricePerDay, pickupDate, returnDate) : 0;

  const handleProceedToBooking = () => {
    setDateError(null);
    const pickup = new Date(pickupDate);
    const ret = new Date(returnDate);

    if (isNaN(pickup.getTime()) || isNaN(ret.getTime())) {
      setDateError('Please enter valid pickup and return dates');
      return;
    }

    if (ret <= pickup) {
      setDateError('Return date must be after pickup date');
      return;
    }

    const query = new URLSearchParams();
    query.set('carId', id);
    query.set('pickupDate', pickup.toISOString());
    query.set('returnDate', ret.toISOString());

    router.push(`/booking?${query.toString()}`);
  };

  if (loading) return <CarDetailSkeleton />;

  if (error || !car) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Vehicle Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'This vehicle is no longer available in our inventory.'}</p>
        <Link
          href="/cars"
          className="btn-gradient px-6 py-2.5 rounded-xl font-semibold text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <Link
        href="/cars"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-blue-400" />
        <span>Back to All Vehicles</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Image & Spec Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Hero Image */}
          <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-900 rounded-3xl overflow-hidden glass-card border border-slate-800">
            <CarImage
              src={car.imageUrl}
              alt={`${car.brand} ${car.model}`}
              label={`${car.brand} ${car.model}`}
              seedKey={car.id}
              className="absolute inset-0 h-full w-full"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <Badge status={car.status} />
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-950/80 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                Total Fleet Stock: {car.quantity}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {car.brand}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white">{car.model}</h1>
            </div>
          </div>

          {/* Description Card */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Vehicle Overview</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {car.description ||
                `The ${car.brand} ${car.model} is an exceptional rental vehicle offering robust performance, high fuel efficiency, and refined comfort for navigating Addis Ababa and regional highways in Ethiopia.`}
            </p>
          </div>

          {/* Vehicle Specifications Grid */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Specifications & Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                <Users className="w-5 h-5 text-blue-400" />
                <div className="text-xs text-slate-400">Seating</div>
                <div className="text-sm font-bold text-white">5 Passengers</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                <Fuel className="w-5 h-5 text-blue-400" />
                <div className="text-xs text-slate-400">Fuel Type</div>
                <div className="text-sm font-bold text-white">Unleaded Petrol</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                <CarIcon className="w-5 h-5 text-blue-400" />
                <div className="text-xs text-slate-400">Transmission</div>
                <div className="text-sm font-bold text-white">Automatic</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div className="text-xs text-slate-400">Insurance</div>
                <div className="text-sm font-bold text-white">Included</div>
              </div>
            </div>
          </div>

          {/* Location & Included Features */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Rental Inclusions</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Unlimited Mileage in Addis Ababa</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bole Airport Pickup / Drop-off available</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>24/7 Roadside Assistance support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mobile Money payment option (manual receipt)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Dynamic Price Calculator & Booking Launcher */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6 sticky top-28 border border-blue-500/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-slate-400 font-medium">Daily Rate</div>
                <div className="text-3xl font-black text-white">
                  {formatCurrency(car.pricePerDay)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Best Price Guaranteed
                </span>
              </div>
            </div>

            {/* Date Selectors for Live Calculation */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                Select Rental Window
              </h3>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-medium">Pickup Date & Time</label>
                <input
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-medium">Return Date & Time</label>
                <input
                  type="datetime-local"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs font-medium"
                />
              </div>

              {dateError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{dateError}</span>
                </div>
              )}
            </div>

            {/* Pricing Calculation Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Daily Rate:</span>
                <span>{formatCurrency(car.pricePerDay)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Duration:</span>
                <span className="font-semibold text-slate-200">{rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-sm text-white">
                <span>Estimated Total:</span>
                <span className="text-gradient text-lg">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Reserve CTA Button */}
            {car.status === 'AVAILABLE' ? (
              <button
                onClick={handleProceedToBooking}
                className="w-full btn-gradient py-3.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceed to Reserve</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50"
              >
                Vehicle Unavailable
              </button>
            )}

            <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Includes instant document upload & manual receipt submission</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarDetailPage(props: CarDetailPageProps) {
  return (
    <Suspense fallback={<CarDetailSkeleton />}>
      <CarDetailContent {...props} />
    </Suspense>
  );
}
