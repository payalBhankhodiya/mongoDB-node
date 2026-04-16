import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socket/socket.js";
import { sendNotification } from "../utils/sendNotification.js";

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user._id,
    });

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { posts: post._id } },
      { new: true },
    );
    getIO().emit("postCreated", post);
    getIO().to(req.user._id.toString()).emit("postCreated", post);

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("author", "username")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // latest posts first

    const postsWithLikes = posts.map((post) => ({
      ...post.toObject(),
      likeCount: post.likes.length,
    }));

    const total = await Post.countDocuments();

    res.status(200).json({
      data: postsWithLikes,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({
      ...post.toObject(),
      likeCount: post.likes.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      {
        _id: req.params.id,
        author: req.user._id,
      },
      req.body,
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const deletePost = async (req, res) => {
  try {
    const userId = req.params.id;

    const post = await Post.findOneAndDelete(userId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await User.findByIdAndUpdate(userId, { $pull: { posts: post._id } });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userId = req.user._id.toString();

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // UNLIKE
      post.likes.pull(userId);
    } else {
      // LIKE
      post.likes.push(userId);
      
      // Send notification
      if (post.author.toString() !== userId.toString()) {
        try {
          await sendNotification({
            recipient: post.author,
            sender: userId,
            type: "like",
            post: post._id,
          });
        } catch (err) {
          console.log("Notification error:", err.message);
        }
      }
    }

    await post.save();

    const io = getIO();

    io.to(post.author.toString()).emit("postLiked", {
      postId: post._id,
      likes: post.likes,
    });

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
