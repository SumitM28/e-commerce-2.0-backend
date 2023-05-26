import { Router } from "express";
import {
  forgotPasswordController,
  getAllOrderController,
  getOrderController,
  loginController,
  orderStatusController,
  registerController,
  testController,
  updateProfileController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
const router = Router();

// register
router.post("/register", registerController);

// login
router.post("/login", loginController);

// forgot password

router.post("/forgot-password", forgotPasswordController);

// test route
router.get("/test", requireSignIn, isAdmin, testController);

// protected user route auth
router.get("/user-auth", requireSignIn, (req, res, next) => {
  res.status(200).send({
    ok: true,
  });
});

// update profile
router.put("/profile", updateProfileController);

// protected admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res, next) => {
  res.status(200).send({
    ok: true,
  });
});

// order
router.get("/orders", requireSignIn, getOrderController);

// all order
router.get("/all-orders", requireSignIn, isAdmin, getAllOrderController);

// update order status
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
