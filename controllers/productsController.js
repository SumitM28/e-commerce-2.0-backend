import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import createError from "../utils/Error.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import { error } from "console";

dotenv.config();

// payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// create product controller
export const createProductController = async (req, res, next) => {
  try {
    const { name, description, price, category, quantity } = req.fields;
    const { image } = req.files;

    // validation
    switch (true) {
      case !name:
        return next(createError(500, "Name is required"));

      case !description:
        return next(createError(500, "Description is required"));

      case !price:
        return next(createError(500, "Price is required"));

      case !category:
        return next(createError(500, "Category is required"));

      case !quantity:
        return next(createError(500, "Quantity is required"));

      case !image:
        return next(createError(500, "Image is required"));
      case image.size > 1000000:
        return next(createError(500, "Image should be less than 1mb"));
    }

    const product = new productModel({
      ...req.fields,
      slug: slugify(name),
    });
    if (image) {
      product.image.data = fs.readFileSync(image.path);
      product.image.contentType = image.type;
    }

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product: product,
    });
  } catch (error) {
    return next(createError(500, "Error while creating product"));
  }
};

// update product controller
export const updateProductController = async (req, res, next) => {
  try {
    const { name, description, price, category, quantity } = req.fields;
    const { image } = req.files;

    // validation
    switch (true) {
      case !name:
        return next(createError(500, "Name is required"));

      case !description:
        return next(createError(500, "Description is required"));

      case !price:
        return next(createError(500, "Price is required"));

      case !category:
        return next(createError(500, "Category is required"));

      case !quantity:
        return next(createError(500, "Quantity is required"));

      case !image:
        return next(createError(500, "Image is required"));
      case image.size > 1000000:
        return next(createError(500, "Image should be less than 1mb"));
    }

    const product = await productModel
      .findByIdAndUpdate(
        req.params.id,
        { ...req.fields, slug: slugify(name) },
        { new: true }
      )
      .select("-image");
    if (image) {
      product.image.data = fs.readFileSync(image.path);
      product.image.contentType = image.type;
    }

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      product: product,
    });
  } catch (error) {
    return next(createError(500, "Error while updating product"));
  }
};

// delete product controller
export const deleteProductController = async (req, res, next) => {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    return next(createError(500, "Error while deleting product"));
  }
};

// get product image controller
export const getProductImageController = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id).select("image");
    if (product) {
      res.set("Content-Type", product.image.contentType);
      return res.status(200).send(product.image.data);
    }
  } catch (error) {
    return next(createError(500, "Error while getting product image"));
  }
};

// get single product controller
export const getSingleProductController = async (req, res, next) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category")
      .select("-image");
    res.status(200).send({
      success: true,
      message: "Getting Product Successfully",
      product: product,
    });
  } catch (error) {
    return next(createError(500, "Error while getting single product"));
  }
};

// get filter Product Controller
export const filterProductController = async (req, res, next) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await productModel.find(args).select("-image");
    res.status(200).send({
      success: true,
      products: products,
    });
  } catch (error) {
    return next(createError(400, "Error while getting filtered product"));
  }
};

// product pagination controller
export const ProductCountController = async (req, res, next) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total: total,
    });
  } catch (error) {
    return next(createError(400, "Error in product pagination"));
  }
};

// product list based on page
export const productListController = async (req, res, next) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-image")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      products: products,
    });
  } catch (error) {
    return next(createError(400, "Error while loading product list"));
  }
};

// search product
export const searchProductController = async (req, res, next) => {
  try {
    const keyword = req.params.keyword;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } }, // i is used to make case insensitive
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-image");
    res.status(200).send({
      success: true,
      products: results,
    });
  } catch (error) {
    return next(createError(400, "Error while search product"));
  }
};

// related products controller
export const similarProductController = async (req, res, next) => {
  try {
    const { id, categoryId } = req.params;
    const products = await productModel
      .find({
        category: categoryId,
        _id: { $ne: id },
      })
      .select("-image")
      .limit(3)
      .populate("category");

    res.status(200).send({
      success: true,
      products: products,
    });
  } catch (error) {
    return next(createError(400, "Error while getting related products"));
  }
};

// category wise products
export const productCategoryController = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await categoryModel.findOne({ slug: slug });
    const products = await productModel.find({ category }).populate("category");

    res.status(200).send({
      success: true,
      category: category,
      products: products,
    });
  } catch (error) {
    return next(createError(400, "Error while getting category wise products"));
  }
};

// get all product controller
export const getProductController = async (req, res, next) => {
  try {
    const products = await productModel
      .find({})
      .populate("category") // use to make connection between models (product model and category model)
      .select("-image")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Getting All Products Successfully",
      total: products.length,
      products: products,
    });
  } catch (error) {
    return next(createError(500, "Error while getting products"));
  }
};

// braintree token controller
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// braintree payment controller
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((item) => {
      total += item.price;
    });

    await gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (err, response) {
        if (response) {
          const order = new orderModel({
            products: cart,
            payment: response,
            buyer: req.user._id,
          });
          order.save();
          res.json({ success: true });
        } else {
          res.status(500).send(err);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
