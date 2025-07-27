import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";

const PriceAdjustmentModal = ({ priceDifference, onClose, onProceed }) => {
  const { currency } = useContext(ShopContext);
  const [selectedMethod, setSelectedMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    await onProceed(selectedMethod); // Call the parent-provided function
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded shadow-md w-[500px]">
        <h2 className="text-lg font-semibold mb-4">Price Adjustment</h2>

        {priceDifference > 0 ? (
          <>
            <p className="mb-4">
              You need to pay an additional{" "}
              <strong>
                {currency}---{priceDifference}
              </strong>{" "}
              to complete this exchange.
            </p>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Choose Payment Method:</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input type="radio" value="stripe" checked={selectedMethod === "stripe"} onChange={() => setSelectedMethod("stripe")} />
                  Pay with Stripe
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="cod" checked={selectedMethod === "cod"} onChange={() => setSelectedMethod("cod")} />
                  Pay via Cash on Delivery
                </label>
              </div>
            </div>
          </>
        ) : (
          <p className="mb-4">
            <strong>
              {currency}---{Math.abs(priceDifference)}
            </strong>{" "}
            will be added as credit points to your profile for this exchange.
          </p>
        )}

        <div className="flex justify-end gap-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-black text-white rounded" onClick={handleProceed} disabled={loading}>
            {loading ? "Processing..." : priceDifference > 0 ? (selectedMethod === "stripe" ? "Pay with Stripe" : "Pay with COD") : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceAdjustmentModal;
