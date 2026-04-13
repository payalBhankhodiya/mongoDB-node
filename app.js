import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./src/routes/auth.routes.js"
import userRoutes from "./src/routes/user.routes.js";
import postRouter from "./src/routes/post.routes.js";
import { authMiddleware } from "./src/middleware/auth.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

  app.use("/api/auth", authRoutes);
  app.use("/api/user", authMiddleware, userRoutes);
  app.use("/api/post", authMiddleware, postRouter);


  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });