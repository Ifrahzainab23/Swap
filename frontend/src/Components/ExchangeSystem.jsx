

import React, { useContext, useState, useEffect, useRef } from "react";
import PriceAdjustmentModal from "./PriceAdjustmentModel.jsx";
import { ShopContext } from "../context/ShopContext";
import useSentiment from "../hooks/useSentiment";


const ExchangeSystem = () => {
  const { orders, products, requestExchange, currency, refundCredit } = useContext(ShopContext);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [exchangeItem, setExchangeItem] = useState({ size: "", reason: "", replacementProduct: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [priceDifference, setPriceDifference] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const sizeOptions = ["Small", "Medium", "Large", "Extra Large"];
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const [replacementDropdownOpen, setReplacementDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
const { sentiment, loading: sentimentLoading } = useSentiment(exchangeItem.reason);


  const orderDropdownRef = useRef(null);
  const replacementDropdownRef = useRef(null);
  const sizeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (orderDropdownRef.current && !orderDropdownRef.current.contains(event.target)) {
        setOrderDropdownOpen(false);
      }
      if (replacementDropdownRef.current && !replacementDropdownRef.current.contains(event.target)) {
        setReplacementDropdownOpen(false);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
        setSizeDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);




  const handleExchangeSubmit = (e) => {
    e.preventDefault();

    if (!selectedOrder || !exchangeItem.reason || !exchangeItem.replacementProduct || !exchangeItem.size) {
      setErrorMessage("Please fill in all fields before submitting.");
      return;
    }

    const selectedOrderObj = orders.find((o) => o._id === selectedOrder);
    const selectedProductId = selectedOrderObj?.items?.[0]?._id;

    if (selectedProductId === exchangeItem.replacementProduct) {
      setErrorMessage("Replacement product must be different from the original product.");
      return;
    }

    const originalPrice = selectedOrderObj.items.reduce((sum, i) => sum + i.price, 0);
    const replacement = products.find((p) => p._id === exchangeItem.replacementProduct);
    const replacementPrice = replacement?.price || 0;
    const difference = replacementPrice - originalPrice;

    setPriceDifference(difference);

    if (difference !== 0) {
      setShowModal(true);
    } else {
      submitExchange();
    }
  };

  const submitExchange = async (paymentMethod = "cod") => {
    const success = await requestExchange({
      orderId: selectedOrder,
      size: exchangeItem.size,
      reason: exchangeItem.reason,
      replacementProduct: exchangeItem.replacementProduct,
      priceDifference,
      paymentMethod,
    });

    if (success) {
      setSubmitted(true);
      setExchangeItem({ size: "", reason: "", replacementProduct: "" });
      setErrorMessage("");
      setShowModal(false);
      setPriceDifference(null);
      setSelectedOrder(null);
    } else {
      setErrorMessage("Failed to submit exchange request.");
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrder(orderId);
    setExchangeItem({ size: "", reason: "", replacementProduct: "" });
    setSubmitted(false);
    setErrorMessage("");
    setOrderDropdownOpen(false);
  };

  // 🔑 Filter using order.exchanged
  const availableOrders = orders?.filter((o) => !o.exchanged || o.exchanged === false);  
  const selected = orders?.find((o) => o._id === selectedOrder);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-10">🛍️ Product Exchange Request</h1>

      {submitted && (
        <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 font-medium text-center shadow">
          ✅ Your exchange request has been submitted successfully!
        </div>
      )}

      {errorMessage && <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 font-medium text-center shadow">⚠️ {errorMessage}</div>}

      {availableOrders?.length === 0 ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded shadow text-center">You have no orders eligible for exchange.</div>
      ) : (
        <>
          <div className="mb-8" ref={orderDropdownRef}>
            <label className="block text-sm font-medium mb-2">Select Order</label>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setOrderDropdownOpen(!orderDropdownOpen);
              }}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white shadow cursor-pointer flex justify-between items-center"
            >
              {selected ? (
                <div className="flex items-center gap-3">
                  <img src={selected.items[0]?.image?.[0]} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <p className="font-medium">{selected.items.map((i) => i.name).join(", ")}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(selected.date).toLocaleDateString()} — {currency}
                      {selected.items.reduce((sum, i) => sum + i.price, 0)}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">-- Select Order --</span>
              )}
              <svg
                className={`w-4 h-4 transform transition-transform ${orderDropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {orderDropdownOpen && (
              <ul className="mt-1 absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {availableOrders.map((order) => (
                  <li
                    key={order._id}
                    onClick={() => handleSelectOrder(order._id)}
                    className="p-3 hover:bg-gray-100 flex items-center gap-3 cursor-pointer"
                  >
                    <img src={order.items[0]?.image?.[0]} className="w-10 h-10 object-cover rounded" />
                    <div>
                      <p className="font-medium text-sm">{order.items.map((i) => i.name).join(", ")}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleDateString()} — {currency}
                        {order.items.reduce((sum, i) => sum + i.price, 0)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {showModal && (
            <PriceAdjustmentModal
              priceDifference={priceDifference}
              onClose={() => setShowModal(false)}
              onProceed={(method) => submitExchange(method)}
            />
          )}

          {selectedOrder && (
            <form onSubmit={handleExchangeSubmit} className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Exchange Details</h2>

             <div className="mb-5">
  <label className="block text-sm font-medium mb-2">Reason for Exchange</label>
  <div className="relative">
    <textarea
      className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring focus:border-black"
      value={exchangeItem.reason}
      onChange={(e) => setExchangeItem({ ...exchangeItem, reason: e.target.value })}
      rows={3}
      placeholder="Explain your reason for exchanging this item..."
    />

    {/* Sentiment display directly under the input */}
    <div className="mt-2">
      {sentimentLoading && (
        <p className="text-sm text-blue-500 animate-pulse">🧠 Analyzing sentiment...</p>
      )}
      {!sentimentLoading && sentiment === "negative" && (
        <p className="text-sm text-red-600">😠 Negative sentiment — prioritize this request.</p>
      )}
      {!sentimentLoading && sentiment === "positive" && (
        <p className="text-sm text-green-600">😊 Positive sentiment — customer seems happy.</p>
      )}
      {!sentimentLoading && sentiment === "neutral" && (
        <p className="text-sm text-gray-600">😐 Neutral sentiment detected.</p>
      )}
    </div>
  </div>
</div>


              <div className="mb-5 relative" ref={replacementDropdownRef}>
                <label className="block text-sm font-medium mb-2">Replacement Product</label>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplacementDropdownOpen(!replacementDropdownOpen);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white shadow-sm cursor-pointer flex justify-between items-center"
                >
                  {exchangeItem.replacementProduct ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={products.find((p) => p._id === exchangeItem.replacementProduct)?.image?.[0]}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{products.find((p) => p._id === exchangeItem.replacementProduct)?.name}</p>
                        <p className="text-xs text-gray-500">
                          {currency}
                          {products.find((p) => p._id === exchangeItem.replacementProduct)?.price}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-- Select Replacement Product --</span>
                  )}
                  <svg className={`w-4 h-4 ${replacementDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {replacementDropdownOpen && (
                  <ul className="absolute z-20 bg-white border border-gray-300 rounded-lg shadow-md mt-1 w-full max-h-60 overflow-y-auto">
                    {products.map((product) => (
                      <li
                        key={product._id}
                        onClick={() => {
                          setExchangeItem({ ...exchangeItem, replacementProduct: product._id });
                          setReplacementDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                      >
                        <img src={product.image?.[0]} className="w-10 h-10 object-cover rounded" />
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {currency}
                            {product.price}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mb-6 relative" ref={sizeDropdownRef}>
                <label className="block text-sm font-medium mb-2">Replacement Size</label>
                <div
                  onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white cursor-pointer"
                >
                  {exchangeItem.size || "-- Select Size --"}
                </div>
                {sizeDropdownOpen && (
                  <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow mt-1">
                    {sizeOptions.map((size) => (
                      <li
                        key={size}
                        onClick={() => {
                          setExchangeItem({ ...exchangeItem, size });
                          setSizeDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {size}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button type="submit" className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold">
                Submit Exchange Request
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default ExchangeSystem;
