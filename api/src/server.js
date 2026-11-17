// Entry point: load .env, check config, start listening.

import 'dotenv/config';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { prisma } from './lib/prisma.js';

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(`[api] config error: ${err.message}`);
  process.exit(1);
}

const app = createApp(config);

const server = app.listen(config.port, () => {
  console.log(`[api] Blog API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  console.log(`[api] CORS allowed origins: ${config.corsOrigins.join(', ')}`);
});

// Close the DB pool and the listener on Ctrl+C / a PaaS restart signal.
const shutdown = async (signal) => {
  console.log(`[api] ${signal} received, shutting down...`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Never let an unhandled rejection kill the API silently.
process.on('unhandledRejection', (reason) => {
  console.error('[api] unhandled rejection:', reason);
});
