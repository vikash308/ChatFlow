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
        localStorage.setItem("verified", response.data.user.isVerified)
        setAuthUser(response.data);
      })
      .catch((error) => {
        if (error.response) {
          toast.error("Error: " + error.response.data.message);
        }
      })
      .finally(()=>{
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[380px] rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl p-8 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-purple-600">
            ✨ Welcome Back!
          </h1>
          <p className="text-gray-600 text-sm">Login to continue chatting</p>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="text"
            placeholder="Enter your email"
            {...register("email", { required: true })}
            className="w-full rounded-xl px-4 py-3
            border border-purple-200
            focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {errors.email && (
            <span className="text-red-400 text-sm">Email is required</span>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: true })}
            className="w-full rounded-xl px-4 py-3
            border border-pink-200
            focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          {errors.password && (
            <span className="text-red-400 text-sm">Password is required</span>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled = {loading}
          
          className="w-full py-3 rounded-xl text-white font-semibold
          bg-gradient-to-r from-purple-500 to-pink-500
          hover:scale-[1.02] hover:shadow-xl
          transition-all duration-300 cursor-pointer"
        >  {loading ? "Logging..." : "Login"}</button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?
          <Link
            to="/signup"
            className="ml-1 font-semibold text-purple-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
