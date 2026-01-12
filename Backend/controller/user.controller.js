import User from "../models/user.model.js";
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
          isVerified:newUser.isVerified
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
    if (!user) return res.status(400).json({message: "signup first"});
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
        isVerified:user.isVerified
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
    }).select("-password");
    res.status(201).json(filteredUsers);
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
      isVerified:user.isVerified
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