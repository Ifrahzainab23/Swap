import React, { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { userProfile, getUserProfile, currency, backendUrl, token } = useContext(ShopContext);

  useEffect(() => {
    getUserProfile();
  }, []);

  // Refresh profile when component mounts or when userProfile changes
  useEffect(() => {
    const refreshProfile = () => {
      getUserProfile();
    };

    // Refresh profile every 30 seconds to keep it updated
    const interval = setInterval(refreshProfile, 30000);

    return () => clearInterval(interval);
  }, []);

  // Check for new credit entries and show notifications
  useEffect(() => {
    if (userProfile?.credit_history) {
      const recentCredits = userProfile.credit_history
        .filter(entry => entry.reason.includes("Exchange Refund"))
        .filter(entry => {
          const entryDate = new Date(entry.date);
          const now = new Date();
          const diffInMinutes = (now - entryDate) / (1000 * 60);
          return diffInMinutes < 5; // Show notification for credits added in last 5 minutes
        });

      recentCredits.forEach(entry => {
        if (entry.amount > 0) {
          toast.success(`🎉 Exchange completed! ${entry.amount} credits have been added to your account.`);
        }
      });
    }
  }, [userProfile]);





  if (!userProfile) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 text-center text-gray-400">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-3xl font-extrabold text-gray-800">Profile</h1>
        <p className="text-gray-500 mt-1">Name: {userProfile.name}</p>
        <p className="text-gray-500 mt-1">Email: {userProfile.email}</p>
      </div>

      <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-green-700">💰 Credit Points</h2>
          <div className="flex gap-2">
            <button
              onClick={getUserProfile}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => {
                getUserProfile();
                toast.info("Profile refreshed! Check your latest credit balance.");
              }}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              🎯 Check Exchange Credits
            </button>
          </div>
        </div>
        <div className="text-3xl font-bold text-green-800">
          {userProfile.credit_points} points
        </div>
        <p className="text-xs text-green-600">Use these points on future orders or exchanges</p>
        

      </div>

      {/* Credit History */}
      {userProfile.credit_history && userProfile.credit_history.length > 0 && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">📊 Credit History</h2>
            <button
              onClick={getUserProfile}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {userProfile.credit_history.slice().reverse().map((entry, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-800">{entry.reason}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-bold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.amount > 0 ? '+' : ''}{entry.amount} {currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!userProfile.credit_history || userProfile.credit_history.length === 0) && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">📊 Credit History</h2>
            <button
              onClick={getUserProfile}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
          <p className="text-sm text-gray-400">No credit history yet.</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
