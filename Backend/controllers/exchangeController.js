const ExchangeRequest = require("../models/ExchangeRequest.js");

const createExchangeRequest = async (req, res) => {
  try {
    const { orderId, size, replacementProduct, reason, paymentMethod, priceDifference } = req.body;

    const newRequest = new ExchangeRequest({
      orderId,
      userId: req.user.id, // assumes auth middleware
      size,
      replacementProduct,
      reason,
      paymentMethod,
      priceDifference,
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "Exchange request submitted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createExchangeRequest };
