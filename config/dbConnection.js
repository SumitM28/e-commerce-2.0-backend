import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
    mongoose.set("strictQuery", false);
    console.log("database has been connect");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
