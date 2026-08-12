'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Car as CarIcon, Package } from 'lucide-react';
import { adminListCars, createCar, updateCar, deleteCar } from '@/lib/api/admin/cars';
import { Car, CarStatus } from '@/types/car';
import { CarInput } from '@/types/admin';
import { ApiError } from '@/lib/api/client';
import { Badge } from '@/components/common/Badge';
import { CarImage } from '@/components/cars/CarImage';
import {
  Button,
  Field,
  TextInput,
  TextArea,
  SelectInput,
  Modal,
  ConfirmDialog,
  Banner,
  Spinner,
  EmptyState,
  PageHeader,
} from '@/components/admin/ui';
import { formatCurrency, getErrorMessage } from '@/lib/utils';

const STATUS_OPTIONS: { value: CarStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'MAINTENANCE', label: 'In Maintenance' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
];

interface FormState {
  brand: string;
  model: string;
  description: string;
  imageUrl: string;
  quantity: string;
  pricePerDay: string;
  status: CarStatus;
}

const EMPTY_FORM: FormState = {
  brand: '',
  model: '',
  description: '',
  imageUrl: '',
  quantity: '1',
  pricePerDay: '',
  status: 'AVAILABLE',
};

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // form / modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // delete
  const [deleting, setDeleting] = useState<Car | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCars(await adminListCars());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFieldErrors({});
    setShowForm(true);
  };

  const openEdit = (car: Car) => {
    setEditing(car);
    setForm({
      brand: car.brand,
      model: car.model,
      description: car.description ?? '',
      imageUrl: car.imageUrl ?? '',
      quantity: String(car.quantity),
      pricePerDay: String(car.pricePerDay),
      status: car.status,
    });
    setFormError(null);
    setFieldErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setShowForm(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const quantity = Number(form.quantity);
    const pricePerDay = Number(form.pricePerDay);

    if (!form.brand.trim() || !form.model.trim()) {
      setFormError('Brand and model are required.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      setFieldErrors({ quantity: ['Quantity must be a whole number of at least 1.'] });
      return;
    }
    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      setFieldErrors({ pricePerDay: ['Price per day must be greater than 0.'] });
      return;
    }

    const payload: CarInput = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim(),
      quantity,
      pricePerDay,
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (editing) {
        await updateCar(editing.id, payload);
        setNotice(`Updated ${payload.brand} ${payload.model}.`);
      } else {
        await createCar(payload);
        setNotice(`Added ${payload.brand} ${payload.model} to the fleet.`);
      }
      setShowForm(false);
      await load();
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

  const doDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteCar(deleting.id);
      setNotice(`Removed ${deleting.brand} ${deleting.model}.`);
      setDeleting(null);
      await load();
    } catch (err) {
      // 409 = car has active bookings; surface the guidance instead of failing silently.
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Management"
        subtitle={`${cars.length} ${cars.length === 1 ? 'vehicle' : 'vehicles'} in the catalogue`}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add Vehicle
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

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-blue-500" />
        </div>
      ) : cars.length === 0 ? (
        <EmptyState
          icon={<CarIcon className="h-6 w-6" />}
          title="No vehicles yet"
          message="Add your first vehicle to start accepting bookings."
          action={
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Add Vehicle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <div key={car.id} className="glass-card overflow-hidden rounded-2xl">
              <div className="relative">
                <CarImage
                  src={car.imageUrl}
                  alt={`${car.brand} ${car.model}`}
                  label={`${car.brand} ${car.model}`}
                  seedKey={car.id}
                  className="h-44 w-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="absolute left-3 top-3">
                  <Badge status={car.status} />
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-400">{car.brand}</p>
                  <h3 className="truncate text-lg font-bold text-white">{car.model}</h3>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-black text-white">
                    {formatCurrency(car.pricePerDay)}
                    <span className="text-xs font-normal text-slate-500"> / day</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Package className="h-3.5 w-3.5" />
                    {car.quantity} {car.quantity === 1 ? 'unit' : 'units'}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    className="flex-1 py-2"
                    icon={<Pencil className="h-3.5 w-3.5" />}
                    onClick={() => openEdit(car)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-3 py-2 text-rose-400 hover:bg-rose-500/10"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => {
                      setDeleteError(null);
                      setDeleting(car);
                    }}
                    aria-label={`Delete ${car.brand} ${car.model}`}
                  >
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button form="car-form" type="submit" loading={submitting}>
              {editing ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </>
        }
      >
        <form id="car-form" onSubmit={submit} className="space-y-5">
          {formError && <Banner type="error">{formError}</Banner>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Brand" htmlFor="brand" required error={fieldErrors.brand?.[0]}>
              <TextInput
                id="brand"
                value={form.brand}
                onChange={(e) => update({ brand: e.target.value })}
                placeholder="Toyota"
                required
              />
            </Field>
            <Field label="Model" htmlFor="model" required error={fieldErrors.model?.[0]}>
              <TextInput
                id="model"
                value={form.model}
                onChange={(e) => update({ model: e.target.value })}
                placeholder="Land Cruiser V8"
                required
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="description" error={fieldErrors.description?.[0]} hint="Optional — shown to customers on the car detail page.">
            <TextArea
              id="description"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Comfortable 7-seat SUV, ideal for highway trips and rough terrain."
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field
              label="Image URL"
              htmlFor="imageUrl"
              error={fieldErrors.imageUrl?.[0]}
              hint="Paste any public image link. Leave blank to use a default."
            >
              <TextInput
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(e) => update({ imageUrl: e.target.value })}
                placeholder="https://…/car.jpg"
              />
            </Field>
            <Field label="Live preview">
              <CarImage
                src={form.imageUrl}
                alt="Image preview"
                label={`${form.brand} ${form.model}`.trim() || 'Vehicle'}
                seedKey={`${form.brand} ${form.model}`}
                className="h-32 w-full rounded-xl border border-slate-700"
                sizes="400px"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Quantity" htmlFor="quantity" required error={fieldErrors.quantity?.[0]}>
              <TextInput
                id="quantity"
                type="number"
                min={1}
                step={1}
                value={form.quantity}
                onChange={(e) => update({ quantity: e.target.value })}
                required
              />
            </Field>
            <Field label="Price / day (ETB)" htmlFor="pricePerDay" required error={fieldErrors.pricePerDay?.[0]}>
              <TextInput
                id="pricePerDay"
                type="number"
                min={1}
                step="0.01"
                value={form.pricePerDay}
                onChange={(e) => update({ pricePerDay: e.target.value })}
                placeholder="4500"
                required
              />
            </Field>
            <Field label="Status" htmlFor="status" error={fieldErrors.status?.[0]}>
              <SelectInput
                id="status"
                value={form.status}
                onChange={(e) => update({ status: e.target.value as CarStatus })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Remove vehicle"
        danger
        confirmLabel="Delete"
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) setDeleting(null);
        }}
        onConfirm={doDelete}
        message={
          <div className="space-y-3">
            <p>
              Delete <span className="font-semibold text-white">{deleting?.brand} {deleting?.model}</span> from the
              fleet? This cannot be undone.
            </p>
            {deleteError && <Banner type="error">{deleteError}</Banner>}
          </div>
        }
      />
    </div>
  );
}
