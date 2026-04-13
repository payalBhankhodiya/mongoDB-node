import User from "../models/user.model.js";
import Post from "../models/post.model.js";
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Number.parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const users = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "author",
          as: "posts",
        },
      },
      {
        $addFields: {
          totalPosts: { $size: "$posts" },
        },
      },
      {
        $project: {
          password: 0,
          posts: 0,
        },
      },

      {
        $sort: { createdAt: -1 }, // newest users first
      },

      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await User.countDocuments();

    res.status(200).json({
      data: users,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
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

    res.status(200).json({ message: "User updated successfully", updatedUser });
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

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
