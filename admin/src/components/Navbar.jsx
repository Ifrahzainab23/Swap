import React from "react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3 bg-white shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src={assets.logo}
          alt="Admin Dashboard Logo"
          className="w-[80px] sm:w-[100px] object-contain"
        />
      </div>

      {/* Logout Button */}
      <div>
        <button
          onClick={() => setToken("")}
          className="bg-black hover:bg-gray-800 transition-colors duration-300 text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-sm sm:text-base font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
