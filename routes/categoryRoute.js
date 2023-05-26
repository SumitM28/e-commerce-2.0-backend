import { Router } from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  categoryController,
  createCategoryController,
  deleteCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = Router();

// routes

// create route
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

// update route
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

// delete category
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

// single category
router.get("/single-category/:slug", singleCategoryController);

// get all category
router.get("/categories", categoryController);

export default router;
