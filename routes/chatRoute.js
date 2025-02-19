import { Router } from "express";
import { requireAuthentication } from "../controllers/utils/middlewares/authCheck.js";
import {
  accessChat,
  fetchChats,
  createGroup,
  sendMessageToGroup,
  renameGroup,
  removeUser,
  deleteGroup,
  addUserToGroup,
  getChatMessages,
} from "../controllers/chatController.js";
import { upload } from "../controllers/utils/fileupload.js";

const router = Router();
router.post("/chats", requireAuthentication, accessChat);
router.get("/messages", requireAuthentication, getChatMessages);
router.get("/allChats", requireAuthentication, fetchChats);
router.post("/groupChats", upload, requireAuthentication, sendMessageToGroup);
router.post("/group", upload, requireAuthentication, createGroup);
router.put("/renameGroup", requireAuthentication, renameGroup);
router.put("/removeUser", requireAuthentication, removeUser);
router.put("/deleteGroup", requireAuthentication, deleteGroup);
router.put("/addUser", requireAuthentication, addUserToGroup);

// router.post("/chats", accessChat);

export default router;
