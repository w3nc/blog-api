// Small error type that carries the HTTP status we want to send.
//
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Wrap an async route handler so a rejected promise reaches Express's error
// middleware instead of hanging the request. Express 4 does not do this itself.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
