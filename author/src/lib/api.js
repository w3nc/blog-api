// Talks to the Blog API. Adds the "Authorization: Bearer <token>" header
// when a token is saved in localStorage (done at login, see auth.js).

import { getToken, clearSession } from './auth.js';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Sends a request, returns parsed JSON (or null for 204 "no content").
// Throws an Error with err.status and a readable message on failure.
export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // A bad or expired token: forget it so the app shows the login screen again.
  if (res.status === 401 && token) {
    clearSession();
    window.dispatchEvent(new Event('session-expired'));
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.issues = data.issues || [];
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
