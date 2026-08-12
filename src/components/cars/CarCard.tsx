'use client';

import React from 'react';
import Link from 'next/link';
import { Car } from '@/types/car';
import { Badge } from '@/components/common/Badge';
import { CarImage } from '@/components/cars/CarImage';
import { formatCurrency } from '@/lib/utils';
import { Car as CarIcon, Users, Fuel, ArrowRight } from 'lucide-react';

interface CarCardProps {
  car: Car;
  pickupDate?: string;
  returnDate?: string;
}

export function CarCard({ car, pickupDate, returnDate }: CarCardProps) {
  // Build query string for booking link to pre-fill dates if user searched
  const bookingParams = new URLSearchParams();
  if (pickupDate) bookingParams.set('pickupDate', pickupDate);
  if (returnDate) bookingParams.set('returnDate', returnDate);
  bookingParams.set('carId', car.id);

  const detailUrl = `/cars/${car.id}${bookingParams.toString() ? `?${bookingParams.toString()}` : ''}`;
  const bookUrl = `/booking?${bookingParams.toString()}`;

  const isAvailable = car.status === 'AVAILABLE' && (car.availableUnits === undefined || car.availableUnits > 0);

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Image Container with Badges */}
        <div className="relative w-full h-52 bg-slate-900 overflow-hidden">
          <CarImage
            src={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
            label={`${car.brand} ${car.model}`}
            seedKey={car.id}
            className="absolute inset-0 h-full w-full"
            imageClassName="group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

          {/* Top Status & Quantity Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge status={car.status} />
            {car.availableUnits !== undefined && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/90 text-blue-300 border border-blue-500/30 backdrop-blur-md shadow-md">
                {car.availableUnits} {car.availableUnits === 1 ? 'unit left' : 'units available'}
              </span>
            )}
          </div>

          {/* Brand Overlay */}
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {car.brand}
            </span>
            <h3 className="text-xl font-extrabold text-white leading-snug drop-shadow-md">
              {car.model}
            </h3>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[36px]">
            {car.description || `Premium ${car.brand} ${car.model} available for city and highway rental in Ethiopia with full insurance.`}
          </p>

          {/* Key Features Chips */}
          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 font-medium pt-1">
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>5 Seats</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <Fuel className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Petrol</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <CarIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Auto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & CTA Footer */}
      <div className="p-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/40">
        <div>
          <span className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(car.pricePerDay)}
          </span>
          <span className="text-xs text-slate-400 block font-normal">/ day</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={detailUrl}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Details
          </Link>
          {isAvailable ? (
            <Link
              href={bookUrl}
              className="btn-gradient px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md group-hover:shadow-blue-500/25 transition-all"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <button
              disabled
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/40"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
