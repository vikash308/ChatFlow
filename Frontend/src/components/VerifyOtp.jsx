import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import server from "../api";
import { useAuth } from "../context/AuthProvider";


function VerifyOtp() {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const email = localStorage.getItem("email")

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const isVerified = authUser?.isVerified;
  console.log(isVerified)

 useEffect(() => {
   if (!email) {
     toast.error("Email not found. Please signup again.");
     navigate("/signup");
   }
 }, [email, navigate]);

  const otpSentRef = useRef(false);

  useEffect(() => {
    if (otpSentRef.current) return;
    otpSentRef.current = true;

    const sendOtp = async () => {
      try {
        await axios.post(server + "/api/user/send-otp", { email });
        toast.success("OTP sent to your email");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send OTP");
      }
    };

    sendOtp();
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");
    if (finalOtp.length !== 4) {
      toast.error("Enter valid 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      let res = await axios.post(server + "/api/user/verify-email-otp", {
        email,
        otp: finalOtp,
      });

      setAuthUser({
        ...authUser,
        isVerified: true,
      });
      
      toast.success("Email verified successfully");
      localStorage.removeItem("otpEmail");
      navigate("/");

    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post(server + "/api/user/send-otp", { email });
      toast.success("OTP resent to your email");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const gotoLogin =  ()=>{
     setAuthUser(null);
    localStorage.removeItem("jwt")
    localStorage.removeItem("ChatApp")
    localStorage.removeItem("email")
    localStorage.removeItem("verified")

    navigate("/login", { replace: true });
    
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100">
      <form
        onSubmit={handleSubmit}
        className="w-[380px] rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl p-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-pink-600">Verify OTP</h1>
          <p className="text-gray-600 text-sm">
            OTP sent to <b>{email}</b>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-14 text-center text-xl font-semibold
              rounded-xl border border-purple-200
              focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          ))}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold
          bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-gray-600">
          Didn’t receive OTP?
          <span
            onClick={resendOtp}
            className="ml-1 font-semibold text-purple-600 cursor-pointer hover:underline"
          >
            Resend
          </span>
        </p>
        <div className="text-center pt-2">
          <button onClick={gotoLogin}
            className="inline-flex items-center gap-2 text-sm font-semibold
               text-purple-600 hover:text-purple-700
               hover:underline transition-all duration-200"
          >
            ← Go back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default VerifyOtp;
