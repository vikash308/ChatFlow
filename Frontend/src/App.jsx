import React from "react";
import Left from "./home/Leftpart/Left";
import Right from "./home/Rightpart/Right";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { useAuth } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const [authUser] = useAuth();

  return (
    <>
      <Routes>
        {/* Protected Home Route */}
        <Route
          path="/"
          element={
            authUser ? (
              <div className="drawer md:drawer-open bg-slate-900">
                <input
                  id="my-drawer-2"
                  type="checkbox"
                  className="drawer-toggle"
                />

                {/* Right panel */}
                <div className="drawer-content flex flex-col">
                  <Right />
                </div>

                {/* Left sidebar */}
                <div className="drawer-side">
                  <label
                    htmlFor="my-drawer-2"
                    className="drawer-overlay"
                  ></label>

                  <div className="w-80 min-h-full bg-black border-r border-slate-800">
                    <Left />
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
      </Routes>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </>
  );
}

export default App;
