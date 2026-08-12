import { ApiResponse, ApiErrorResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'headers' | 'body'> {
  headers?: Record<string, string>;
  body?: BodyInit;
  json?: any;
  form?: FormData;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  let body: BodyInit | undefined = options.body || undefined;

  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  } else if (options.form !== undefined) {
    // FormData handles content-type and boundary automatically
    body = options.form;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
      credentials: 'include', // for httpOnly cookies if needed
    });

    const contentType = response.headers.get('content-type') || '';
    let payload: any;

    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        payload?.message || payload?.error || `Request failed with status ${response.status}`;
      const details = payload?.details;
      throw new ApiError(errorMessage, response.status, details);
    }

    // Backend wraps data in { success: true, data: T, message?: string }
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data as T;
    }

    return payload as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or fetch crash
    throw new ApiError(
      error.message || 'Unable to connect to the rental server. Please verify backend service is running.',
      0
    );
  }
}
