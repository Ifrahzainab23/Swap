import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import adminExchangeLog from "../models/adminExchangeLog.js";


import Stripe from "stripe";
import "dotenv/config";


// placing order using COD
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const currency = "PKR";
const deliveryCharge = 200;

const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, creditsToUse = 0 } = req.body;
    const userId = req.userId; // Get userId from auth middleware

    // Get user's current credit points
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate credits to use
    if (creditsToUse > user.credit_points) {
      return res.status(400).json({ success: false, message: "Insufficient credit points" });
    }

    if (creditsToUse > amount) {
      return res.status(400).json({ success: false, message: "Credits cannot exceed order amount" });
    }

    // Calculate final amount after credit deduction
    const finalAmount = amount - creditsToUse;

    const orderData = {
      userId,
      items,
      address,
      amount: finalAmount, // Use the amount after credit deduction
      originalAmount: amount, // Store original amount for reference
      creditsUsed: creditsToUse, // Store how many credits were used
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Deduct credits from user account
    if (creditsToUse > 0) {
      await userModel.findByIdAndUpdate(userId, { 
        cartData: {},
        $inc: { credit_points: -creditsToUse },
        $push: {
          credit_history: {
            amount: -creditsToUse,
            reason: "Order Payment",
            date: new Date(),
          },
        },
      });
    } else {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    }

    res.json({ 
      success: true, 
      order: newOrder,
      creditsUsed: creditsToUse,
      finalAmount: finalAmount
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// placing order using Stripe
const placeOrderStripe = async (req, res) => {
  try {
    const { items, amount, address, creditsToUse = 0 } = req.body;
    const userId = req.userId; // Get userId from auth middleware
    const { origin } = req.headers;

    // Get user's current credit points
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate credits to use
    if (creditsToUse > user.credit_points) {
      return res.status(400).json({ success: false, message: "Insufficient credit points" });
    }

    if (creditsToUse > amount) {
      return res.status(400).json({ success: false, message: "Credits cannot exceed order amount" });
    }

    // Calculate final amount after credit deduction
    const finalAmount = amount - creditsToUse;

    const orderData = {
      userId,
      items,
      address,
      amount: finalAmount, // Use the amount after credit deduction
      originalAmount: amount, // Store original amount for reference
      creditsUsed: creditsToUse, // Store how many credits were used
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Deduct credits from user account immediately for Stripe orders
    if (creditsToUse > 0) {
      await userModel.findByIdAndUpdate(userId, { 
        $inc: { credit_points: -creditsToUse },
        $push: {
          credit_history: {
            amount: -creditsToUse,
            reason: "Order Payment (Stripe)",
            date: new Date(),
          },
        },
      });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    // Get dashboard stats
    const getDashboardStats = async (req, res) => {
      try {
        const orders = await Order.find();

        const totalOrders = orders.length;
        const newOrders = orders.filter((o) => o.status === "Pending").length;
        const shippedOrders = orders.filter((o) => o.status === "Shipped").length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({
          success: true,
          data: {
            totalOrders,
            newOrders,
            shippedOrders,
            totalRevenue,
          },
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
      }
    };

    module.exports = { getDashboardStats };

    // Add delivery charge to line items
    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: `payment`,
    });
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//verify stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    }
  } catch (error) {
    await orderModel.findByIdAndDelete(orderId);
    res.json({ success: false, message: error.message });
  }
};
// placing order using Razorpay ----empty
const placeOrderRazorpay = async (req, res) => {};

// all orders data for admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// user orders data for frontend panel
// const userOrders = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const orders = await orderModel.find({ userId });

//     res.json({ success: true, orders });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

const userOrders = async (req, res) => {
  try {
    const userId = req.userId; // Get userId from auth middleware
    const orders = await orderModel.find(
      { userId },
      "items date paymentMethod status payment exchanged exchangeRequest amount address" // include all necessary fields
    );

    res.json({ success: true, orders });
  } catch (error) {
    console.log("Error in userOrders:", error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// user requests an exchange
const requestExchange = async (req, res) => {
  try {
    const { orderId, size, reason, replacementProduct, priceDifference, paymentMethod } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Check if order has already been exchanged
    if (order.exchanged && order.exchangeRequest) {
      return res.status(400).json({ 
        success: false, 
        message: "This order has already been exchanged. You cannot exchange the same product multiple times." 
      });
    }

    // ✅ Check if order is eligible for exchange (must be delivered)
    if (order.status !== "Delivered") {
      return res.status(400).json({ 
        success: false, 
        message: "This order must be delivered before it can be exchanged." 
      });
    }

    // Save exchange request in the order
    order.exchangeRequest = {
      size,
      reason,
      replacementProduct,
      priceDifference,
      paymentMethod,
      exchangeStatus: "Exchange Requested", // Set initial status
      // paymentStatus: paymentMethod === "stripe" && priceDifference > 0 ? "pending" : "cod",
      requestedAt: new Date(),
    };

    order.exchanged = true;
    await order.save();

    // ✅ Create admin log (this part is new)
    await adminExchangeLog.create({
      orderId: order._id,
      userId: order.userId,
      userName: `${order.address?.firstName || ""} ${order.address?.lastName || ""}`.trim(),
      amount: order.amount,
      status: order.status,
      requestedAt: order.exchangeRequest.requestedAt,
      exchangeRequest: {
        size,
        reason,
        replacementProduct,
        priceDifference,
        paymentMethod,
        paymentCompleted: paymentMethod !== "stripe" || priceDifference <= 0, // true if no extra payment needed
        creditGiven: priceDifference < 0, // true if customer will get credit
      },
    });

    // Stripe payment setup (if applicable)
    if (paymentMethod === "stripe" && priceDifference > 0) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Exchange Fee",
              },
              unit_amount: priceDifference * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `https://yourfrontend.com/exchange/success`,
        cancel_url: `https://yourfrontend.com/exchange/cancel`,
        metadata: {
          orderId: order._id.toString(),
        },
      });

      return res.json({
        success: true,
        sessionUrl: session.url,
      });
    }

    res.json({
      success: true,
      message: "Exchange request submitted",
      exchangeRequest: order.exchangeRequest,
    });
  } catch (error) {
    console.error("Exchange request error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//user refunds as credit while exchange an order
const refundAsCredit = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order || !order.exchangeRequest) {
      return res.status(404).json({ success: false, message: "Order or exchange request not found" });
    }

    if (order.exchangeRequest.priceDifference >= 0) {
      return res.json({ success: false, message: "Not a refund case" });
    }

    const refundAmount = Math.abs(order.exchangeRequest.priceDifference);

    await userModel.findByIdAndUpdate(order.userId, {
      $inc: { credit_points: refundAmount },
      $push: {
        credit_history: {
          amount: refundAmount,
          reason: "Exchange Refund",
          date: new Date(),
        },
      },
    });

    order.exchangeRequest.creditGiven = true;
    await order.save();

    res.json({ success: true, message: `${currency} ${refundAmount} credited to user account` });
  } catch (err) {
    console.error("Refund as credit error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// check if order is eligible for exchange
const checkExchangeEligibility = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    const order = await orderModel.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isEligible = !order.exchanged && 
                      order.status === "Delivered"; // Only delivered orders can be exchanged

    res.json({ 
      success: true, 
      isEligible,
      message: isEligible ? "Order is eligible for exchange" : "Order is not eligible for exchange",
      reason: !isEligible ? 
        (order.exchanged ? "Already exchanged" : "Order not delivered yet") : null
    });
  } catch (error) {
    console.error("Check exchange eligibility error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// update exchange status from admin panel
const updateExchangeStatus = async (req, res) => {
  try {
    const { orderId, exchangeStatus } = req.body;
    
    console.log(`🔧 [ADMIN] Updating exchange status for order ${orderId} to ${exchangeStatus}`);
    console.log(`🔧 [ADMIN] Request body:`, req.body);
    
    const order = await orderModel.findById(orderId);
    if (!order || !order.exchangeRequest) {
      console.log(`❌ [ADMIN] Order or exchange request not found for orderId: ${orderId}`);
      return res.status(404).json({ success: false, message: "Order or exchange request not found" });
    }

    console.log(`📋 [ADMIN] Order found:`, {
      orderId: order._id,
      userId: order.userId,
      currentStatus: order.exchangeRequest.exchangeStatus,
      priceDifference: order.exchangeRequest.priceDifference,
      creditGiven: order.exchangeRequest.creditGiven,
      exchangeRequest: order.exchangeRequest
    });

    order.exchangeRequest.exchangeStatus = exchangeStatus;
    await order.save();
    console.log(`✅ [ADMIN] Status updated to: ${exchangeStatus}`);
    
    // Automatically handle credit refund when exchange is completed and there's a negative price difference
    if (exchangeStatus === "Completed" && 
        order.exchangeRequest.priceDifference < 0 && 
        !order.exchangeRequest.creditGiven) {
      
      const refundAmount = Math.abs(order.exchangeRequest.priceDifference);
      console.log(`💰 [ADMIN] Processing auto-credit: ${refundAmount} for user ${order.userId}`);
      
      const updatedUser = await userModel.findByIdAndUpdate(order.userId, {
        $inc: { credit_points: refundAmount },
        $push: {
          credit_history: {
            amount: refundAmount,
            reason: "Exchange Refund (Auto)",
            date: new Date(),
          },
        },
      }, { new: true });

      // Mark that credit has been given
      order.exchangeRequest.creditGiven = true;
      await order.save();
      
      console.log(`🎉 [ADMIN] Auto-credited ${refundAmount} to user ${order.userId} for exchange ${orderId}`);
      console.log(`💰 [ADMIN] User new credit balance: ${updatedUser.credit_points}`);
      
      // Send success response with credit info
      return res.json({ 
        success: true, 
        message: "Exchange status updated successfully and credits assigned",
        creditsAssigned: refundAmount,
        newBalance: updatedUser.credit_points
      });
    } else if (exchangeStatus === "Completed") {
      console.log(`⏭️ [ADMIN] Exchange completed but no credits assigned:`, {
        status: exchangeStatus,
        priceDiff: order.exchangeRequest.priceDifference,
        creditGiven: order.exchangeRequest.creditGiven,
        reason: order.exchangeRequest.priceDifference >= 0 ? "Positive price difference (customer pays more)" : "Credits already given"
      });
    } else {
      console.log(`⏭️ [ADMIN] Exchange not completed yet:`, {
        status: exchangeStatus,
        priceDiff: order.exchangeRequest.priceDifference,
        creditGiven: order.exchangeRequest.creditGiven
      });
    }
    
    res.json({ success: true, message: "Exchange status updated successfully" });
  } catch (error) {
    console.error("❌ [ADMIN] Update exchange status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test endpoint to manually trigger credit assignment for testing
const testExchangeCredit = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    console.log(`🧪 [TEST] Testing credit assignment for order ${orderId}`);
    
    const order = await orderModel.findById(orderId);
    if (!order || !order.exchangeRequest) {
      return res.status(404).json({ success: false, message: "Order or exchange request not found" });
    }

    console.log(`🧪 [TEST] Order details:`, {
      orderId: order._id,
      userId: order.userId,
      priceDifference: order.exchangeRequest.priceDifference,
      creditGiven: order.exchangeRequest.creditGiven,
      exchangeStatus: order.exchangeRequest.exchangeStatus
    });

    // Check if exchange is completed
    if (order.exchangeRequest.exchangeStatus !== "Completed") {
      return res.json({ 
        success: false, 
        message: `Exchange not completed yet. Current status: ${order.exchangeRequest.exchangeStatus}` 
      });
    }

    if (order.exchangeRequest.priceDifference >= 0) {
      return res.json({ 
        success: false, 
        message: `No credit to assign. Price difference is ${order.exchangeRequest.priceDifference} (positive - customer pays more)` 
      });
    }

    if (order.exchangeRequest.creditGiven) {
      return res.json({ success: false, message: "Credit already given" });
    }

    const refundAmount = Math.abs(order.exchangeRequest.priceDifference);
    console.log(`🧪 [TEST] Assigning ${refundAmount} credits to user ${order.userId}`);
    
    const updatedUser = await userModel.findByIdAndUpdate(order.userId, {
      $inc: { credit_points: refundAmount },
      $push: {
        credit_history: {
          amount: refundAmount,
          reason: "Exchange Refund (Test)",
          date: new Date(),
        },
      },
    }, { new: true });

    order.exchangeRequest.creditGiven = true;
    await order.save();
    
    console.log(`🧪 [TEST] Successfully assigned ${refundAmount} credits`);
    console.log(`🧪 [TEST] User new balance: ${updatedUser.credit_points}`);
    
    res.json({ 
      success: true, 
      message: `Test credit assignment successful: ${refundAmount} credits added`,
      userBalance: updatedUser.credit_points
    });
  } catch (error) {
    console.error("🧪 [TEST] Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, requestExchange, refundAsCredit, updateExchangeStatus, checkExchangeEligibility, testExchangeCredit };
