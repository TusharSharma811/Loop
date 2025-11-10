import type { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger.js';

// Generic error handler to standardize server errors.
// Does not change existing controller behavior; only catches unhandled errors.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Unhandled error:', err);
  // Preserve existing generic message contract
  return res.status(500).json({ message: 'Internal server error' });
}

export default errorHandler;
