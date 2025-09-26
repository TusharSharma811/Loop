import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { protectRoutes } from "../middlewares/protectRoutes.js";

const router = Router();

router.post("/login" , authController.login);
router.post("/register" , authController.register);
router.post("/logout" , authController.logout);
router.post("/refresh-token" , authController.refreshToken);
router.get("/google-login" , authController.googleLogin);
router.get("/google-login/callback" , authController.googleLoginCallback);
router.get("/verify", protectRoutes, authController.verify);
export default router;