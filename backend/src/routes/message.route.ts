import { Router } from "express";
import messageController from "../controllers/message.controller.ts";
import { protectRoutes } from "../middlewares/protectRoutes.ts";
const router = Router();


router.get("/get-messages/:chatId" , protectRoutes, messageController.getMessages);

export default router;