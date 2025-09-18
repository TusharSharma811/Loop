import { Router } from "express";

import chatController from "../controllers/chat.controller.ts";
import { protectRoutes } from "../middlewares/protectRoutes.ts";

const router = Router();

router.get("/", protectRoutes, chatController.getChatsofUser);
router.get("/search", protectRoutes, chatController.getUsersByUsernameOrFullname);
router.post("/create/chat", protectRoutes, chatController.createChat);

export default router;