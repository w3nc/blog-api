// Request body validation with zod.
// Every error comes back as 400 { error, issues } so the front-ends can show
// a field-level message instead of a generic "something went wrong".

import { z } from 'zod';
import { HttpError } from '../lib/http-error.js';

// Validate and REPLACE req.body with the parsed result, so controllers only
// ever see clean data.
export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        field: i.path.join('.') || 'body',
        message: i.message,
      }));
      return next(new HttpError(400, issues[0]?.message || 'Invalid request body.', issues));
    }
    req.body = result.data;
    next();
  };
}

// Validate the :id path param as a positive integer.
export function validateIdParam(req, _res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new HttpError(400, 'The id in the URL must be a positive whole number.'));
  }
  req.params.id = String(id);
  next();
}

export const schemas = {
  login: z.object({
    username: z.string().trim().min(1, 'Username is required.').max(40),
    password: z.string().min(1, 'Password is required.').max(200),
  }),

  postCreate: z.object({
    title: z.string().trim().min(1, 'Title is required.').max(250, 'Title is too long (max 250).'),
    content: z.string().trim().min(1, 'Body is required.'),
    published: z.boolean().optional().default(false),
    tags: z.array(z.string().trim().min(1).max(24)).max(6, 'Up to 6 tags.').optional().default([]),
  }),

  postUpdate: z.object({
    title: z.string().trim().min(1, 'Title is required.').max(250, 'Title is too long (max 250).'),
    content: z.string().trim().min(1, 'Body is required.'),
    published: z.boolean().optional(),
    tags: z.array(z.string().trim().min(1).max(24)).max(6, 'Up to 6 tags.').optional(),
  }),

  publishToggle: z.object({
    published: z.boolean().optional(),
  }),

  commentCreate: z.object({
    authorName: z.string().trim().min(1, 'Name is required.').max(60, 'Name is too long (max 60).'),
    content: z.string().trim().min(1, 'Comment is required.').max(2000, 'Comment is too long (max 2000 characters).'),
  }),

  commentUpdate: z.object({
    authorName: z.string().trim().min(1, 'Name is required.').max(60).optional(),
    content: z.string().trim().min(1, 'Comment is required.').max(2000).optional(),
  }),
};
