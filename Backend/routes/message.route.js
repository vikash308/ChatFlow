import express from "express";
import { getMessage, sendMessage, deleteForEveryone, deleteForMe, clearChat } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRoute.js";

const router = express.Router();
router.post("/send/:id", secureRoute, sendMessage);
router.get("/get/:id", secureRoute, getMessage);
router.delete("/delete-for-me/:messageId", secureRoute, deleteForMe);
router.delete("/delete-for-everyone/:messageId", secureRoute, deleteForEveryone);
router.delete("/clear/:id", secureRoute, clearChat);


export default router;
