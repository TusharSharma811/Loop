import Router from 'express';
import { getToken } from '../controllers/calls.controller.ts';
import { protectRoutes } from '../middlewares/protectRoutes.ts';

const router = Router();

router.post('/get-token', protectRoutes, getToken);

export default router;
