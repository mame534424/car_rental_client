'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCars } from '@/lib/api/cars';
import { Car } from '@/types/car';
import { CarCard } from '@/components/cars/CarCard';
import { AvailabilitySearch } from '@/components/cars/AvailabilitySearch';
import { CarGridSkeleton } from '@/components/common/LoadingSkeleton';
import { Car as CarIcon, SlidersHorizontal, ArrowUpDown, Calendar, RefreshCw } from 'lucide-react';

function CarsContent() {
  const searchParams = useSearchParams();
  const pickupDate = searchParams.get('pickupDate') || undefined;
  const returnDate = searchParams.get('returnDate') || undefined;

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'brand'>('recommended');

  const fetchFleet = async (pickup?: string, ret?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCars({ pickupDate: pickup, returnDate: ret });
      setCars(data);
    } catch (err: any) {
      console.error('Failed to fetch cars:', err);
      setError(err.message || 'Failed to load vehicle catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet(pickupDate, returnDate);
  }, [pickupDate, returnDate]);

  // Unique brand list
  const availableBrands = useMemo(() => {
    const brands = Array.from(new Set(cars.map((c) => c.brand)));
    return ['ALL', ...brands];
  }, [cars]);

  // Filtered & Sorted Cars
  const processedCars = useMemo(() => {
    let result = [...cars];

    if (selectedBrand !== 'ALL') {
      result = result.filter((c) => c.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.pricePerDay) - Number(b.pricePerDay));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.pricePerDay) - Number(a.pricePerDay));
    } else if (sortBy === 'brand') {
      result.sort((a, b) => a.brand.localeCompare(b.brand));
    }

    return result;
  }, [cars, selectedBrand, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Title Banner */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">
          Vehicle Catalog & Reservations
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore Our <span className="text-gradient">Vehicle Fleet</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Filter by your rental dates to verify real-time unit availability against our server database.
        </p>
      </div>

      {/* Date Search Filter Accordion/Widget */}
      <AvailabilitySearch onSearch={(p, r) => fetchFleet(p, r)} />

      {/* Active Search Banner */}
      {pickupDate && returnDate && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Showing cars available from{' '}
              <strong className="text-white">{new Date(pickupDate).toLocaleString()}</strong> to{' '}
              <strong className="text-white">{new Date(returnDate).toLocaleString()}</strong>
            </span>
          </div>
          <button
            onClick={() => fetchFleet()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-white font-semibold transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Date Filters</span>
          </button>
        </div>
      )}

      {/* Controls Bar: Brand Filters & Sorting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        {/* Brand Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Brand:
          </span>
          {availableBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedBrand === brand
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="recommended" className="bg-slate-900">Recommended</option>
            <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
            <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
            <option value="brand" className="bg-slate-900">Brand Name</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <CarGridSkeleton count={6} />
      ) : error ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-4 max-w-xl mx-auto border-rose-500/30">
          <CarIcon className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Error Loading Catalog</h3>
          <p className="text-xs text-slate-400">{error}</p>
          <button
            onClick={() => fetchFleet(pickupDate, returnDate)}
            className="btn-gradient px-6 py-2.5 rounded-xl font-semibold text-xs inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : processedCars.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center space-y-4 max-w-md mx-auto">
          <CarIcon className="w-16 h-16 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No vehicles found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No cars match your selected date window or brand filter. Try adjusting your search criteria.
          </p>
          <button
            onClick={() => {
              setSelectedBrand('ALL');
              fetchFleet();
            }}
            className="btn-gradient px-6 py-2.5 rounded-xl font-semibold text-xs inline-block"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedCars.map((car) => (
            <CarCard key={car.id} car={car} pickupDate={pickupDate} returnDate={returnDate} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<CarGridSkeleton count={6} />}>
      <CarsContent />
    </Suspense>
  );
}
