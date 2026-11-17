// Central place for every environment value the app reads.
// Throwing early is better than failing later with a cryptic error.

const required = ['DATABASE_URL', 'JWT_SECRET'];

export function loadConfig() {
  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(
        `Missing ${key} in your .env file. Copy .env.example to .env and fill it in.`
      );
    }
  });

  const origins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    port: Number(process.env.PORT || 4000),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigins: origins,
    seedAuthorPassword: process.env.SEED_AUTHOR_PASSWORD || 'maria1234',
  };
}
