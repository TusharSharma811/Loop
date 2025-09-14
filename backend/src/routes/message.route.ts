import { Router } from "express";
import { getMessages } from "../controllers/message.controller.ts";
import { protectRoutes } from "../middlewares/protectRoutes.ts";
const router = Router();


router.get("/get-messages/:chatId" , protectRoutes, getMessages);

export default router;