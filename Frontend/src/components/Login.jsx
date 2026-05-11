import axios from "axios";
import React, {useState} from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import server from "../api";

function Login() {
  const [authUser, setAuthUser] = useAuth();
  const [loading, setLoading] = useState(false); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    const userInfo = {
      email: data.email,
      password: data.password,
    };
    setLoading(true);

    axios
      .post(`${server}/api/user/login`, userInfo)
      .then((response) => {
        if (response.data) {
          toast.success("Login successful");
        }
        localStorage.setItem("ChatApp", JSON.stringify(response.data));
        localStorage.setItem("jwt", response.data.user.token);
        localStorage.setItem("email", response.data.user.email);
        setAuthUser(response.data);
      })
      .catch((error) => {
        if (error.response) {
          const errorMessage = error.response.data.error || error.response.data.message || "Something went wrong";
          toast.error("Error: " + errorMessage);
        } else {
          toast.error("Network error. Please try again.");
        }
      })
      .finally(()=>{
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060e20] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full"></div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[400px] glass-card rounded-[2.5rem] p-10 space-y-8 z-10 animate-in fade-in zoom-in-95 duration-700 relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 premium-gradient rounded-full opacity-50"></div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 premium-gradient rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4">
             <span className="text-2xl font-black text-white italic">CF</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-white/40 text-sm font-medium tracking-wide">Enter your details to continue</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <input
              type="text"
              placeholder="alex@example.com"
              {...register("email", { required: true })}
              className="w-full rounded-2xl px-6 py-4
              bg-white/[0.03] text-white placeholder-white/10
              border border-white/5 outline-none
              focus:border-indigo-500/30 focus:bg-white/[0.05]
              transition-all duration-300"
            />
            {errors.email && (
              <span className="text-red-400/80 text-[10px] font-bold uppercase tracking-wider ml-1">Email is required</span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: true })}
              className="w-full rounded-2xl px-6 py-4
              bg-white/[0.03] text-white placeholder-white/10
              border border-white/5 outline-none
              focus:border-indigo-500/30 focus:bg-white/[0.05]
              transition-all duration-300"
            />
            {errors.password && (
              <span className="text-red-400/80 text-[10px] font-bold uppercase tracking-wider ml-1">Password is required</span>
            )}
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs
          premium-gradient shadow-xl shadow-indigo-500/20
          hover:scale-[1.02] active:scale-95
          transition-all duration-300 cursor-pointer
          disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-xs font-bold text-white/30 uppercase tracking-widest">
          New here?
          <Link
            to="/signup"
            className="ml-2 text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
          >
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
