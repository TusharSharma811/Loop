import dotenv from 'dotenv';
dotenv.config();

const toInt = (val: string | undefined, fallback: number): number => {
  const n = Number(val);
  return Number.isFinite(n) && !Number.isNaN(n) ? n : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  jwtSecret: process.env.JWT_SECRET || '',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',

  redis: {
    host: process.env.REDIS_URL || '127.0.0.1',
    // default to 17312 to preserve previous behavior
    port: toInt(process.env.REDIS_PORT, 17312),
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
  },
};

if (!config.jwtSecret || !config.refreshTokenSecret) {
  // Do not throw here to keep runtime behavior; just warn in dev
  // eslint-disable-next-line no-console
  console.warn('JWT secrets are not set; using empty strings.');
}

export default config;