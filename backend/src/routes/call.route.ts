import Router from 'express';
import { getToken } from '../controllers/calls.controller.js';
import { protectRoutes } from '../middlewares/protectRoutes.js';

const router = Router();

router.get('/get-token', protectRoutes, getToken);

export default router;
