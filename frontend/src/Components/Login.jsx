import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { ShopContext } from "../Context/ShopContext";
import "react-toastify/dist/ReactToastify.css";


const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userId", response.data.userId);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userId", response.data.userId);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen">
 

      {/* Main Content */}
      <div className="flex flex-grow w-full h-screen">
        {/* Left: Form */}
        <div className="w-full mb-40 flex items-center justify-center ">
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col w-full max-w-md gap-4 text-gray-800"
          >
            <div className="inline-flex items-center gap-2 mb-2 mt-4">
              <p className="text-3xl font-semibold">{currentState}</p>
              <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
            </div>

            {currentState === "Login" ? null : (
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="Name"
                required
              />
            )}

            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              className="w-full px-3 py-2 border border-gray-800"
              placeholder="Email"
              required
            />

            <div className="w-full relative">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="Password"
                required
              />
              <span
                className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </span>
            </div>

            <div className="w-full flex justify-between text-sm -mt-1">
              <p className="cursor-pointer">Forgot your password?</p>
              {currentState === "Login" ? (
                <p
                  onClick={() => setCurrentState("Sign Up")}
                  className="cursor-pointer underline"
                >
                  Create account
                </p>
              ) : (
                <p
                  onClick={() => setCurrentState("Login")}
                  className="cursor-pointer underline"
                >
                  Login Here
                </p>
              )}
            </div>

            <button
              className="bg-black text-white font-light px-8 py-2 mt-4"
              type="submit"
            >
              {currentState === "Login" ? "Sign In" : "Sign Up"}
            </button>
          </form>
        </div>

    
      </div>

   
    </div>
  );
};

export default Login;
