import express from "express";
import productController from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// Admin: Add Product
productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  productController.addProduct
);

// Admin: Remove Product
productRouter.post("/remove", adminAuth, productController.removeProduct);

// Public: Get Single Product
productRouter.post("/single", productController.singleProduct);

// Public: List Products
productRouter.get("/list", productController.listProducts);

export default productRouter;
