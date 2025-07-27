import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../Components/Title";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";

// ✅ Feedback Modal Component
const FeedbackModal = ({ onClose, orderId }) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/feedback",
        { feedback, orderId },
        {
          headers: { token },
        }
      );

      if (res.data.success) {
        setSubmitted(true);
        setTimeout(onClose, 2000);
      } else {
        alert(res.data.message || "Submission failed.");
      }
    } catch (err) {
      console.error("Feedback error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        {submitted ? (
          <h2 className="text-xl font-semibold text-center text-green-600">
            Thank you for your feedback!
          </h2>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">We value your feedback!</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full border border-gray-300 p-3 rounded resize-none"
                rows="4"
                placeholder="Let us know how your order experience was..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border text-sm rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white text-sm rounded"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ✅ Track Order Modal
const TrackOrderModal = ({ status, onClose }) => {
  const steps = ["Pending", "Confirmed", "Shipped", "Delivered"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Tracking Order</h2>
        <ul className="space-y-2 mb-4">
          {steps.map((step, index) => (
            <li
              key={index}
              className={`flex items-center gap-2 ${
                steps.indexOf(status) >= index ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span className="w-3 h-3 rounded-full border border-gray-400 bg-current"></span>
              {step}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-black text-white rounded text-sm w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ✅ Orders Page
const Orders = () => {
  const { currency, orders, orderData } = useContext(ShopContext);
  const navigate = useNavigate();

  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [trackModalVisible, setTrackModalVisible] = useState(false);

  // Check if order is eligible for exchange
  const isOrderEligibleForExchange = (order) => {
    return !order.exchangeRequest && 
           order.status === "Delivered"; // Only delivered orders can be exchanged
  };

  useEffect(() => {
    orderData();
  }, []);

  const openFeedback = (orderId) => {
    setSelectedOrderId(orderId);
    setShowFeedback(true);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    setSelectedOrderId(null);
  };

  const openTrackModal = (status) => {
    setSelectedStatus(status || "Pending");
    setTrackModalVisible(true);
  };

  const closeTrackModal = () => {
    setTrackModalVisible(false);
    setSelectedStatus(null);
  };

  if (!orders.length) {
    return (
      <div className="border-t pt-16 text-center">
        <p className="text-lg text-gray-700">No orders available</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-black text-white px-6 py-2 text-sm"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal orderId={selectedOrderId} onClose={closeFeedback} />
      )}

      {/* Track Order Modal */}
      {trackModalVisible && (
        <TrackOrderModal status={selectedStatus} onClose={closeTrackModal} />
      )}

      <div className="text-2xl mb-6">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* Exchange Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Exchange Requests</h3>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(order => order.exchangeRequest && order.exchangeRequest.reason).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Delivered Orders</h3>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(order => order.status === "Delivered").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Eligible for Exchange</h3>
          <p className="text-2xl font-bold text-orange-600">
            {orders.filter(order => isOrderEligibleForExchange(order)).length}
          </p>
        </div>
      </div>

      <div>
        {orders.map((order, index) => (
          <div key={index} className="py-4 border-t border-b text-gray-700">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4"
              >
                <div className="flex items-start gap-6 text-sm">
                  <img className="w-12 sm:w-16" src={item?.image?.[0]} alt={item.name} />
                  <div>
                    <p className="sm:text-base font-medium">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                      <p>{currency}{item.price}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                    </div>
                    <p className="mt-1">
                      Order Date:{" "}
                      <span className="text-gray-400">
                        {new Date(order.date).toDateString()}
                      </span>
                    </p>
                    
                    {/* Show credit usage information */}
                    {order.creditsUsed > 0 && (
                      <p className="mt-1 text-xs text-green-600 font-medium">
                        💰 {order.creditsUsed} credits applied to this order
                      </p>
                    )}
                    
                    {/* Show original amount if credits were used */}
                    {order.originalAmount && order.originalAmount !== order.amount && (
                      <p className="mt-1 text-xs text-gray-500">
                        Original: {currency}{order.originalAmount} | Final: {currency}{order.amount}
                      </p>
                    )}
                    {/* Show exchange indicator for items in exchanged orders */}
                    {order.exchangeRequest && order.exchangeRequest.reason && (
                      <p className="mt-1 text-xs text-blue-600 font-medium">
                        🔄 This item is part of an exchange request
                      </p>
                    )}
                    
                    {/* Show indicator for orders not eligible for exchange */}
                    {!order.exchangeRequest && order.status !== "Delivered" && (
                      <p className="mt-1 text-xs text-gray-500 font-medium">
                        📦 Order not delivered yet - exchange available after delivery
                      </p>
                    )}
                    
                    {/* Show indicator for delivered orders eligible for exchange */}
                    {!order.exchangeRequest && order.status === "Delivered" && (
                      <p className="mt-1 text-xs text-orange-600 font-medium">
                        🚚 Order delivered - eligible for exchange
                      </p>
                    )}
                  </div>
                </div>

                <div className="md:w-1/2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-base">{order.status || "Confirmed"}</p>
                  </div>
                  
                  {/* Exchange Status Indicator - Only show if order has exchange request */}
                  {order.exchangeRequest && order.exchangeRequest.reason && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-sm text-blue-600">
                        Exchange: {order.exchangeRequest.exchangeStatus || "Requested"}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      className="border px-4 py-2 text-sm font-medium rounded-sm"
                      onClick={() => openTrackModal(order.status)}
                    >
                      Track Order
                    </button>
                    
                    {/* Show appropriate button based on order status */}
                    {order.exchangeRequest && order.exchangeRequest.reason ? (
                      // Order has been exchanged - show Track Exchange
                      <button
                        onClick={() => navigate("/exchange-tracking")}
                        className="border px-4 py-2 text-sm font-medium rounded-sm text-blue-600 border-blue-600"
                      >
                        Track Exchange
                      </button>
                    ) : isOrderEligibleForExchange(order) ? (
                      // Order is eligible for exchange - show Exchange button
                      <button
                        onClick={() => navigate("/exchange")}
                        className="border px-4 py-2 text-sm font-medium rounded-sm text-orange-600 border-orange-600"
                      >
                        Exchange
                      </button>
                    ) : (
                      // Order is not eligible - show Give Feedback
                      <button
                        onClick={() => openFeedback(order._id)}
                        className="border px-4 py-2 text-sm font-medium rounded-sm text-black"
                      >
                        Give Feedback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="w-full text-end mt-8">
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-16 py-3 text-sm"
        >
          PLACE ORDER
        </button>
      </div>
    </div>
  );
};

export default Orders;
