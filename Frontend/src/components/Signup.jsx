import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import server from "../api";

function Signup() {
  const [authUser, setAuthUser] = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const validatePasswordMatch = (value) => {
    return value === password || "Passwords do not match";
  };

  const onSubmit = async (data) => {
    const userInfo = {
      fullname: data.fullname,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    await axios
      .post(server + "/api/user/signup", userInfo)
      .then((response) => {
        if (response.data) {
          toast.success("Signup successful");
        }
        localStorage.setItem("ChatApp", JSON.stringify(response.data));
        setAuthUser(response.data);
      })
      .catch((error) => {
        if (error.response) {
          toast.error("Error: " + error.response.data.error);
        }
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[380px] rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl p-8 space-y-5"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-pink-600">
             Create Account
          </h1>
          <p className="text-gray-600 text-sm">Join and start chatting</p>
        </div>

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            {...register("fullname", { required: true })}
            className="w-full rounded-xl px-4 py-3
            border border-purple-200
            focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {errors.fullname && (
            <span className="text-red-400 text-sm">Full name is required</span>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: true })}
            className="w-full rounded-xl px-4 py-3
            border border-pink-200
            focus:outline-none focus:ring-2 focus:ring-pink-400"
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
            placeholder="Create a password"
            {...register("password", { required: true })}
            className="w-full rounded-xl px-4 py-3
            border border-green-200
            focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {errors.password && (
            <span className="text-red-400 text-sm">Password is required</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Re-enter password"
            {...register("confirmPassword", {
              required: true,
              validate: validatePasswordMatch,
            })}
            className="w-full rounded-xl px-4 py-3
            border border-purple-200
            focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {errors.confirmPassword && (
            <span className="text-red-400 text-sm">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Button */}
        <input
          type="submit"
          value="Sign Up"
          className="w-full py-3 rounded-xl text-white font-semibold
          bg-gradient-to-r from-purple-500 to-pink-500
          hover:scale-[1.02] hover:shadow-xl
          transition-all duration-300 cursor-pointer"
        />

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?
          <Link
            to="/login"
            className="ml-1 font-semibold text-purple-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
