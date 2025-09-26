import { Router } from "express";

import chatController from "../controllers/chat.controller.js";
import { protectRoutes } from "../middlewares/protectRoutes.js";

const router = Router();

router.get("/", protectRoutes, chatController.getChatsofUser);
router.get("/search", protectRoutes, chatController.getUsersByUsernameOrFullname);
router.post("/create/chat", protectRoutes, chatController.createChat);
router.delete("/delete/:chatId", protectRoutes, chatController.deleteChat);
export default router;