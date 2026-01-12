import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";

import Main from "./home/Main";
import Login from "./components/Login";
import Signup from "./components/Signup";
import VerifyOtp from "./components/VerifyOtp";

function App() {
  const [authUser] = useAuth();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={authUser ? <Main /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />

        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />

        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Routes>

      <Toaster position="top-right" />
    </>
  );
}

export default App;
