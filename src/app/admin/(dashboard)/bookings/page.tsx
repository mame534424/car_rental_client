'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, CalendarCheck, ArrowRight, User, Phone } from 'lucide-react';
import { adminListBookings, createManualBooking } from '@/lib/api/admin/bookings';
import { adminListCars } from '@/lib/api/admin/cars';
import { Booking, BookingStatus, IdentificationType } from '@/types/booking';
import { Car } from '@/types/car';
import { ManualBookingInput, ManualPaymentStatus } from '@/types/admin';
import { ApiError } from '@/lib/api/client';
import { Badge } from '@/components/common/Badge';
import {
  Button,
  Field,
  TextInput,
  SelectInput,
  Modal,
  Banner,
  Spinner,
  EmptyState,
  PageHeader,
} from '@/components/admin/ui';
import { formatCurrency, formatDate, getErrorMessage } from '@/lib/utils';

const STATUS_FILTERS: { value: BookingStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING_VERIFICATION', label: 'Needs Approval' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' },
];

const ID_TYPES: { value: IdentificationType; label: string }[] = [
  { value: 'FAYDA', label: 'Fayda' },
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'OTHER', label: 'Other' },
];

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <Link
      href={`/admin/bookings/${booking.id}`}
      className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-blue-500/40 hover:bg-slate-900/70 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <p className="truncate font-semibold text-white">{booking.customer?.name ?? 'Customer'}</p>
          {booking.source === 'MANUAL' && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Walk-in
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Vehicle'} ·{' '}
          {formatDate(booking.pickupDate)} → {formatDate(booking.returnDate)}
        </p>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
        <span className="font-black text-white">{formatCurrency(booking.totalAmount)}</span>
        <div className="flex items-center gap-2">
          <Badge status={booking.bookingStatus} />
        </div>
      </div>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-600 sm:block" />
    </Link>
  );
}

/* --------------------------- Manual booking form -------------------------- */

interface ManualFormState {
  carId: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  paymentStatus: ManualPaymentStatus;
}

const EMPTY_MANUAL: ManualFormState = {
  carId: '',
  pickupLocation: '',
  returnLocation: '',
  pickupDate: '',
  returnDate: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  identificationType: 'FAYDA',
  identificationNumber: '',
  paymentStatus: 'PAID',
};

