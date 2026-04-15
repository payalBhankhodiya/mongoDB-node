import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";

import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import postRouter from "./src/routes/post.routes.js";
import { authMiddleware } from "./src/middleware/auth.middleware.js";
import { initSocket } from "./src/socket/socket.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/post", authMiddleware, postRouter);

const server = http.createServer(app);

initSocket(server);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


