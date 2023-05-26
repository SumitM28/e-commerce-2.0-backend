import JWT from "jsonwebtoken";
import createError from "../utils/Error.js";
import userModel from "../models/userModel.js";

// protected Routes token base
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET_KEY
    );
    // console.log(decode);
    req.user = decode;
    next();
  } catch (error) {
    return next(createError(500, "Invalid token"));
  }
};

// admin access
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ _id: req.user._id });
    if (user.isAdmin) {
      next();
    } else {
      return next(createError(401, "UnAuthorized Access"));
    }
  } catch (error) {
    return next(error);
  }
};
