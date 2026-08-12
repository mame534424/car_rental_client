'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { verifyPayment } from '@/lib/api/payments';
import { PaymentRecord, BookingStatus } from '@/types/booking';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  FileCheck,
  Printer,
  ArrowRight,
  Car as CarIcon,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

interface PaymentStatusPageProps {
  params: Promise<{ ref: string }>;
}

export default function PaymentStatusPage({ params }: PaymentStatusPageProps) {
  const { ref } = use(params);

  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | string>('PENDING_PAYMENT');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Trigger payment verification on mount or user action
  const handleVerify = async () => {
    try {
      setVerifying(true);
      setError(null);
      const res = await verifyPayment(ref);
      setPayment(res);

      if (res.status === 'PAID') {
        setBookingStatus('PENDING_VERIFICATION');
      } else {
        setBookingStatus('PENDING_PAYMENT');
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setError(err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  useEffect(() => {
    handleVerify();
  }, [ref]);

  const copyRefToClipboard = () => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">Verifying Transaction Status...</h2>
        <p className="text-xs text-slate-400">Connecting to Chapa payment processor.</p>
      </div>
    );
  }

  const isPaid = payment?.status === 'PAID';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top Banner Status */}
      <div className="glass-panel p-8 rounded-3xl text-center space-y-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700" />

        {isPaid ? (
          <div className="space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Payment Received & Verified
              </span>
              <h1 className="text-3xl font-black text-white">Booking Reserved Successfully</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Your payment has been successfully recorded. Your booking is now undergoing final admin document review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <CreditCard className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Awaiting Payment Completion
              </span>
              <h1 className="text-3xl font-black text-white">Complete Chapa Checkout</h1>
            </div>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Click below to complete or simulate the payment transaction with Chapa.
            </p>
          </div>
        )}

        {/* Transaction Reference Box */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="text-left space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Transaction Reference
            </div>
            <div className="text-xs font-mono font-bold text-blue-300">{ref}</div>
          </div>
          <button
            onClick={copyRefToClipboard}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Copy Reference"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Simulated Chapa Payment Action if not yet paid */}
        {!isPaid && (
          <div className="pt-2">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Simulate Successful Chapa Payment</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Booking Details Card */}
      {payment && (
        <div className="glass-card p-6 rounded-2xl space-y-4 border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Payment Summary</span>
            <Badge status={bookingStatus} />
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block">Payment Provider</span>
              <strong className="text-white capitalize">{payment.provider.replace(/_/g, ' ')}</strong>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">Total Amount Paid</span>
              <strong className="text-gradient text-sm">{formatCurrency(payment.amount)}</strong>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">Payment Status</span>
              <strong className={isPaid ? 'text-emerald-400' : 'text-amber-400'}>{payment.status}</strong>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">Date & Time</span>
              <strong className="text-white">{formatDate(payment.createdAt, true)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps Card */}
      <div className="glass-card p-6 rounded-2xl space-y-3 border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-blue-400" />
          What Happens Next?
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Our admin team verifies your submitted identification document against our fleet schedule.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Upon approval, your status changes to <strong className="text-emerald-400">CONFIRMED</strong> and vehicle pickup instructions are sent.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Pick up your vehicle at Bole Airport or your selected location at your specified pickup time!</span>
          </li>
        </ul>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          href="/booking/lookup"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors text-center"
        >
          Check Reservation Status
        </Link>

        <Link
          href="/cars"
          className="w-full sm:w-auto btn-gradient px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
        >
          <CarIcon className="w-4 h-4" />
          <span>Browse Fleet Catalog</span>
        </Link>
      </div>
    </div>
  );
}
