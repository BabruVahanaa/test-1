import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import exampleRouter from "./routes/example";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Example route
app.use("/api/example", exampleRouter);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("Please set MONGODB_URI in your .env file");
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });