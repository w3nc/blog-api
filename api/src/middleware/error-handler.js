// Centralised error handling. Every thrown error ends up here, so the JSON
// shape is the same for every failure: { error, issues? }.

import { HttpError } from '../lib/http-error.js';

export function notFound(req, res, next) {
  next(new HttpError(404, `No route matches ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  // Prisma's "record not found" codes: P2025 (update/delete), P2003 (bad relation).
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'That record does not exist (any more).' });
  }
  // P2004 / unique constraint violations.
  if (err?.code === 'P2002') {
    return res.status(409).json({ error: `That ${err.meta?.target?.join(', ') || 'value'} is already taken.` });
  }

  // HttpError sets .status; controllers may also throw a plain Error with .status.
  const status = Number(err?.status) >= 400 && Number(err?.status) < 600 ? Number(err.status) : 500;
  const body = {
    error: status === 500 ? 'Something went wrong on our side.' : err.message,
  };
  if (err?.details) body.issues = err.details;

  if (status === 500) {
    // Log the real error for the server operator, but never leak it to the client.
    console.error('[api] unhandled error:', err);
  }

  res.status(status).json(body);
}
