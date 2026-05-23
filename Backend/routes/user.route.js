import express from "express";
import {
  allUsers,
  login,
  logout,
  signup,
  verifyEmailOtp,
  sendOtp,
  isVerifiedEmail,
  updateFcmToken
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
router.post("/update-fcm", secureRoute, updateFcmToken);

export default router;
