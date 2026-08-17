'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCars } from '@/lib/api/cars';
import { createBooking } from '@/lib/api/bookings';
import { submitReceipt } from '@/lib/api/payments';
import { Booking } from '@/types/booking';
import { Car } from '@/types/car';
import { IdentificationType } from '@/types/booking';
import { bookingFormSchema, BookingFormValues } from '@/schemas/booking.schema';
import { formatCurrency, calculateRentalDays, calculateTotalPrice, getErrorMessage } from '@/lib/utils';
import {
  Car as CarIcon,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  X,
  Loader2,
  Lock,
} from 'lucide-react';

function BookingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedCarId = searchParams.get('carId') || '';
  const preselectedPickup = searchParams.get('pickupDate') || '';
  const preselectedReturn = searchParams.get('returnDate') || '';

  // Wizard Step Control (1: Trip, 2: Customer, 3: Document Upload, 4: Review)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Cars list for dropdown selection if not preselected
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Form State
  const defaultPickupDate = preselectedPickup
    ? formatInputDateTime(new Date(preselectedPickup))
    : formatInputDateTime(new Date(Date.now() + 86400000));

  const defaultReturnDate = preselectedReturn
    ? formatInputDateTime(new Date(preselectedReturn))
    : formatInputDateTime(new Date(Date.now() + 4 * 86400000));

  const [formData, setFormData] = useState<Partial<BookingFormValues>>({
    carId: preselectedCarId,
    pickupLocation: 'Bole International Airport, Addis Ababa',
    returnLocation: 'Bole International Airport, Addis Ababa',
    pickupDate: defaultPickupDate,
    returnDate: defaultReturnDate,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    identificationType: 'NATIONAL_ID',
    identificationNumber: '',
  });

  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Submission & Validation state
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [receiptFileToUpload, setReceiptFileToUpload] = useState<File | null>(null);
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  function formatInputDateTime(d: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Load available cars
  useEffect(() => {
    async function loadCars() {
      try {
        setLoadingCars(true);
        const data = await getCars();
        setAvailableCars(data);

        if (preselectedCarId) {
          const matched = data.find((c) => c.id === preselectedCarId);
          if (matched) setSelectedCar(matched);
        } else if (data.length > 0) {
          setSelectedCar(data[0]);
          setFormData((prev) => ({ ...prev, carId: data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load cars:', err);
      } finally {
        setLoadingCars(false);
      }
    }
    loadCars();
  }, [preselectedCarId]);

  const handleCarSelect = (carId: string) => {
    const matched = availableCars.find((c) => c.id === carId);
    if (matched) {
      setSelectedCar(matched);
      setFormData((prev) => ({ ...prev, carId: matched.id }));
    }
  };

  // Handle Drag & Drop File Upload
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStepErrors({ document: 'File size exceeds 5MB limit. Please choose a smaller image or PDF.' });
      return;
    }

    // Check mime type (images or pdf)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setStepErrors({ document: 'Only PNG, JPEG, or PDF files are accepted.' });
      return;
    }

    setStepErrors({});
    setIdDocumentFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  // Step Validation logic before proceeding
  const validateCurrentStep = (): boolean => {
    setStepErrors({});
    setServerError(null);

    if (currentStep === 1) {
      if (!formData.carId || !selectedCar) {
        setStepErrors({ carId: 'Please select a vehicle to rent' });
        return false;
      }
      const pickup = new Date(formData.pickupDate || '');
      const ret = new Date(formData.returnDate || '');

      if (isNaN(pickup.getTime()) || isNaN(ret.getTime())) {
        setStepErrors({ pickupDate: 'Valid pickup and return dates are required' });
        return false;
      }
      if (ret <= pickup) {
        setStepErrors({ returnDate: 'Return date must be after pickup date' });
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      const errors: Record<string, string> = {};
      if (!formData.customerName || formData.customerName.trim().length < 2) {
        errors.customerName = 'Full Name is required (at least 2 characters)';
      }
      if (!formData.customerPhone || formData.customerPhone.trim().length < 6) {
        errors.customerPhone = 'Valid phone number is required (min 6 digits)';
      }
      if (!formData.identificationNumber || formData.identificationNumber.trim().length < 1) {
        errors.identificationNumber = 'Identification / Document number is required';
      }
      if (Object.keys(errors).length > 0) {
        setStepErrors(errors);
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      // Document upload is recommended for speed verification
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Submission Handler
  const handleFinalSubmit = async () => {
    setServerError(null);

    // Validate entire Zod Schema
    const result = bookingFormSchema.safeParse(formData);
    if (!result.success) {
      const formatted: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) formatted[issue.path[0].toString()] = issue.message;
      });
      setStepErrors(formatted);
      return;
    }

    try {
      setSubmitting(true);

      // 1. Create Online Booking in Express Backend
      const booking = await createBooking({
        carId: formData.carId!,
        pickupLocation: formData.pickupLocation!,
        returnLocation: formData.returnLocation!,
        pickupDate: formData.pickupDate!,
        returnDate: formData.returnDate!,
        customerName: formData.customerName!,
        customerPhone: formData.customerPhone!,
        customerEmail: formData.customerEmail || undefined,
        identificationType: formData.identificationType as IdentificationType,
        identificationNumber: formData.identificationNumber!,
        identificationDocument: idDocumentFile,
      });

      // 2. Set created booking and show submission instructions for manual receipt upload
      setCreatedBooking(booking);
      // show a welcome toast and keep user on page to upload receipt
      setReceiptSuccess('Reservation created. Please upload your payment receipt below. You will be notified via email or SMS when admin verifies.');
    } catch (err: any) {
      console.error('Booking submission failed:', err);
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };


  // Receipt upload handlers (manual transfer flow)
  const onReceiptFileChange = (file: File | null) => {
    if (!file) return;
    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('Receipt file exceeds 5MB limit');
      return;
    }
    setReceiptError(null);
    setReceiptFileToUpload(file);
  };

  const handleSubmitReceipt = async () => {
    if (!createdBooking) return;
    if (!receiptFileToUpload) {
      setReceiptError('Please choose a receipt image or PDF to upload');
      return;
    }

    try {
      setReceiptSubmitting(true);
      setReceiptError(null);
      const res = await submitReceipt(createdBooking.id, receiptFileToUpload);
      setReceiptSuccess('Receipt submitted successfully. You will be notified via email or SMS once admin verifies.');
      // clear file after successful submit
      setReceiptFileToUpload(null);
      // show toast briefly then redirect to home
      setTimeout(() => {
        try {
          router.push('/');
        } catch (e) {
          console.error('Redirect failed', e);
        }
      }, 1500);
    } catch (err: any) {
      console.error('Receipt upload failed', err);
      setReceiptError(err.message || 'Receipt upload failed');
    } finally {
      setReceiptSubmitting(false);
    }
  };
  const rentalDays = calculateRentalDays(formData.pickupDate || '', formData.returnDate || '');
  const totalPrice = selectedCar
    ? calculateTotalPrice(selectedCar.pricePerDay, formData.pickupDate || '', formData.returnDate || '')
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">
          Online Reservation
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Complete Your <span className="text-gradient">Car Booking</span>
        </h1>
      </div>

      {/* Progress Step Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { step: 1, label: 'Trip & Vehicle' },
            { step: 2, label: 'Customer Details' },
            { step: 3, label: 'ID Upload' },
            { step: 4, label: 'Review & Pay' },
          ].map(({ step, label }) => {
            const isCompleted = currentStep > step;
            const isCurrent = currentStep === step;

            return (
              <div
                key={step}
                onClick={() => isCompleted && setCurrentStep(step)}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600/30 border border-blue-500/50 text-white font-bold'
                    : isCompleted
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold'
                    : 'bg-slate-900/40 text-slate-500 border border-slate-800'
                }`}
              >
                <div className="text-xs uppercase font-bold flex items-center justify-center gap-1.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span>0{step}</span>
                  )}
                  <span className="hidden sm:inline">{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Trip & Vehicle Selection */}
          {currentStep === 1 && (
            <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800 animate-in fade-in">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <CarIcon className="w-5 h-5 text-blue-400" />
                Step 1: Select Rental Vehicle & Dates
              </h2>

              {/* Car Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Select Vehicle</label>
                {loadingCars ? (
                  <div className="p-4 bg-slate-900/60 rounded-xl text-slate-400 text-xs animate-pulse">
                    Loading vehicle fleet...
                  </div>
                ) : (
                  <select
                    value={formData.carId}
                    onChange={(e) => handleCarSelect(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {availableCars.map((car) => (
                      <option key={car.id} value={car.id} className="bg-slate-900 text-white">
                        {car.brand} {car.model} — {formatCurrency(car.pricePerDay)} / day
                      </option>
                    ))}
                  </select>
                )}
                {stepErrors.carId && <p className="text-xs text-rose-400">{stepErrors.carId}</p>}
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Pickup Location
                  </label>
                  <select
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-medium"
                  >
                    <option value="Bole International Airport, Addis Ababa" className="bg-slate-900">
                      Bole Intl Airport (ADD)
                    </option>
                    <option value="Kazanchis Downtown Center, Addis Ababa" className="bg-slate-900">
                      Kazanchis Downtown
                    </option>
                    <option value="Stadium / Meskel Square, Addis Ababa" className="bg-slate-900">
                      Meskel Square Hub
                    </option>
                    <option value="Sarbet / Old Airport Area" className="bg-slate-900">
                      Sarbet / Old Airport Area
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Return Location
                  </label>
                  <select
                    value={formData.returnLocation}
                    onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-medium"
                  >
                    <option value="Bole International Airport, Addis Ababa" className="bg-slate-900">
                      Bole Intl Airport (ADD)
                    </option>
                    <option value="Kazanchis Downtown Center, Addis Ababa" className="bg-slate-900">
                      Kazanchis Downtown
                    </option>
                    <option value="Stadium / Meskel Square, Addis Ababa" className="bg-slate-900">
                      Meskel Square Hub
                    </option>
                    <option value="Sarbet / Old Airport Area" className="bg-slate-900">
                      Sarbet / Old Airport Area
                    </option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Pickup Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-medium"
                  />
                  {stepErrors.pickupDate && <p className="text-xs text-rose-400">{stepErrors.pickupDate}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Return Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-medium"
                  />
                  {stepErrors.returnDate && <p className="text-xs text-rose-400">{stepErrors.returnDate}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Customer Personal Details */}
          {currentStep === 2 && (
            <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800 animate-in fade-in">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="w-5 h-5 text-blue-400" />
                Step 2: Customer Personal Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" /> Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Abebe Kebede"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  />
                  {stepErrors.customerName && <p className="text-xs text-rose-400">{stepErrors.customerName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-400" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+251 911 22 33 44"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-medium"
                    />
                    {stepErrors.customerPhone && <p className="text-xs text-rose-400">{stepErrors.customerPhone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-medium"
                    />
                    {stepErrors.customerEmail && <p className="text-xs text-rose-400">{stepErrors.customerEmail}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Identification Type *</label>
                    <select
                      value={formData.identificationType}
                      onChange={(e) => setFormData({ ...formData, identificationType: e.target.value as IdentificationType })}
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-medium"
                    >
                      <option value="NATIONAL_ID" className="bg-slate-900">National ID</option>
                      <option value="FAYDA" className="bg-slate-900">Fayda ID</option>
                      <option value="PASSPORT" className="bg-slate-900">Passport</option>
                      <option value="DRIVERS_LICENSE" className="bg-slate-900">Driver's License</option>
                      <option value="OTHER" className="bg-slate-900">Other Document</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">ID / Document Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. ETH-99887766"
                      value={formData.identificationNumber}
                      onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm font-medium"
                    />
                    {stepErrors.identificationNumber && (
                      <p className="text-xs text-rose-400">{stepErrors.identificationNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Identification Document Upload */}
          {currentStep === 3 && (
            <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800 animate-in fade-in">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-5 h-5 text-blue-400" />
                Step 3: Upload Identification Document
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                To complete vehicle reservation, please upload a clear photo or copy of your selected document ({formData.identificationType}).
                Documents live in a private encrypted bucket and are accessed via short-lived signed URLs for admin verification.
              </p>

              {/* Drag & Drop Upload Zone */}
              <div className="space-y-3">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl p-8 text-center space-y-3 bg-slate-900/40 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    id="idDocument"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />

                  {idDocumentFile ? (
                    <div className="space-y-3">
                      {filePreviewUrl ? (
                        <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-slate-700">
                          <Image src={filePreviewUrl} alt="Preview" fill className="object-cover" />
                        </div>
                      ) : (
                        <FileText className="w-12 h-12 text-blue-400 mx-auto" />
                      )}
                      <div className="text-xs font-semibold text-white">{idDocumentFile.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {(idDocumentFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIdDocumentFile(null);
                          setFilePreviewUrl(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                      >
                        <X className="w-3.5 h-3.5" /> Remove File
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="idDocument" className="cursor-pointer space-y-2 block">
                      <UploadCloud className="w-12 h-12 text-blue-400 mx-auto animate-bounce" />
                      <div className="text-sm font-bold text-white">Click or drag & drop ID document</div>
                      <div className="text-xs text-slate-400">
                        Supports PNG, JPG, or PDF (Max size: 5MB)
                      </div>
                    </label>
                  )}
                </div>

                {stepErrors.document && <p className="text-xs text-rose-400">{stepErrors.document}</p>}
              </div>
            </div>
          )}

          {/* STEP 4: Review & Payment Confirmation */}
          {currentStep === 4 && (
            <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800 animate-in fade-in">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Step 4: Booking Review & Payment Setup
              </h2>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="font-bold text-white text-sm">Reservation Details</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>Customer: <strong className="text-white">{formData.customerName}</strong></div>
                    <div>Phone: <strong className="text-white">{formData.customerPhone}</strong></div>
                    <div>ID Type: <strong className="text-white">{formData.identificationType}</strong></div>
                    <div>ID #: <strong className="text-white">{formData.identificationNumber}</strong></div>
                    <div className="col-span-2">Pickup: <strong className="text-white">{formData.pickupLocation}</strong></div>
                    <div className="col-span-2">Dates: <strong className="text-white">{new Date(formData.pickupDate!).toLocaleString()} &rarr; {new Date(formData.returnDate!).toLocaleString()}</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 space-y-3">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    Payment Instructions
                  </div>
                  <p className="leading-relaxed text-xs text-slate-300">
                    After confirming the reservation, transfer the total amount to one of our accounts below and upload a screenshot of your payment on the next step. Admin will verify and confirm your booking via email or SMS.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                      <div className="text-[11px] text-slate-400">Telebir (Mobile Money)</div>
                      <div className="font-bold text-white mt-1">0963524178</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                      <div className="text-[11px] text-slate-400">CBE Bank (Account)</div>
                      <div className="font-bold text-white mt-1">78451278895623</div>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={`https://wa.me/251963524178?text=${encodeURIComponent('Hello, I would like to make a payment inquiry')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-gradient px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      <Phone className="w-4 h-4" /> Contact via WhatsApp
                    </a>

                    <button
                      type="button"
                      onClick={() => window.open('tel:+251963524178')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold"
                    >
                      <Phone className="w-4 h-4" /> Call/Make Payment
                    </button>
                  </div>
                </div>

                {serverError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between pt-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-gradient px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="btn-gradient px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Reservation...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Pay {formatCurrency(totalPrice)}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* If booking was just created, show manual payment instructions & receipt upload */}
        {createdBooking && (
          <div className="lg:col-span-2 mt-6">
            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
              <h3 className="text-sm font-bold text-white">Payment Instructions & Receipt Upload</h3>

              <p className="text-xs text-slate-300">
                Your reservation was created with ID <strong className="font-mono text-blue-300">{createdBooking.id}</strong>.
                Please transfer the total amount to one of our accounts below and upload the payment receipt screenshot here.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Telebir (Mobile Money)</div>
                  <div className="font-bold text-white mt-1">0963524178</div>
                    <div className="text-[11px] text-slate-400 mt-1">Account Holder: Ranzi Car Rental</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400">CBE Bank (Account)</div>
                  <div className="font-bold text-white mt-1">78451278895623</div>
                  <div className="text-[11px] text-slate-400 mt-1">Account Name: Ranzi Car Rental</div>
                </div>
              </div>

              <div className="pt-3">
                <label className="block text-xs text-slate-300 mb-2">Upload payment receipt (PNG, JPG or PDF — max 5MB)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => onReceiptFileChange(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs"
                />

                {receiptError && <p className="text-xs text-rose-400 mt-2">{receiptError}</p>}
                {receiptSuccess && <p className="text-xs text-emerald-400 mt-2">{receiptSuccess}</p>}

                <div className="pt-4">
                  <button
                    onClick={handleSubmitReceipt}
                    disabled={receiptSubmitting}
                    className="btn-gradient px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg disabled:opacity-50"
                  >
                    {receiptSubmitting ? 'Uploading...' : 'Submit Receipt & Notify Admin'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mt-3">After you upload the receipt, you will be notified via email or SMS when admin verifies the payment.</p>
              </div>
            </div>
          </div>
        )}

        {/* Right Col: Selected Car Summary Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6 border border-slate-800 sticky top-28 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
              Booking Price Breakdown
            </h3>

            {selectedCar ? (
              <div className="space-y-4">
                <div className="relative w-full h-36 bg-slate-900 rounded-xl overflow-hidden">
                  <Image
                    src={selectedCar.imageUrl || `https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80`}
                    alt={selectedCar.model}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <span className="text-[10px] font-bold uppercase text-blue-400">{selectedCar.brand}</span>
                    <div className="text-base font-extrabold text-white">{selectedCar.model}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Daily Price:</span>
                    <span className="text-white font-semibold">{formatCurrency(selectedCar.pricePerDay)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Rental Duration:</span>
                    <span className="text-white font-semibold">{rentalDays} {rentalDays === 1 ? 'Day' : 'Days'}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm font-bold text-white">
                    <span>Total Amount:</span>
                    <span className="text-gradient text-lg">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Please select a car in step 1.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingWizardPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading booking wizard...</div>}>
      <BookingWizardContent />
    </Suspense>
  );
}
