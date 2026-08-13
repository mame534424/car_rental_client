'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Car as CarIcon,
  CheckCircle2,
  Clock,
  CalendarArrowUp,
  CalendarArrowDown,
  AlertTriangle,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTodaysRentals, adminListBookings } from '@/lib/api/admin/bookings';
import { adminListCars } from '@/lib/api/admin/cars';
import { Booking } from '@/types/booking';
import { Car } from '@/types/car';
import { TodaysRentals } from '@/types/admin';
import { Badge } from '@/components/common/Badge';
import { StatCard, Banner, Spinner, EmptyState, PageHeader } from '@/components/admin/ui';
import { formatDate, getErrorMessage } from '@/lib/utils';

function TodayRow({ booking, kind }: { booking: Booking; kind: 'pickup' | 'return' }) {
  const car = booking.car;
  const when = kind === 'pickup' ? booking.pickupDate : booking.returnDate;
  const where = kind === 'pickup' ? booking.pickupLocation : booking.returnLocation;
  return (
    <Link
      href={`/admin/bookings/${booking.id}`}
      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 transition-colors hover:border-blue-500/40 hover:bg-slate-900/70"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {car ? `${car.brand} ${car.model}` : 'Vehicle'}
        </p>
        <p className="truncate text-xs text-slate-400">
          {booking.customer?.name ?? 'Customer'} · {formatDate(when, true)}
        </p>
      </div>
      <span className="hidden max-w-[40%] truncate text-xs text-slate-500 sm:block">{where}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-600" />
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<TodaysRentals | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, c, b] = await Promise.all([
        getTodaysRentals(),
        adminListCars(),
        adminListBookings(),
      ]);
      setToday(t);
      setCars(c);
      setBookings(b);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fleetSize = cars.length;
  const availableCars = cars.filter((c) => c.status === 'AVAILABLE').length;
  const pendingApproval = bookings.filter((b) => b.bookingStatus === 'PENDING_VERIFICATION').length;
  const activeRentals = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={admin ? `Welcome back, ${admin.name.split(' ')[0]} — here's today at a glance.` : undefined}
      />

      {error && (
        <Banner type="error" onClose={() => setError(null)}>
          {error}
        </Banner>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<LayoutGrid className="h-5 w-5" />} label="Fleet Vehicles" value={fleetSize} accent="blue" />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Available Models"
          value={availableCars}
          accent="emerald"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Awaiting Approval"
          value={pendingApproval}
          accent="amber"
        />
        <StatCard
          icon={<CarIcon className="h-5 w-5" />}
          label="Active Rentals"
          value={activeRentals}
          accent="slate"
        />
      </div>

      {/* Needs attention */}
      {pendingApproval > 0 && (
        <Link
          href="/admin/bookings?status=PENDING_VERIFICATION"
          className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 transition-colors hover:bg-amber-500/15"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <p className="flex-1 text-sm text-amber-200">
            <span className="font-bold">{pendingApproval}</span>{' '}
            {pendingApproval === 1 ? 'booking is' : 'bookings are'} awaiting your approval.
          </p>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-300">
            Review <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}

      {/* Today's rentals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarArrowUp className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Today&apos;s Pickups</h2>
            <span className="ml-auto rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              {today?.pickups.length ?? 0}
            </span>
          </div>
          {today && today.pickups.length > 0 ? (
            <div className="space-y-2.5">
              {today.pickups.map((b) => (
                <TodayRow key={b.id} booking={b} kind="pickup" />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">No confirmed pickups scheduled today.</p>
          )}
        </section>

        <section className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarArrowDown className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Today&apos;s Returns</h2>
            <span className="ml-auto rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              {today?.returns.length ?? 0}
            </span>
          </div>
          {today && today.returns.length > 0 ? (
            <div className="space-y-2.5">
              {today.returns.map((b) => (
                <TodayRow key={b.id} booking={b} kind="return" />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">No returns due today.</p>
          )}
        </section>
      </div>

      {/* Recent bookings */}
      <section className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Bookings</h2>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {bookings.length > 0 ? (
          <div className="space-y-2.5">
            {bookings.slice(0, 6).map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 transition-colors hover:border-blue-500/40 hover:bg-slate-900/70"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {b.customer?.name ?? 'Customer'}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {b.car ? `${b.car.brand} ${b.car.model}` : 'Vehicle'} · {formatDate(b.createdAt)}
                  </p>
                </div>
                <Badge status={b.bookingStatus} />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={<CarIcon className="h-6 w-6" />} title="No bookings yet" message="New reservations will appear here as customers book online or you add walk-ins." />
        )}
      </section>
    </div>
  );
}
