import User from "../models/user.model.js";
import Post from "../models/post.model.js";
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("posts", "_id");
    const usersWithPostCount = await Promise.all(
      users.map(async (user) => {
        const totalPosts = await Post.countDocuments({ author: user._id });
        return {
          ...user.toObject(),
          totalPosts,
        };
      }),
    );

    res.status(200).json(usersWithPostCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("posts");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalPosts = await Post.countDocuments({ author: user._id });

    res.status(200).json({
      ...user.toObject(),
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({message: "User updated successfully", updatedUser});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await Post.deleteMany({ author: userId });

    res.status(200).json({ message: "User and posts deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
