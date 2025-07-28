import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../App";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Add this

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/admin`, {
        email,
        password,
      });

      if (response.data.success) {
        toast.success("Login successful!");
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);

        navigate("/"); // ✅ Redirect to home page after login
      } else {
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="w-screen h-screen flex">
    {/* Left: Login Form */}
    <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel Login</h1>
        <form onSubmit={onSubmitHandler}>
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-black"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-black pr-10"
              required
              autoComplete="current-password"
            />
            <span
              className="absolute top-[38px] right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </span>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full py-2 px-4 rounded-md text-white transition-all ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>

    {/* Right: Full Image */}
    <div className="hidden md:block md:w-1/2 h-full">
      <img
        src="/src/assets/Adminlogin01.jpg"
        alt="Admin Illustration"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
);

};

export default Login;
