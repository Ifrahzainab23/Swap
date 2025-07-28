import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: "Order Placed" },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true },

  // Credit deduction fields
  originalAmount: { type: Number }, // Original amount before credit deduction
  creditsUsed: { type: Number, default: 0 }, // Number of credits used

  // Exchange request details
  exchangeRequest: {
    size: { type: String },
    reason: { type: String },
    replacementProduct: { type: String },
    priceDifference: { type: Number },
    paymentMethod: { type: String }, // e.g., 'stripe', 'cod'
    requestedAt: { type: Date },
    exchangeStatus: { type: String, default: "Exchange Requested" }, // New field for exchange status tracking
    creditGiven: { type: Boolean, default: false }, // Track if credit has been given for this exchange
  },

  exchanged: { type: Boolean, default: false }, // <-- NEW FIELD
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
