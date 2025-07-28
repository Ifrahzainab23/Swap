// models/Feedback.js
import mongoose from "mongoose";


const FeedbackSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", FeedbackSchema);

