import Post from "../models/post.model.js";
import User from "../models/user.model.js";

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

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username");

    
    const postsWithLikes = posts.map(post => ({
      ...post.toObject(),
      likeCount: post.likes.length, 
    }));

    res.status(200).json(postsWithLikes);
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

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
