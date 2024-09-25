import mongoose from "mongoose";

const DB_String = process.env.MONGO_URL || "";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_String);
    console.log("Successfully connected to database");
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
