import { Router } from "express";

import { createChat, getChatsofUser, getUsersByUsernameOrFullname } from "../controllers/chat.controller.ts";
import { protectRoutes } from "../middlewares/protectRoutes.ts";

const router = Router();

router.get("/user/chats", protectRoutes, getChatsofUser);
router.get("/search/users", protectRoutes, getUsersByUsernameOrFullname);
router.post("/create/chat", protectRoutes, createChat);

export default router;