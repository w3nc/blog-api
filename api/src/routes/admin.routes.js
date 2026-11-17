// Author-only routes. Every single one passes through requireAuthor,
// which answers 401 without a token and 403 for a non-author account.

import { Router } from 'express';
import { asyncHandler } from '../lib/http-error.js';
import { validateBody, validateIdParam, schemas } from '../middleware/validate.js';

export function makeAdminRouter(postCtrl, commentCtrl, requireAuthor) {
  const router = Router();

  // Apply the guard to everything below this line.
  router.use(requireAuthor);

  // --- Posts ---------------------------------------------------------------
  router.get('/admin/posts', asyncHandler(postCtrl.listAll));
  router.post('/posts', validateBody(schemas.postCreate), asyncHandler(postCtrl.create));
  router.put('/posts/:id', validateIdParam, validateBody(schemas.postUpdate), asyncHandler(postCtrl.update));
  router.delete('/posts/:id', validateIdParam, asyncHandler(postCtrl.remove));
  router.patch(
    '/posts/:id/publish',
    validateIdParam,
    validateBody(schemas.publishToggle),
    asyncHandler(postCtrl.togglePublish)
  );

  // --- Comment moderation ---------------------------------------------------
  router.get('/admin/comments', asyncHandler(commentCtrl.listAll));
  router.put('/comments/:id', validateIdParam, validateBody(schemas.commentUpdate), asyncHandler(commentCtrl.update));
  router.delete('/comments/:id', validateIdParam, asyncHandler(commentCtrl.remove));

  return router;
}
