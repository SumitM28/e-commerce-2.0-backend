import createError from "../utils/Error.js";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

// create category controller
export const createCategoryController = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return next(createError(401, "Name is required"));
    }

    const existingCategory = await categoryModel.findOne({ name: name });
    if (existingCategory) {
      return next(createError(200, "Category already exists"));
    }

    const category = await new categoryModel({
      name: name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "Category Successfully Created",
      category: category,
    });
  } catch (error) {
    return next(createError(500, "Error in Category"));
  }
};

// update category controller
export const updateCategoryController = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name: name, slug: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Category Updated Successfully",
      category: category,
    });
  } catch (error) {
    return next(createError(500, "Error while updating category"));
  }
};

// delete category controller
export const deleteCategoryController = async (req, res, next) => {
  try {
    await categoryModel.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    return next(createError(500, "Error while deleting category"));
  }
};

// single category controller
export const singleCategoryController = async (req, res, next) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Get Single Category Successfully",
      category: category,
    });
  } catch (error) {
    return next(createError(500, "Error while updating single category"));
  }
};

// get all category
export const categoryController = async (req, res, next) => {
  try {
    const allcategory = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "Getting All Category Successfully",
      categories: allcategory,
    });
  } catch (error) {
    return next(createError(500, "Error while getting all category"));
  }
};
