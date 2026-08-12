'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  X,
  Ban,
  CheckCheck,
  MapPin,
  CalendarDays,
  User,
  Phone,
  Mail,
  IdCard,
  FileText,
  ExternalLink,
  CreditCard,
} from 'lucide-react';
import {
  getAdminBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} from '@/lib/api/admin/bookings';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/common/Badge';
import { CarImage } from '@/components/cars/CarImage';
import {
  Button,
  Field,
  TextArea,
  Modal,
  ConfirmDialog,
  Banner,
  Spinner,
  PageHeader,
} from '@/components/admin/ui';
import { formatCurrency, formatDate, getErrorMessage } from '@/lib/utils';

const ID_LABELS: Record<string, string> = {
  FAYDA: 'Fayda',
  NATIONAL_ID: 'National ID',
  PASSPORT: 'Passport',
  DRIVERS_LICENSE: "Driver's License",
  OTHER: 'Other',
};

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-100">{value}</p>
      </div>
    </div>
  );
}

export default function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [docBroken, setDocBroken] = useState(false);

  const [confirmKind, setConfirmKind] = useState<'approve' | 'complete' | 'cancel' | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchBooking = useCallback(
    async (initial = false) => {
      if (initial) setLoading(true);
      try {
        const b = await getAdminBooking(id);
        setBooking(b);
        setDocBroken(false);
        if (initial) setError(null);
      } catch (err) {
        if (initial) setError(getErrorMessage(err));
        else setActionError(getErrorMessage(err));
      } finally {
        if (initial) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchBooking(true);
  }, [fetchBooking]);

  const runAction = async (kind: string, fn: () => Promise<unknown>, successMsg: string) => {
    setBusy(kind);
    setActionError(null);
    setNotice(null);
    try {
      await fn();
      await fetchBooking(false);
      setNotice(successMsg);
      setConfirmKind(null);
      setShowReject(false);
      setRejectReason('');
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Back to bookings
        </Link>
        <Banner type="error">{error ?? 'Booking not found.'}</Banner>
      </div>
    );
  }

  const s = booking.bookingStatus;
  const canApprove = s === 'PENDING_VERIFICATION';
  const canReject = s === 'PENDING_VERIFICATION' || s === 'PENDING_PAYMENT';
  const canCancel = !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(s);
  const canComplete = s === 'CONFIRMED';
  const hasActions = canApprove || canReject || canCancel || canComplete;

  const car = booking.car;
  const customer = booking.customer;

  return (
    <div className="space-y-6">
      <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <PageHeader
        title={customer?.name ?? 'Booking'}
        subtitle={`Reference · ${booking.id}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge status={booking.bookingStatus} />
        <Badge status={booking.paymentStatus} />
        <span className="rounded-full border border-slate-700 bg-slate-900/40 px-2.5 py-0.5 text-xs font-medium text-slate-400">
          {booking.source === 'MANUAL' ? 'Walk-in' : 'Online'}
        </span>
      </div>

      {notice && (
        <Banner type="success" onClose={() => setNotice(null)}>
          {notice}
        </Banner>
      )}
      {actionError && (
        <Banner type="error" onClose={() => setActionError(null)}>
          {actionError}
        </Banner>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Vehicle */}
          <section className="glass-card overflow-hidden rounded-2xl">
            <div className="flex flex-col gap-4 p-5 sm:flex-row">
              <CarImage
                src={car?.imageUrl}
                alt={car ? `${car.brand} ${car.model}` : 'Vehicle'}
                label={car ? `${car.brand} ${car.model}` : 'Vehicle'}
                seedKey={car?.id}
                className="h-32 w-full shrink-0 rounded-xl sm:w-48"
                sizes="200px"
              />
              <div className="flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400">{car?.brand}</p>
                <h2 className="text-xl font-bold text-white">{car?.model ?? 'Vehicle'}</h2>
                {car && (
                  <p className="mt-1 text-sm text-slate-400">
                    {formatCurrency(car.pricePerDay)} <span className="text-slate-500">/ day</span>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Trip */}
          <section className="glass-card space-y-5 rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Trip Details</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Pickup" value={formatDate(booking.pickupDate, true)} />
              <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Return" value={formatDate(booking.returnDate, true)} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Pickup location" value={booking.pickupLocation} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Return location" value={booking.returnLocation} />
            </div>
          </section>

          {/* Customer */}
          <section className="glass-card space-y-5 rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Customer</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={customer?.name ?? '—'} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={customer?.phone ?? '—'} />
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={customer?.email || '—'} />
              <InfoRow
                icon={<IdCard className="h-4 w-4" />}
                label="Identification"
                value={
                  customer
                    ? `${ID_LABELS[customer.identificationType] ?? customer.identificationType} · ${customer.identificationNumber}`
                    : '—'
                }
              />
            </div>

            {/* ID document */}
            <div className="border-t border-slate-800 pt-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileText className="h-4 w-4" /> ID Document
              </p>
              {booking.documentSignedUrl ? (
                <div className="space-y-3">
                  {!docBroken && (
                    // Plain <img>: the signed URL is short-lived and may not be an image;
                    // fall back gracefully to the open-in-new-tab link on any load error.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booking.documentSignedUrl}
                      alt="Customer identification document"
                      onError={() => setDocBroken(true)}
                      className="max-h-96 w-auto rounded-xl border border-slate-700"
                    />
                  )}
                  <a
                    href={booking.documentSignedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500/50 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" /> Open document in new tab
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No identification document on file for this booking.</p>
              )}
            </div>
          </section>

          {/* Payments */}
          {booking.payments && booking.payments.length > 0 && (
            <section className="glass-card space-y-4 rounded-2xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Payments</h3>
              <div className="space-y-2.5">
                {booking.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3"
                  >
                    <CreditCard className="h-4 w-4 shrink-0 text-slate-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {formatCurrency(p.amount)} · {p.provider}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {p.transactionReference} · {formatDate(p.createdAt, true)}
                      </p>
                    </div>
                    <Badge status={p.status} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Booked</span>
                <span className="text-slate-200">{formatDate(booking.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="text-slate-400">Total</span>
                <span className="text-2xl font-black text-white">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Actions</h3>
            {hasActions ? (
              <div className="mt-4 space-y-2.5">
                {canApprove && (
                  <Button
                    className="w-full"
                    icon={<Check className="h-4 w-4" />}
                    loading={busy === 'approve'}
                    onClick={() => setConfirmKind('approve')}
                  >
                    Approve booking
                  </Button>
                )}
                {canComplete && (
                  <Button
                    className="w-full"
                    icon={<CheckCheck className="h-4 w-4" />}
                    loading={busy === 'complete'}
                    onClick={() => setConfirmKind('complete')}
                  >
                    Mark as completed
                  </Button>
                )}
                {canReject && (
                  <Button
                    variant="danger"
                    className="w-full"
                    icon={<X className="h-4 w-4" />}
                    loading={busy === 'reject'}
                    onClick={() => setShowReject(true)}
                  >
                    Reject booking
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    icon={<Ban className="h-4 w-4" />}
                    loading={busy === 'cancel'}
                    onClick={() => setConfirmKind('cancel')}
                  >
                    Cancel booking
                  </Button>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                This booking is {booking.bookingStatus.replace(/_/g, ' ').toLowerCase()} — no further actions are
                available.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Approve / Complete / Cancel confirmations */}
      <ConfirmDialog
        open={confirmKind === 'approve'}
        title="Approve booking"
        confirmLabel="Approve"
        loading={busy === 'approve'}
        onCancel={() => setConfirmKind(null)}
        onConfirm={() => runAction('approve', () => approveBooking(booking.id), 'Booking approved and confirmed.')}
        message="Confirm this reservation? The customer will be notified their booking is confirmed."
      />
      <ConfirmDialog
        open={confirmKind === 'complete'}
        title="Complete booking"
        confirmLabel="Mark completed"
        loading={busy === 'complete'}
        onCancel={() => setConfirmKind(null)}
        onConfirm={() => runAction('complete', () => completeBooking(booking.id), 'Booking marked as completed.')}
        message="Mark this rental as completed? Do this once the vehicle has been returned."
      />
      <ConfirmDialog
        open={confirmKind === 'cancel'}
        title="Cancel booking"
        danger
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        loading={busy === 'cancel'}
        onCancel={() => setConfirmKind(null)}
        onConfirm={() => runAction('cancel', () => cancelBooking(booking.id), 'Booking cancelled.')}
        message="Cancel this booking? This frees up the vehicle for the selected dates."
      />

      {/* Reject with reason */}
      <Modal
        open={showReject}
        onClose={() => busy !== 'reject' && setShowReject(false)}
        title="Reject booking"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowReject(false)} disabled={busy === 'reject'}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={busy === 'reject'}
              onClick={() =>
                runAction('reject', () => rejectBooking(booking.id, rejectReason.trim()), 'Booking rejected.')
              }
            >
              Reject
            </Button>
          </>
        }
      >
        <Field label="Reason" htmlFor="reason" hint="Optional — shared with the customer to explain the rejection.">
          <TextArea
            id="reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. The uploaded ID was not legible."
          />
        </Field>
      </Modal>
    </div>
  );
}
