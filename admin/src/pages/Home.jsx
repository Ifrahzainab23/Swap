import React from "react";
import { FaTools, FaChartLine, FaUserShield } from "react-icons/fa";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-800 p-8 animate-fadeIn">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-2xl w-full text-center border border-gray-100">
        <h1 className="text-3xl font-bold mb-4 text-indigo-700 flex justify-center items-center gap-2">
          <FaUserShield className="text-indigo-500 text-4xl" />
          Admin Panel Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to the admin panel. Use the sidebar to manage items, view orders, and control the application settings.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="bg-indigo-50 p-4 rounded-lg shadow hover:shadow-md transition">
            <FaTools className="text-3xl text-indigo-600 mx-auto mb-2" />
            <p className="font-semibold">Add New Items</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg shadow hover:shadow-md transition">
            <FaChartLine className="text-3xl text-indigo-600 mx-auto mb-2" />
            <p className="font-semibold">View Item List</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg shadow hover:shadow-md transition">
            <FaUserShield className="text-3xl text-indigo-600 mx-auto mb-2" />
            <p className="font-semibold">Manage Orders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
