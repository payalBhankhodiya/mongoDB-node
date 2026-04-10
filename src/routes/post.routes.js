import express from "express";
import { createPost, deletePost, getAllPosts, getPostById, toggleLike, updatePost } from "../controllers/post.controller.js";

const router = express.Router();



router.post("/", createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

router.post("/like/:id", toggleLike);

export default router;



