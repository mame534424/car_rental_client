'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/admin/ui';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/cars', label: 'Fleet', icon: Car, exact: false },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck, exact: false },
];

function isActive(pathname: string | null, href: string, exact: boolean) {
  if (!pathname) return false;
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Guard: bounce unauthenticated visitors to the login page.
  useEffect(() => {
    if (!loading && !admin) router.replace('/admin/login');
  }, [loading, admin, router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace('/admin/login');
    }
  };

  // While the session resolves — or while redirecting an anonymous visitor —
  // hold on a neutral splash rather than flashing the protected shell.
  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Spinner className="h-8 w-8 text-neutral-300" />
      </div>
    );
  }

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
              active
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const Brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/30">
        <Car className="h-5 w-5 text-white" />
      </div>
      <div className="leading-tight">
        <span className="block text-sm font-bold text-white">Ranzi Admin</span>
        <span className="block text-[10px] uppercase tracking-wider text-slate-500">Fleet Console</span>
      </div>
    </Link>
  );

  const UserFooter = (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3.5 py-3">
        <p className="truncate text-sm font-semibold text-white">{admin.name}</p>
        <p className="truncate text-xs text-slate-500">{admin.email}</p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-white"
      >
        <ExternalLink className="h-4 w-4" /> View public site
      </Link>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-60"
      >
        {loggingOut ? <Spinner className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
        Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800 bg-[#111111] px-4 py-6 lg:flex">
        <div className="px-1.5">{Brand}</div>
        <div className="mt-8 flex-1">
          <NavItems />
        </div>
        {UserFooter}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-[#111111]/95 px-4 py-3 backdrop-blur lg:hidden">
        {Brand}
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-slate-700/60 bg-slate-800/80 p-2.5 text-slate-300 hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-slate-800 bg-[#111111] px-4 py-6">
            <div className="flex items-center justify-between px-1.5">
              {Brand}
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 flex-1">
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </div>
            {UserFooter}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
