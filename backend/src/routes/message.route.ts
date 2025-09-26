import { Router } from "express";
import messageController from "../controllers/message.controller.js";
import { protectRoutes } from "../middlewares/protectRoutes.js";
const router = Router();


router.get("/get-messages/:chatId" , protectRoutes, messageController.getMessages);

export default router;