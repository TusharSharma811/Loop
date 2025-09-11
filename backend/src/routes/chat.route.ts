import { Router } from "express";

const router = Router();

router.post('/createChat') ;
router.get('/getChats') ;
router.put('/renameChat') ;
router.delete('/deleteChat') ;


export default router;