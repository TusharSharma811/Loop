import { Router } from "express";
import { login, register, logout, refreshToken, googleLogin, googleLoginCallback, verify, me } from "../controllers/auth.controller.js";
import { protectRoutes } from "../middlewares/protectRoutes.js";
import prisma from "../lib/prismaClient.js";
const router = Router();

router.post("/login" , login);
router.post("/register" , register);
router.post("/logout" , logout);
router.post("/refresh-token" , refreshToken);
router.get("/google-login" , googleLogin);
router.get("/google-login/callback" , googleLoginCallback);
router.get("/verify", protectRoutes, verify);
router.get("/me", protectRoutes, me);
export default router;