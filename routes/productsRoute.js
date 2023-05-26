import { Router } from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createProductController,
  deleteProductController,
  filterProductController,
  getProductController,
  ProductCountController,
  getProductImageController,
  getSingleProductController,
  updateProductController,
  productListController,
  searchProductController,
  similarProductController,
  productCategoryController,
  braintreeTokenController,
  braintreePaymentController,
} from "../controllers/productsController.js";
import formidable from "express-formidable";

const router = Router();

// routes

// create product
router.post(
  "/create-product/",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

// update product
router.put(
  "/update-product/:id",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

// delete product
router.delete("/delete-product/:id", deleteProductController);

// get single product
router.get("/get-product/:slug", getSingleProductController);

// get image for product
router.get("/product-image/:id", getProductImageController);

// filter product
router.post("/product-filter", filterProductController);

// product pagination
router.get("/product-count", ProductCountController);

// product per page
router.get("/product-list/:page", productListController);

// search product
router.get("/search-product/:keyword", searchProductController);

// similar product
router.get("/related-product/:id/:categoryId", similarProductController);

// category wise product
router.get("/product-category/:slug", productCategoryController);

// get all product
router.get("/get-product", getProductController);

// payment routes
// token
router.get("/braintree/token", braintreeTokenController);

// payment
router.post("/braintree/payment", requireSignIn, braintreePaymentController);
export default router;
