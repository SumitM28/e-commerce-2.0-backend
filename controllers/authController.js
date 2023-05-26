import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import createError from "../utils/Error.js";
import { comparePassword, hashPassword } from "../utils/authUtils.js";
import JWT from "jsonwebtoken";

// register controller
export const registerController = async (req, res, next) => {
  try {
    const { name, email, password, address, phone, question } = req.body;

    // validataion
    if (!name) {
      return next(createError(400, "Name is required"));
    }
    if (!email) {
      return next(createError(400, "Email is required"));
    }
    if (!address) {
      return next(createError(400, "Address is required"));
    }
    if (!phone) {
      return next(createError(400, "Phone is required"));
    }
    if (!question) {
      return next(createError(400, "Question is required"));
    }
    if (!password) {
      return next(createError(400, "Password is required"));
    }

    //existing user
    const existingUser = await userModel.findOne({ email: email });

    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Registered Please Login",
      });
    }

    // register user
    const hashedPassword = await hashPassword(password);
    const newUser = await new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone,
      address: address,
      question: question,
    });
    await newUser.save();

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      newUser,
    });
  } catch (error) {
    return next(createError(500, "Error in registration"));
  }
};

// login controller
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return next(createError(400, "Invalid email or password"));
    }

    // check user
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const matchPassword = await comparePassword(password, user.password);
    if (!matchPassword) {
      return next(createError(200, "Invalid Password"));
    }

    // token creation
    const token = await JWT.sign(
      { _id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        question: user.question,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    return next(createError(error.status, error.message));
  }
};

// forgot password
export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email, question, password } = req.body;
    // validation
    if (!email) {
      return next(createError(400, "Email is required"));
    }

    if (!question) {
      return next(createError(400, "Answer is required"));
    }
    if (!password) {
      return next(createError(400, "New Password is required"));
    }

    // check user
    const user = await userModel.findOne({ email, question });
    if (!user) {
      return next(createError(404, "Wrong Email or Answer"));
    }

    const hashedPassword = await hashPassword(password);
    user.updateOne({ password: hashedPassword });
    res.status(201).send({
      success: true,
      message: "Password updated successfully",
      user,
    });
  } catch (error) {
    return next(createError(error.status, error.message));
  }
};

// test controller
export const testController = (req, res, next) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    return next(error);
  }
};

// update profile controller
export const updateProfileController = async (req, res, next) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findOne({ email: email });
    console.log(password);
    // password
    if (!password) {
      return next(createError(400, "Password is required"));
    }
    if (password.length < 6) {
      return next(createError(400, "Password is too short"));
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updateUser = await userModel.findByIdAndUpdate(
      user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      user: updateUser,
    });
  } catch (error) {
    return next(createError(error.status, error.message));
  }
};

// orders
export const getOrderController = async (req, res, next) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products")
      .select("-image")
      .populate("buyer", "name");
    res.status(200).send({
      success: true,
      message: "Order product getting successfully",
      orders: orders,
    });
  } catch (error) {
    return next(createError(500, "Error while getting order"));
  }
};

// all orders controllers
export const getAllOrderController = async (req, res, next) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products")
      .select("-image")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All order products getting successfully",
      orders: orders,
    });
  } catch (error) {
    return next(createError(500, "Error while getting all orders"));
  }
};

// order status update controller
export const orderStatusController = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Order status update successfully",
      orders: order,
    });
  } catch (error) {
    return next(createError(500, "Error while updating order status"));
  }
};
