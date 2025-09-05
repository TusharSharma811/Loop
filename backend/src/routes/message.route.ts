import { Router } from "express";
import { getMessages, deleteMessage } from "../controllers/message.controller";
import { protectRoutes } from "../middlewares/protectRoutes";
const router = Router();


router.get("/get-messages/:chatId" , protectRoutes, getMessages);
router.delete("/delete-message/:messageId" , protectRoutes, deleteMessage);
export default router;