import mongoose from "mongoose";

const connectToDatabase = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("connected to MongoDB");
  } catch (error: unknown) {
    console.log("error connection to MongoDB:", error);
  }
};

export default connectToDatabase;