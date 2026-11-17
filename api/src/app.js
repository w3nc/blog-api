// Builds the Express app. Kept separate from server.js so tests (or a serverless
// wrapper later) can import the app without starting a listener.

import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma.js';
import { makeAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { makeAuthController } from './controllers/auth.controller.js';
import { makePostController } from './controllers/post.controller.js';
import { makeCommentController } from './controllers/comment.controller.js';
import { makePublicRouter } from './routes/public.routes.js';
import { makeAuthRouter } from './routes/auth.routes.js';
import { makeAdminRouter } from './routes/admin.routes.js';

export function createApp(config) {
  const app = express();

  // Behind a PaaS proxy (Render, Railway, Heroku) this makes req.protocol and
  // req.ip correct.
  app.set('trust proxy', 1);

  // --- CORS ---------------------------------------------------------------
  // The browser sends an OPTIONS "preflight" before any request that carries
  // an Authorization header, so both `allowedHeaders` and the OPTIONS handling
  // have to be right or the request never reaches Express.
  app.use(
    cors({
      origin(origin, callback) {
        // No origin = curl, Postman or a server-to-server call: always allow.
        if (!origin) return callback(null, true);
        if (config.corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
      maxAge: 86400, // cache the preflight answer for a day
    })
  );
  // Express 4 answers OPTIONS only if asked to; this makes every path preflight
  // correctly even when a router has no matching OPTIONS handler.
  app.options('*', cors());

  // --- Body parsing -------------------------------------------------------
  // 1mb is generous for a blog post; raise it if authors paste large HTML.
  app.use(express.json({ limit: '1mb' }));

  // --- Tiny request log in development -----------------------------------
  if (config.nodeEnv !== 'test') {
    app.use((req, _res, next) => {
      console.log(`${req.method} ${req.originalUrl}`);
      next();
    });
  }

  // --- Wiring -------------------------------------------------------------
  const { requireAuth, requireAuthor } = makeAuth(config, prisma);
  const authCtrl = makeAuthController(prisma, config);
  const postCtrl = makePostController(prisma);
  const commentCtrl = makeCommentController(prisma);

  // Health check first: useful for a PaaS uptime probe.
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // "/" -> a plain JSON hint. This API never returns HTML.
  app.get('/', (_req, res) => {
    res.json({
      name: 'Blog API',
      routes: {
        public: ['GET /posts', 'GET /posts/:id', 'GET /posts/:id/comments', 'POST /posts/:id/comments'],
        auth: ['POST /auth/login', 'GET /auth/me'],
        author: [
          'GET /admin/posts',
          'POST /posts',
          'PUT /posts/:id',
          'DELETE /posts/:id',
          'PATCH /posts/:id/publish',
          'GET /admin/comments',
          'PUT /comments/:id',
          'DELETE /comments/:id',
        ],
      },
    });
  });

  app.use(makePublicRouter(postCtrl, commentCtrl));
  app.use(makeAuthRouter(authCtrl, requireAuth));
  app.use(makeAdminRouter(postCtrl, commentCtrl, requireAuthor));

  // 404 then the error handler. Always last.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
