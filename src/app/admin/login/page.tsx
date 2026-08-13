'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Lock, Mail, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Field, TextInput, Banner, Spinner } from '@/components/admin/ui';
import { getErrorMessage } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already authenticated → skip the form and go straight to the dashboard.
  useEffect(() => {
    if (!loading && admin) router.replace('/admin');
  }, [loading, admin, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/admin');
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  // Brief hold while we confirm whether a session already exists.
  if (loading || admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Spinner className="h-8 w-8 text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-12">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-white/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="glass-panel rounded-3xl border border-slate-700/60 p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-400 shadow-lg shadow-black/40">
              <Car className="h-7 w-7 text-neutral-950" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Admin Portal</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to manage the Lumen fleet</p>
          </div>

          {error && (
            <Banner type="error" className="mb-5" onClose={() => setError(null)}>
              {error}
            </Banner>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Email address" htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <TextInput
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumen.com"
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <TextInput
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </Field>

            <Button type="submit" loading={submitting} icon={<LogIn className="h-4 w-4" />} className="w-full">
              Sign In
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Authorized personnel only. All actions are recorded.
        </p>
      </div>
    </div>
  );
}