function ManualBookingModal({
  open,
  cars,
  onClose,
  onCreated,
}: {
  open: boolean;
  cars: Car[];
  onClose: () => void;
  onCreated: (b: Booking) => void;
}) {
  const [form, setForm] = useState<ManualFormState>(EMPTY_MANUAL);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY_MANUAL);
      setFormError(null);
      setFieldErrors({});
    }
  }, [open]);

  const update = (patch: Partial<ManualFormState>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!form.carId) {
      setFormError('Please select a vehicle.');
      return;
    }
    if (new Date(form.returnDate).getTime() <= new Date(form.pickupDate).getTime()) {
      setFieldErrors({ returnDate: ['Return date must be after the pickup date.'] });
      return;
    }

    const payload: ManualBookingInput = {
      carId: form.carId,
      pickupLocation: form.pickupLocation.trim(),
      returnLocation: form.returnLocation.trim(),
      pickupDate: form.pickupDate,
      returnDate: form.returnDate,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim() || undefined,
      identificationType: form.identificationType,
      identificationNumber: form.identificationNumber.trim(),
      paymentStatus: form.paymentStatus,
    };

    setSubmitting(true);
    try {
      const booking = await createManualBooking(payload);
      onCreated(booking);
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setFieldErrors(err.details);
        setFormError(err.message);
      } else {
        setFormError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !submitting && onClose()}
      title="New Walk-in Booking"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button form="manual-form" type="submit" loading={submitting}>
            Create Booking
          </Button>
        </>
      }
    >
      <form id="manual-form" onSubmit={submit} className="space-y-5">
        {formError && <Banner type="error">{formError}</Banner>}

        <Field label="Vehicle" htmlFor="carId" required error={fieldErrors.carId?.[0]}>
          <SelectInput
            id="carId"
            value={form.carId}
            onChange={(e) => update({ carId: e.target.value })}
            required
          >
            <option value="" disabled>
              Select a vehicle…
            </option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.brand} {c.model} — {formatCurrency(c.pricePerDay)}/day
                {c.status !== 'AVAILABLE' ? ` (${c.status})` : ''}
              </option>
            ))}
          </SelectInput>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pickup location" htmlFor="pickupLocation" required error={fieldErrors.pickupLocation?.[0]}>
            <TextInput
              id="pickupLocation"
              value={form.pickupLocation}
              onChange={(e) => update({ pickupLocation: e.target.value })}
              placeholder="Bole Airport"
              required
            />
          </Field>
          <Field label="Return location" htmlFor="returnLocation" required error={fieldErrors.returnLocation?.[0]}>
            <TextInput
              id="returnLocation"
              value={form.returnLocation}
              onChange={(e) => update({ returnLocation: e.target.value })}
              placeholder="Bole Airport"
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pickup date & time" htmlFor="pickupDate" required error={fieldErrors.pickupDate?.[0]}>
            <TextInput
              id="pickupDate"
              type="datetime-local"
              value={form.pickupDate}
              onChange={(e) => update({ pickupDate: e.target.value })}
              required
            />
          </Field>
          <Field label="Return date & time" htmlFor="returnDate" required error={fieldErrors.returnDate?.[0]}>
            <TextInput
              id="returnDate"
              type="datetime-local"
              value={form.returnDate}
              onChange={(e) => update({ returnDate: e.target.value })}
              required
            />
          </Field>
        </div>

        <div className="border-t border-slate-800 pt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Customer</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="customerName" required error={fieldErrors.customerName?.[0]}>
              <TextInput
                id="customerName"
                value={form.customerName}
                onChange={(e) => update({ customerName: e.target.value })}
                placeholder="Abebe Bekele"
                required
              />
            </Field>
            <Field label="Phone" htmlFor="customerPhone" required error={fieldErrors.customerPhone?.[0]}>
              <TextInput
                id="customerPhone"
                value={form.customerPhone}
                onChange={(e) => update({ customerPhone: e.target.value })}
                placeholder="+251 911 000000"
                required
              />
            </Field>
            <Field label="Email" htmlFor="customerEmail" error={fieldErrors.customerEmail?.[0]} hint="Optional">
              <TextInput
                id="customerEmail"
                type="email"
                value={form.customerEmail}
                onChange={(e) => update({ customerEmail: e.target.value })}
                placeholder="name@email.com"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ID type" htmlFor="idType" error={fieldErrors.identificationType?.[0]}>
                <SelectInput
                  id="idType"
                  value={form.identificationType}
                  onChange={(e) => update({ identificationType: e.target.value as IdentificationType })}
                >
                  {ID_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="ID number" htmlFor="idNumber" required error={fieldErrors.identificationNumber?.[0]}>
                <TextInput
                  id="idNumber"
                  value={form.identificationNumber}
                  onChange={(e) => update({ identificationNumber: e.target.value })}
                  required
                />
              </Field>
            </div>
          </div>
        </div>

        <Field
          label="Payment status"
          htmlFor="paymentStatus"
          hint="Marking as Paid confirms the booking immediately. Pending leaves it awaiting payment."
        >
          <SelectInput
            id="paymentStatus"
            value={form.paymentStatus}
            onChange={(e) => update({ paymentStatus: e.target.value as ManualPaymentStatus })}
          >
            <option value="PAID">Paid — confirm now</option>
            <option value="PENDING">Pending payment</option>
          </SelectInput>
        </Field>
      </form>
    </Modal>
  );
}

/* --------------------------------- Page ---------------------------------- */

function BookingsInner() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as BookingStatus | null) ?? 'ALL';

  const [status, setStatus] = useState<BookingStatus | 'ALL'>(
    STATUS_FILTERS.some((f) => f.value === initialStatus) ? initialStatus : 'ALL'
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminListBookings(status === 'ALL' ? undefined : status);
      setBookings(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  // Cars for the walk-in select — loaded once, lazily.
  const loadCars = useCallback(async () => {
    try {
      setCars(await adminListCars());
    } catch {
      /* non-fatal: the select simply stays empty */
    }
  }, []);

  const openManual = () => {
    if (cars.length === 0) loadCars();
    setShowManual(true);
  };

  const availableCars = useMemo(
    () => cars.slice().sort((a, b) => Number(b.status === 'AVAILABLE') - Number(a.status === 'AVAILABLE')),
    [cars]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Review, approve and manage every reservation."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openManual}>
            Walk-in Booking
          </Button>
        }
      />

      {notice && (
        <Banner type="success" onClose={() => setNotice(null)}>
          {notice}
        </Banner>
      )}
      {error && (
        <Banner type="error" onClose={() => setError(null)}>
          {error}
        </Banner>
      )}

      {/* Filter pills */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ' +
              (status === f.value
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:text-white')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-blue-500" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-6 w-6" />}
          title="No bookings found"
          message={
            status === 'ALL'
              ? 'When customers reserve online or you add a walk-in, they will appear here.'
              : 'No bookings match this filter right now.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </div>
      )}

      <ManualBookingModal
        open={showManual}
        cars={availableCars}
        onClose={() => setShowManual(false)}
        onCreated={(b) => {
          setShowManual(false);
          setNotice(
            `Walk-in booking created for ${b.customer?.name ?? 'customer'} (${b.bookingStatus.replace(/_/g, ' ').toLowerCase()}).`
          );
          load();
        }}
      />
    </div>
  );
}

export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-blue-500" />
        </div>
      }
    >
      <BookingsInner />
    </Suspense>
  );
}
