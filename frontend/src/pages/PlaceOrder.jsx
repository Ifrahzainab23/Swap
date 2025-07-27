import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../Components/Title";
import CartTotal from "../Components/CartTotal";
import { assets } from "../assets/assets.js";
import { ShopContext } from "../context/ShopContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false); // ✅ loading indicator
  const [creditsToUse, setCreditsToUse] = useState(0);

  const { backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, loadingCart, getUserProfile } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please log in to place an order.");
      return;
    }

    try {
      setPlacingOrder(true);

      let orderItems = [];

      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            const itemInfo = products.find((p) => p._id === productId);
            if (itemInfo) {
              const clonedItem = { ...itemInfo };
              clonedItem.size = size;
              clonedItem.quantity = cartItems[productId][size];
              orderItems.push(clonedItem);
            }
          }
        }
      }

      if (orderItems.length === 0) {
        toast.error("Your cart is empty.");
        return;
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        creditsToUse: creditsToUse,
        paymentMethod: method,
      };

      switch (method) {
        case "cod": {
          const response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
            headers: { token },
          });
          // console.log("Order response:", response.data);

          if (response.data.success) {
            const message = creditsToUse > 0 
              ? `Order placed successfully! ${creditsToUse} credits applied.`
              : "Order placed successfully!";
            toast.success(message);
            
            // Refresh user profile to update credit balance
            if (creditsToUse > 0) {
              // Add a small delay to ensure backend has processed the credit deduction
              setTimeout(async () => {
                await getUserProfile();
              }, 1000);
            }
            
            navigate("/orders");
            setTimeout(() => {
              setCartItems({});
            }, 500);
          } else {
            toast.error(response.data.message || "Order failed");
          }
          break;
        }
        case "stripe": {
          const responseStripe = await axios.post(`${backendUrl}/api/order/stripe`, orderData, { headers: { token } });
          if (responseStripe.data.success) {
            // For Stripe, credits are deducted immediately when order is created
            if (creditsToUse > 0) {
              await getUserProfile();
            }
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }

          break;
        }

        default:
          toast.info("Other payment methods not yet implemented.");
          break;
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      toast.error(error?.response?.data?.message || error.message || "Order failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingCart) {
    return <div className="py-10 text-center text-lg">Loading your cart...</div>;
  }

  const isCartEmpty = Object.keys(cartItems).length === 0;

  useEffect(() => {
    if (isCartEmpty) {
      toast.error("Your cart is empty");
      navigate("/");
    }
  }, [isCartEmpty, navigate]);

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-top">
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First Name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            name="zipcode"
            onChange={onChangeHandler}
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="ZipCode"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Phone Number"
        />
      </div>

      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal onCreditsChange={setCreditsToUse} />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod("stripe")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "stripe" ? "bg-green-400" : ""}`}></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div onClick={() => setMethod("razorpay")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "razorpay" ? "bg-green-400" : ""}`}></p>
              <img className="h-5 mx-4" src={assets.razorpay_logo} alt="Razorpay" />
            </div>
            <div onClick={() => setMethod("cod")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "cod" ? "bg-green-400" : ""}`}></p>
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button
              type="submit"
              disabled={getCartAmount() <= 0 || loadingCart || placingOrder}
              className="bg-black text-white px-16 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placingOrder ? "Placing Order..." : "PLACE ORDER"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
