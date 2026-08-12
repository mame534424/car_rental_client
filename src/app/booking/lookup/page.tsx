'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { verifyPayment } from '@/lib/api/payments';
import { PaymentRecord, BookingStatus } from '@/types/booking';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Car as CarIcon,
  Loader2,
  FileSearch,
  ArrowRight,
} from 'lucide-react';

export default function BookingLookupPage() {
  const [txRefInput, setTxRefInput] = useState('');
  const [paymentResult, setPaymentResult] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txRefInput.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      setPaymentResult(null);

      const res = await verifyPayment(txRefInput.trim());
      setPaymentResult(res);
    } catch (err: any) {
      console.error('Lookup error:', err);
      setError(err.message || 'No reservation found matching this reference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">
          Reservation Tracker
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Check Your <span className="text-gradient">Booking Status</span>
        </h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Enter your Chapa Transaction Reference (e.g. <code className="text-blue-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">chapa-mock-...</code>) to check live status.
        </p>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearch} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter transaction reference (e.g. chapa-mock-...)"
              value={txRefInput}
              onChange={(e) => setTxRefInput(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !txRefInput.trim()}
            className="btn-gradient px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
            <span>Search Status</span>
          </button>
        </div>
      </form>

      {/* Results Display */}
      {error && (
        <div className="glass-card p-6 rounded-2xl border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Reservation Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        </div>
      )}

      {paymentResult && (
        <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs text-slate-400">Transaction Reference</div>
              <div className="text-base font-mono font-bold text-blue-300">{paymentResult.transactionReference}</div>
            </div>
            <Badge
              status={
                paymentResult.status === 'PAID'
                  ? 'PENDING_VERIFICATION'
                  : 'PENDING_PAYMENT'
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Amount</span>
              <strong className="text-gradient text-base">{formatCurrency(paymentResult.amount)}</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Payment Status</span>
              <strong className={paymentResult.status === 'PAID' ? 'text-emerald-400 text-sm' : 'text-amber-400 text-sm'}>
                {paymentResult.status}
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Payment Provider</span>
              <strong className="text-white capitalize">{paymentResult.provider.replace(/_/g, ' ')}</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Timestamp</span>
              <strong className="text-white">{formatDate(paymentResult.createdAt, true)}</strong>
            </div>
          </div>

          {/* Action Link to Status Detail Page */}
          <div className="pt-2">
            <Link
              href={`/booking/status/${encodeURIComponent(paymentResult.transactionReference)}`}
              className="w-full btn-gradient py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <span>View Full Reservation & Status Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Helper Information Box */}
      {!searched && (
        <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Status Guide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300">Pending Payment</span>
              <p className="text-[11px] text-slate-400">Reservation initiated, awaiting payment checkout.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-sky-300">Pending Verification</span>
              <p className="text-[11px] text-slate-400">Payment received, awaiting admin document check.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-300">Confirmed</span>
              <p className="text-[11px] text-slate-400">Approved by admin and ready for vehicle pickup.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="font-bold text-blue-300">Completed</span>
              <p className="text-[11px] text-slate-400">Vehicle rental successfully completed.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
