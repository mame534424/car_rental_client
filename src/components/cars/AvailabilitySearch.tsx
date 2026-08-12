'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, MapPin, Clock, Search, AlertCircle } from 'lucide-react';
import { calculateRentalDays, formatDate } from '@/lib/utils';

interface AvailabilitySearchProps {
  onSearch?: (pickupDate: string, returnDate: string) => void;
  className?: string;
}

export function AvailabilitySearch({ onSearch, className }: AvailabilitySearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default dates: tomorrow at 09:00 -> 3 days later at 09:00
  const defaultPickup = new Date(Date.now() + 86400000);
  defaultPickup.setHours(9, 0, 0, 0);

  const defaultReturn = new Date(Date.now() + 4 * 86400000);
  defaultReturn.setHours(9, 0, 0, 0);

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
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
  const [pickupLocation, setPickupLocation] = useState('Bole International Airport, Addis Ababa');
  const [error, setError] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pickup = new Date(pickupDate);
    const ret = new Date(returnDate);

    if (isNaN(pickup.getTime()) || isNaN(ret.getTime())) {
      setError('Please select valid pickup and return dates');
      return;
    }

    if (ret <= pickup) {
      setError('Return date must be at least 1 hour after pickup date');
      return;
    }

    const isoPickup = pickup.toISOString();
    const isoReturn = ret.toISOString();

    if (onSearch) {
      onSearch(isoPickup, isoReturn);
    } else {
      const params = new URLSearchParams();
      params.set('pickupDate', isoPickup);
      params.set('returnDate', isoReturn);
      router.push(`/cars?${params.toString()}`);
    }
  };

  const durationDays = calculateRentalDays(pickupDate, returnDate);

  return (
    <div className={`glass-panel rounded-3xl p-6 shadow-2xl border border-slate-700/60 relative ${className || ''}`}>
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Pickup & Return Location
            </label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Bole International Airport, Addis Ababa" className="bg-slate-900 text-white">
                Bole Intl. Airport (ADD), Addis Ababa
              </option>
              <option value="Kazanchis Downtown Center, Addis Ababa" className="bg-slate-900 text-white">
                Kazanchis Downtown, Addis Ababa
              </option>
              <option value="Stadium / Meskel Square, Addis Ababa" className="bg-slate-900 text-white">
                Meskel Square Hub, Addis Ababa
              </option>
              <option value="Sarbet / Old Airport, Addis Ababa" className="bg-slate-900 text-white">
                Sarbet / Old Airport Area
              </option>
            </select>
          </div>

          {/* Pickup Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Pickup Date & Time
            </label>
            <input
              type="datetime-local"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Return Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Return Date & Time
            </label>
            <input
              type="datetime-local"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit & Duration Info Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Rental Duration:</span>
            <span className="text-white font-bold bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/30">
              {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto btn-gradient px-8 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Search Available Cars</span>
          </button>
        </div>
      </form>
    </div>
  );
}
