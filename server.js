import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbConnection.js";
import formidableMiddleware from "express-formidable";
import cors from "cors";
// routers import
import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import productsRoute from "./routes/productsRoute.js";

// configure env
dotenv.config();

// initialize PORT
const PORT = process.env.PORT || 4500;

// initialize app
const app = express();

// mongodb connection
connectDB();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoute);
app.use("/api/category", categoryRoute);
app.use("/api/products", productsRoute);
app.use(formidableMiddleware());

app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Jai Shree Ram",
  });
});

// error handling using middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "!Something went wrong!";

  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

app.listen(PORT, async () => {
  console.log("server listening on port " + PORT);
});
