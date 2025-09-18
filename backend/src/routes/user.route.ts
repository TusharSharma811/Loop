import Router from "express";
import userController from "../controllers/user.controller.js";
import { protectRoutes } from "../middlewares/protectRoutes.js";

const router = Router();

router.get("/me", protectRoutes, userController.me);
router.put("/update-me", protectRoutes, userController.updateUser);
router.delete("/delete-me", protectRoutes, userController.deleteUser);

export default router;