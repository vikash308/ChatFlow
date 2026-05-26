import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { generateOtp } from "../utils/generateOtp.js";
import crypto from "crypto"
import sendEmail from "../utils/sendEmail.js";
import { createHash } from "crypto";


export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already registered" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await new User({
      fullname,
      email,
      password: hashPassword,
    });
    await newUser.save();
    if (newUser) {
      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_TOKEN, {
        expiresIn: "10d",
      });
      res.status(201).json({
        message: "User created successfully",
        user: {
          _id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          token,
          isVerified: newUser.isVerified
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "signup first" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
      return res.status(400).json({ error: "Invalid user credential" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, {
      expiresIn: "10d",
    });
    res.status(201).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        token,
        isVerified: user.isVerified
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(201).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const allUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password").lean();

    // Fetch unread messages
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: loggedInUser,
          isRead: false
        }
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = {};
    unreadCounts.forEach(item => {
      unreadMap[item._id.toString()] = item.count;
    });

    // Fetch last message time for each user interaction using Message aggregation
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: loggedInUser },
            { receiverId: loggedInUser }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUser] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessageTime: { $first: "$createdAt" }
        }
      }
    ]);

    const lastMessageMap = {};
    lastMessages.forEach(item => {
      lastMessageMap[item._id.toString()] = new Date(item.lastMessageTime).getTime();
    });

    const currentUser = await User.findById(loggedInUser).select("blockedUsers");
    const blockedIds = currentUser?.blockedUsers?.map(id => id.toString()) || [];

    const usersWithExtraData = filteredUsers.map(user => {
      const blockedByThem = user.blockedUsers && user.blockedUsers.some(id => id.toString() === loggedInUser.toString());
      return {
        ...user,
        isBlocked: blockedIds.includes(user._id.toString()),
        isBlockedByThem: !!blockedByThem,
        unreadCount: unreadMap[user._id.toString()] || 0,
        lastMessageTime: lastMessageMap[user._id.toString()] || 0
      };
    });

    // Sort users: First by lastMessageTime (descending), then alphabetically
    usersWithExtraData.sort((a, b) => {
      if (b.lastMessageTime !== a.lastMessageTime) {
        return b.lastMessageTime - a.lastMessageTime;
      }
      return a.fullname.localeCompare(b.fullname);
    });

    res.status(201).json(usersWithExtraData);
  } catch (error) {
    console.log("Error in allUsers Controller: " + error);
  }
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found, please signup first",
      });
    }
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }
    const otp = generateOtp();
    console.log(otp)
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
    user.emailOtp = hashedOtp;
    user.emailOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      "ChatFlow Email Verification OTP",
      `Your OTP is ${otp}. It is valid for 10 minutes.`
    );

    console.log("opt send successfully")
    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

export const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const hashedOtp = createHash("sha256")
      .update(otp)
      .digest("hex");
    const user = await User.findOne({
      email,
      emailOtp: hashedOtp,
      emailOtpExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }
    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
      isVerified: user.isVerified
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const isVerifiedEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email }).select("isVerified");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("isVerifiedEmail error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await User.findByIdAndUpdate(req.user._id, { fcmToken });

    return res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
    });
  } catch (error) {
    console.error("updateFcmToken error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const userId = req.user._id;

    if (userId.toString() === targetId.toString()) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: targetId }
    });

    return res.status(200).json({
      success: true,
      message: "User blocked successfully"
    });
  } catch (error) {
    console.error("blockUser error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: targetId }
    });

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully"
    });
  } catch (error) {
    console.error("unblockUser error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};