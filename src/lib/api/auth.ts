import { apiRequest } from './client';
import { Admin, LoginInput } from '@/types/admin';

/** POST /auth/login — sets httpOnly access + refresh cookies, returns the admin. */
export async function login(input: LoginInput): Promise<Admin> {
  const res = await apiRequest<{ admin: Admin }>('/auth/login', {
    method: 'POST',
    json: input,
  });
  return res.admin;
}

/** POST /auth/logout — clears cookies and revokes the refresh token. */
export async function logout(): Promise<void> {
  await apiRequest<null>('/auth/logout', { method: 'POST' });
}

/** GET /auth/me — returns the current admin, or throws 401 if unauthenticated. */
export async function getMe(): Promise<Admin> {
  return apiRequest<Admin>('/auth/me', { method: 'GET' });
}

/** POST /auth/refresh — rotates the access token using the refresh cookie. */
export async function refreshSession(): Promise<void> {
  await apiRequest<null>('/auth/refresh', { method: 'POST' });
}
