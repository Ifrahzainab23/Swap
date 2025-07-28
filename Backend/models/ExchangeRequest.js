// models/ExchangeRequest.js
const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  size: String,
  replacementProduct: String,
  reason: { type: String, required: true },
  paymentMethod: String,
  priceDifference: Number,
  requestedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },
});

module.exports = mongoose.model("ExchangeRequest", exchangeRequestSchema);
