import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
} from "../controllers/user.controller.js";

const router = express.Router();


router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);

export default router;