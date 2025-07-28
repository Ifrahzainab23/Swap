import express from "express";
import Feedback from "../models/feedbackModel.js";
import jwt from "jsonwebtoken"; // Assuming token is used
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { feedback, orderId } = req.body;
    const token = req.headers.token;

    if (!token) return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure .env is set
    const userId = decoded.id;

    const newFeedback = new Feedback({
      feedback,
      orderId,
      userId,
    });

    await newFeedback.save();

    res.status(200).json({ success: true, message: "Feedback submitted" });
  } catch (err) {
    console.error("Feedback error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
