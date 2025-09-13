import type { Response } from 'express';

export const ok = <T>(res: Response, data: T) => res.status(200).json(data);
export const created = <T>(res: Response, data: T) => res.status(201).json(data);
export const badRequest = (res: Response, message = 'Bad Request') => res.status(400).json({ error: message });
export const unauthorized = (res: Response, message = 'Unauthorized') => res.status(401).json({ error: message });
export const notFound = (res: Response, message = 'Not Found') => res.status(404).json({ error: message });
export const serverError = (res: Response, message = 'Internal server error') => res.status(500).json({ error: message });

export default { ok, created, badRequest, unauthorized, notFound, serverError };