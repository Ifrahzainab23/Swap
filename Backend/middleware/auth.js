import jwt from "jsonwebtoken";

// /Remove the arrow function wrapper const authUser = async () => (req, res, next) => {

const authUser = async (req, res, next) => {
  // const { token } = req.header;
  const token = req.headers.token; // fix: headers.token not req.header

  console.log("🔐 [AUTH] Checking authentication...");
  console.log("🔐 [AUTH] Headers:", Object.keys(req.headers));
  console.log("🔐 [AUTH] Token present:", !!token);
  console.log("🔐 [AUTH] JWT_SECRET present:", !!process.env.JWT_SECRET);

  if (!token) {
    console.log("❌ [AUTH] No token provided");
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [AUTH] Token verified successfully, userId:", token_decode.id);
    req.userId = token_decode.id; // Set userId directly on req object
    req.body.userId = token_decode.id; // Also keep for backward compatibility
    next();
  } catch (error) {
    console.log("❌ [AUTH] Token verification failed:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
