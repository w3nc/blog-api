// Public routes: no token needed.

import { Router } from 'express';
import { asyncHandler } from '../lib/http-error.js';
import { validateBody, validateIdParam, schemas } from '../middleware/validate.js';

export function makePublicRouter(postCtrl, commentCtrl) {
  const router = Router();

  // GET /posts  -> published posts only (the reader home feed)
  router.get('/posts', asyncHandler(postCtrl.listPublished));

  // GET /posts/:id -> one published post
  router.get('/posts/:id', validateIdParam, asyncHandler(postCtrl.getPublished));

  // GET /posts/:id/comments -> comments on a published post
  router.get('/posts/:id/comments', validateIdParam, asyncHandler(commentCtrl.listForPost));

  // POST /posts/:id/comments -> anyone may comment (name + text only)
  router.post(
    '/posts/:id/comments',
    validateIdParam,
    validateBody(schemas.commentCreate),
    asyncHandler(commentCtrl.createForPost)
  );

  return router;
}
