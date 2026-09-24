import express from "express";
import {
  allUsers,
  login,
  logout,
  signup,
  verifyEmailOtp,
  sendOtp,
  isVerifiedEmail,
  blockUser,
  unblockUser
} from "../controller/user.controller.js";
import secureRoute from "../middleware/secureRoute.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/allusers", secureRoute, allUsers);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/send-otp", sendOtp);
router.post("/isVerified", isVerifiedEmail);
router.post("/block/:id", secureRoute, blockUser);
router.post("/unblock/:id", secureRoute, unblockUser);

export default router;
