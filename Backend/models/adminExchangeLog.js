import mongoose from "mongoose";

const AdminExchangeLogSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    requestedAt: { type: Date, required: true },
    exchangeRequest: {
      size: String,
      reason: String,
      replacementProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      priceDifference: Number,
      paymentMethod: String,
      paymentCompleted: { type: Boolean, default: false },
      creditGiven: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminExchangeLog", AdminExchangeLogSchema);
