// routes/exchangeRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel.js");
const ExchangeRequest = require("../models/ExchangeRequest.js");
const { verifyToken } = require("../middleware/auth.js"); // assuming JWT or similar
// routes/exchange.js
const { createExchangeRequest } = require("../controllers/exchangeController");
const authMiddleware = require("../middleware/auth"); // if using JWT

router.post("/exchange", authMiddleware, createExchangeRequest);

module.exports = router;

// GET /api/exchange/eligible-orders
router.get("/eligible-orders", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all exchanged orderIds by this user
    const exchangedOrders = await ExchangeRequest.find({ userId }).distinct("orderId");

    // Get all their orders that are not exchanged
    const eligibleOrders = await Order.find({
      user: userId,
      _id: { $nin: exchangedOrders },
    });

    res.json(eligibleOrders);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
