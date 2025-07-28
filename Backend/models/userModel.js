import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },

  // Add these
  credit_points: { type: Number, default: 0 },
  credit_history: [
    {
      amount: Number,
      reason: String,
      date: Date,
    }
  ]
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
