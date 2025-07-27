import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../Components/Title";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const ExchangeTracking = () => {
  const { currency, orders, orderData } = useContext(ShopContext);
  const navigate = useNavigate();
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [replacementProducts, setReplacementProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Please login to view exchange tracking");
      setLoading(false);
      return;
    }
    orderData();
  }, [token]);

  useEffect(() => {
    // Always call fetchExchangeRequests when orders change, even if empty
    fetchExchangeRequests();
  }, [orders]);

  // Check for newly completed exchanges and show credit notifications
  useEffect(() => {
    exchangeRequests.forEach((order) => {
      if (order.exchangeRequest?.exchangeStatus === "Completed" && 
          order.exchangeRequest?.priceDifference < 0 && 
          order.exchangeRequest?.creditGiven) {
        // Show notification for credit addition
        const refundAmount = Math.abs(order.exchangeRequest.priceDifference);
        toast.success(`🎉 Exchange completed! ${currency} ${refundAmount} credits have been added to your account.`);
        
        // Refresh user profile to show updated credits
        setTimeout(() => {
          getUserProfile();
        }, 1000);
      }
    });
  }, [exchangeRequests]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Loading timeout. Please refresh the page.");
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Fetch replacement product details
  const fetchReplacementProduct = async (productId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/product/single",
        { productId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        return response.data.product;
      }
    } catch (error) {
      console.error("Error fetching replacement product:", error);
    }
    return null;
  };

  // Fetch all replacement products for the exchange requests
  const fetchReplacementProducts = async (requests) => {
    const products = {};
    for (const request of requests) {
      if (request.exchangeRequest?.replacementProduct) {
        const product = await fetchReplacementProduct(request.exchangeRequest.replacementProduct);
        if (product) {
          products[request.exchangeRequest.replacementProduct] = product;
        }
      }
    }
    setReplacementProducts(products);
  };

  const fetchExchangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("All orders:", orders); // Debug log
      const ordersWithExchanges = orders.filter((order) => order.exchangeRequest && order.exchangeRequest.reason);
      console.log("Orders with exchanges:", ordersWithExchanges); // Debug log
      setExchangeRequests(ordersWithExchanges);
      
      // Fetch replacement product details
      await fetchReplacementProducts(ordersWithExchanges);
    } catch (error) {
      console.error("Error fetching exchange requests:", error);
      setError("Failed to load exchange requests");
    } finally {
      setLoading(false);
    }
  };

  // Refresh exchange data
  const refreshExchangeData = async () => {
    await orderData(); // Refresh orders from context
    await fetchExchangeRequests(); // Re-fetch exchange requests
  };

  // Get status color based on exchange status
  const getStatusColor = (status) => {
    switch (status) {
      case "Exchange Requested":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Packing":
        return "bg-orange-100 text-orange-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Out for delivery":
        return "bg-indigo-100 text-indigo-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get progress percentage based on status
  const getProgressPercentage = (status) => {
    switch (status) {
      case "Exchange Requested":
        return 14;
      case "Processing":
        return 28;
      case "Packing":
        return 42;
      case "Shipped":
        return 57;
      case "Out for delivery":
        return 71;
      case "Delivered":
        return 85;
      case "Completed":
        return 100;
      default:
        return 0;
    }
  };

  // Get status timeline
  const getStatusTimeline = (currentStatus) => {
    const statuses = [
      "Exchange Requested",
      "Processing", 
      "Packing",
      "Shipped",
      "Out for delivery",
      "Delivered",
      "Completed"
    ];
    
    const currentIndex = statuses.indexOf(currentStatus);
    
    return statuses.map((status, index) => ({
      label: status,
      completed: index <= currentIndex
    }));
  };

  // Format payment method for display
  const formatPaymentMethod = (paymentMethod) => {
    if (!paymentMethod) return "Not specified";
    
    switch (paymentMethod.toLowerCase()) {
      case "cod":
        return "Cash on Delivery";
      case "stripe":
        return "Credit/Debit Card (Stripe)";
      case "razorpay":
        return "Online Payment (Razorpay)";
      default:
        return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="border-t pt-16 text-center">
        <div className="text-lg text-gray-700 mb-4">Loading exchange requests...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t pt-16 text-center">
        <div className="text-lg text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={refreshExchangeData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="border-t pt-16 text-center">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-lg text-gray-700 mb-4">No orders found</p>
        <p className="text-gray-500 text-sm mb-6">You need to place an order first before requesting an exchange</p>
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800"
        >
          Shop Now
        </button>
      </div>
    );
  }

  // Check if there are any delivered orders
  const deliveredOrders = orders.filter(order => order.status === "Delivered");
  if (deliveredOrders.length === 0 && !loading) {
    return (
      <div className="border-t pt-16 text-center">
        <div className="text-6xl mb-4">🚚</div>
        <p className="text-lg text-gray-700 mb-4">No delivered orders found</p>
        <p className="text-gray-500 text-sm mb-6">You need to have delivered orders to request exchanges</p>
        <button
          onClick={() => navigate("/orders")}
          className="bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800"
        >
          View Orders
        </button>
      </div>
    );
  }

  if (exchangeRequests.length === 0 && !loading) {
    return (
      <div className="border-t pt-16 text-center">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-lg text-gray-700 mb-4">No exchange requests found</p>
        <p className="text-gray-500 text-sm mb-6">You haven't submitted any exchange requests yet</p>
        <button
          onClick={() => navigate("/exchange")}
          className="bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-800"
        >
          Request Exchange
        </button>
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="flex justify-between items-center mb-8">
        <div className="text-2xl">
          <Title text1={"EXCHANGE"} text2={"TRACKING"} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await refreshExchangeData();
              await getUserProfile();
              toast.info("Exchange requests and profile refreshed!");
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            🔄 Refresh All
          </button>
          <button
            onClick={() => navigate("/exchange")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Request New Exchange
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {exchangeRequests.map((order, index) => (
          <div key={order._id} className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Exchange Request #{index + 1}</h3>
                <p className="text-sm text-gray-600">Order: {order._id}</p>
                <p className="text-sm text-gray-600">
                  Requested:{" "}
                  {order.exchangeRequest?.requestedAt
                    ? new Date(order.exchangeRequest.requestedAt).toLocaleDateString()
                    : new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{currency} {order.amount}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusColor(order.exchangeRequest?.exchangeStatus || "Exchange Requested")}`}>
                  {order.exchangeRequest?.exchangeStatus || "Exchange Requested"}
                </span>
              </div>
            </div>

            {/* Product Exchange Comparison */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-800">Product Exchange Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Product */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-3 text-sm">Original Product</h5>
                  <div className="space-y-2">
                    {order.items?.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 p-2 bg-white rounded">
                        <img
                          src={item.image?.[0] || "/placeholder.svg?height=40&width=40"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Size: {item.size} • Qty: {item.quantity}
                          </p>
                          <p className="text-xs font-medium text-gray-800">
                            {currency} {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Replacement Product */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-700 mb-3 text-sm">Replacement Product</h5>
                  {order.exchangeRequest?.replacementProduct && replacementProducts[order.exchangeRequest.replacementProduct] ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded">
                      <img
                        src={replacementProducts[order.exchangeRequest.replacementProduct].image?.[0] || "/placeholder.svg?height=40&width=40"}
                        alt={replacementProducts[order.exchangeRequest.replacementProduct].name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{replacementProducts[order.exchangeRequest.replacementProduct].name}</p>
                        <p className="text-xs text-gray-600">
                          Size: {order.exchangeRequest?.size || "Not specified"}
                        </p>
                        <p className="text-xs font-medium text-gray-800">
                          {currency} {replacementProducts[order.exchangeRequest.replacementProduct].price}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-2 bg-white rounded">
                      <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exchange Status Tracking */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">Exchange Progress</h4>
              
              {/* Current Status Display */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.exchangeRequest?.exchangeStatus || "Exchange Requested")}`}>
                    {order.exchangeRequest?.exchangeStatus || "Exchange Requested"}
                  </span>
                </div>
              </div>

              {/* Status Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{getProgressPercentage(order.exchangeRequest?.exchangeStatus || "Exchange Requested")}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getProgressPercentage(order.exchangeRequest?.exchangeStatus || "Exchange Requested")}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-2">
                {getStatusTimeline(order.exchangeRequest?.exchangeStatus || "Exchange Requested").map((status, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={`text-xs ${status.completed ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                      {status.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchange Details */}
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Exchange Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Reason:</strong> {order.exchangeRequest?.reason}</p>
                  <p><strong>New Size:</strong> {order.exchangeRequest?.size || "Not specified"}</p>
                  <p><strong>Payment Method:</strong> {formatPaymentMethod(order.exchangeRequest?.paymentMethod)}</p>
                </div>
                <div>
                  {typeof order.exchangeRequest?.priceDifference === "number" && (
                    <div>
                      {order.exchangeRequest.priceDifference > 0 && (
                        <p className="text-green-700 font-medium">{currency} {order.exchangeRequest.priceDifference} additional payment required.</p>
                      )}
                      {order.exchangeRequest.priceDifference < 0 && (
                        <div>
                          <p className="text-blue-700 font-medium">
                            You will get {currency} {Math.abs(order.exchangeRequest.priceDifference)} as credit points when admin completes the exchange.
                          </p>
                          {order.exchangeRequest?.creditGiven && (
                            <p className="text-green-600 text-sm mt-1">
                              ✅ Credits have been added to your account!
                            </p>
                          )}
                          {!order.exchangeRequest?.creditGiven && order.exchangeRequest?.exchangeStatus !== "Completed" && (
                            <p className="text-gray-600 text-sm mt-1">
                              ⏳ Waiting for admin to complete the exchange...
                            </p>
                          )}
                        </div>
                      )}
                      {order.exchangeRequest.priceDifference === 0 && (
                        <p className="text-gray-500 font-medium">No price difference in exchange.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full text-end mt-8">
        <button
          onClick={() => navigate("/exchange")}
          className="bg-black text-white px-16 py-3 text-sm rounded hover:bg-gray-800"
        >
          REQUEST EXCHANGE
        </button>
      </div>
    </div>
  );
};

export default ExchangeTracking; 