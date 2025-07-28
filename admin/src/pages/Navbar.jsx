import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem('token');
  setToken('');
  navigate('/login');
};


  return (
    <header className="bg-white shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <img
          src={assets.logo}
          alt="Logo"
          className="w-24 sm:w-28 object-contain"
        />
        <span className="text-lg sm:text-xl font-semibold text-gray-700 hidden sm:inline">Admin Dashboard</span>
      </div>

      <button
        onClick={handleLogout}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-5 py-2 rounded-full text-sm transition duration-200 shadow-md hover:shadow-lg"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;
