'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Root layout for the entire /admin subtree. It scopes the AuthProvider here
 * (NOT globally) so public pages never trigger a /auth/me session check.
 * The public Header/Footer already return null on /admin, so this subtree
 * renders its own chrome via the nested (dashboard) layout.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
