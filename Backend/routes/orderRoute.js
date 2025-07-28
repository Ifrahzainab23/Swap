import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  requestExchange,
  refundAsCredit,
  updateExchangeStatus,
  checkExchangeEligibility,
  testExchangeCredit,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import orderModel from "../models/orderModel.js";

const orderRouter = express.Router();

// admin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/exchange-status", adminAuth, updateExchangeStatus);
orderRouter.post("/test-exchange-credit", adminAuth, testExchangeCredit);

// public endpoint to check if there are any orders (for debugging)
orderRouter.get("/count", async (req, res) => {
  try {
    const count = await orderModel.countDocuments();
    res.json({ success: true, count, message: `Total orders in database: ${count}` });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Debug endpoint to test authentication
orderRouter.post("/test-auth", authUser, (req, res) => {
  res.json({ 
    success: true, 
    message: "Authentication successful", 
    userId: req.userId,
    token: req.headers.token ? req.headers.token.substring(0, 20) + "..." : "No token"
  });
});

// payment features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);
// admin dashboard

// exchange feature
orderRouter.post("/request-exchange", authUser, requestExchange);
orderRouter.post("/refund-credit", authUser, refundAsCredit);
orderRouter.post("/check-exchange-eligibility", authUser, checkExchangeEligibility);


// user feature
orderRouter.post("/userorders", authUser, userOrders);

//verify payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);
export default orderRouter;
