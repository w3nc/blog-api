// Small helper for talking to the Blog API.
// The base address comes from VITE_API_URL (see .env.example).

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Sends a request and returns the parsed JSON.
// If the API answers with an error, it throws an Error that carries the
// status code (err.status) and the API's message (err.message).
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export function apiGet(path) {
  return request(path);
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}
