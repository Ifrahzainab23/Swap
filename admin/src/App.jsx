import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Add from './pages/Add';
import List from './pages/List';
import Order from './pages/Order';
import Login from './components/Login';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Exchange from './pages/Exchange';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = 'pkr';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  const isAuthenticated = !!token;

  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login setToken={setToken} />} />

        {/* Protected Layout */}
        {isAuthenticated ? (
          <Route
            path="/*"
            element={
              <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
                <Navbar setToken={setToken} />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-grow p-6 sm:px-10 transition-all duration-300">
                    <div className="bg-white shadow-lg rounded-lg p-6 min-h-[calc(100vh-80px)]">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/add" element={<Add token={token} />} />
                        <Route path="/list" element={<List token={token} />} />
                        <Route path="/order" element={<Order token={token} />} />
                        <Route path="/exchange" element={<Exchange />} />
                        {/* Fallback redirect */}
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </div>
            }
          />
        ) : (
          // If not authenticated, redirect everything to login
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
