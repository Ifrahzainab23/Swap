import express from 'express';
import Order from '../models/orderModel.js';


const router = express.Router();


router.get('/summary', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    // These are your known order statuses from DB
    const statusMap = {
      placed: ['Order Placed'],
      packing: ['Packing'],
      shipped: ['Shipped'],
      out_for_delivery: ['Out for Delivery'],
      delivered: ['Delivered']
    };

    const statusCounts = {};

    // Count documents that match each status group
    for (const key in statusMap) {
      statusCounts[key] = await Order.countDocuments({
        status: { $in: statusMap[key] }
      });
    }

    // Count exchanged orders
    const totalExchanged = await Order.countDocuments({
      'exchangeRequest.requestedAt': { $exists: true }
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        ...statusCounts,
        totalExchanged
      }
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
