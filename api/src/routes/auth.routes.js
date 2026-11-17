// Auth routes: log in and (optionally) ask "who am I?".

import { Router } from 'express';
import { asyncHandler, HttpError } from '../lib/http-error.js';
import { validateBody, schemas } from '../middleware/validate.js';

export function makeAuthRouter(authCtrl, requireAuth) {
  const router = Router();

  // POST /auth/login -> { token, user }
  router.post('/auth/login', validateBody(schemas.login), asyncHandler(authCtrl.login));

  // GET /auth/me -> the logged-in user, useful after a page refresh
  router.get('/auth/me', asyncHandler(requireAuth), asyncHandler(authCtrl.me));

  return router;
}
