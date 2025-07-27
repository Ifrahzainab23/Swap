import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "PKR";
  const delivery_fee = 250;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [loadingCart, setLoadingCart] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + "/api/cart/update", { itemId, size, quantity }, { headers: { token } });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + "/api/cart/add", { itemId, size }, { headers: { token } });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.error("Error calculating cart amount:", error);
        }
      }
    }
    return totalAmount;
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(backendUrl + "/api/cart/get", {}, { headers: { token } });
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoadingCart(false);
    }
  };


  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message || "Failed to load products");
      }
    } catch (error) {
      console.error("API fetch error:", error);
      toast.error("Fetching product error: " + error.message);
    }
  };

  const orderData = async () => {
    try {
      if (!token) {
        console.log("No token found, skipping order data fetch");
        return;
      }

      console.log("🔐 [FRONTEND] Token length:", token.length);
      console.log("🔐 [FRONTEND] Token preview:", token.substring(0, 50) + "...");
      
      // First test authentication
      try {
        const authTest = await axios.post(`${backendUrl}/api/order/test-auth`, {}, { headers: { token } });
        console.log("✅ [FRONTEND] Auth test successful:", authTest.data);
      } catch (authError) {
        console.error("❌ [FRONTEND] Auth test failed:", authError.response?.data);
        // Don't return here, continue to try userorders
      }

      console.log("Fetching orders with token:", token.substring(0, 20) + "...");
      const response = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } });

      console.log("Orders API response:", response.data);

      if (response.data.success) {
        const structuredOrders = response.data.orders.map((order) => ({
          _id: order._id,
          date: order.date,
          status: order.status,
          payment: order.payment,
          paymentMethod: order.paymentMethod,
          items: order.items,
          exchanged: order.exchanged,   // ✅ Include exchanged status
          exchangeRequest: order.exchangeRequest, // ✅ Include exchange request data with status
          amount: order.amount, // ✅ Include order amount
          address: order.address, // ✅ Include address for display
        }));

        console.log("Structured orders:", structuredOrders);
        setOrders(structuredOrders.reverse());
      } else {
        console.error("Orders API returned error:", response.data.message);
        // Show toast error for user feedback
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Failed to load orders", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        // Show toast error for user feedback
        toast.error(error.response.data.message || "Failed to load orders");
      }
    }
  };

  // ShopContext.jsx
  // const requestExchange = async (exchangeData) => {
  //   try {
  //     const res = await fetch("http://localhost:5000/api/exchange", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${yourAuthToken}`, // if using auth
  //       },
  //       body: JSON.stringify(exchangeData),
  //     });

  //     const data = await res.json();
  //     return data.success;
  //   } catch (err) {
  //     console.error("Exchange request failed:", err);
  //     return false;
  //   }
  // };

  // Function to check exchange eligibility
  const checkExchangeEligibility = async (orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/check-exchange-eligibility`,
        { orderId },
        { headers: { token } }
      );

      return response.data;
    } catch (error) {
      console.error("Check exchange eligibility error:", error);
      return { success: false, message: error.message };
    }
  };

  // Function to request an exchange
  const requestExchange = async ({ orderId, size, reason, replacementProduct, priceDifference, paymentMethod }) => {
    try {
      // First check if the order is eligible for exchange
      const eligibilityCheck = await checkExchangeEligibility(orderId);
      if (!eligibilityCheck.success || !eligibilityCheck.isEligible) {
        toast.error(eligibilityCheck.message || "Order is not eligible for exchange");
        return false;
      }

      const response = await axios.post(
        `${backendUrl}/api/order/request-exchange`,
        {
          orderId,
          size,
          reason,
          replacementProduct,
          priceDifference,
          paymentMethod,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        if (response.data.sessionUrl) {
          window.location.href = response.data.sessionUrl; // redirect to Stripe
          return true;
        }

        toast.success("Exchange request sent successfully!");
        return true;
      } else {
        toast.error(response.data.message || "Exchange request failed.");
        return false;
      }
    } catch (error) {
      console.error("Exchange request error:", error);
      toast.error("Exchange request error: " + error.message);
      return false;
    }
  };

  const refundCredit = async (orderId) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/refund-credit`,
        { orderId },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Refund credited to your account");
        // Refresh user profile to show updated credits
        await getUserProfile();
        return true;
      } else {
        toast.error(res.data.message || "Refund failed");
        return false;
      }
    } catch (err) {
      console.error("Refund credit API error:", err);
      toast.error("Refund API error: " + err.message);
      return false;
    }
  };

  const getUserProfile = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/profile`, { headers: { token } });
      if (res.data.success) {
        setUserProfile(res.data.user);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Fetch profile failed", err);
    }
  };


  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    orderData();
    if (token) {
      getUserProfile();
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      getUserCart(storedToken);
      getUserProfile(); // Load user profile to get credit points
    } else {
      setLoadingCart(false); // Still need to stop loading even without token
    }
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    updateQuantity,
    getCartAmount,
    getCartCount,
    requestExchange, // ✅ added here
    checkExchangeEligibility, // ✅ added here
    refundCredit, // ✅ added here
    orders, // ✅ added here
    orderData, // ✅ added here
    userProfile,
    getUserProfile,
    navigate,
    backendUrl,
    setToken,
    token,
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;
