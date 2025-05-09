const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const verifyToken = require('../verifyToken');
const isAdmin = require('../isAdmin');



// Add proper error handling for image uploads
router.post("/create", verifyToken, async (req, res) => {
    try {
        // Validate input
        if (!req.body.title || !req.body.desc || !req.body.categories) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate image if present
        if (req.body.photo && !req.body.photo.startsWith("http")) {
            return res.status(400).json({ message: "Invalid image URL" });
        }

        const newPost = new Post(req.body);
        const savedPost = await newPost.save();

        res.status(201).json(savedPost);
    } catch (err) {
        console.error("Error creating post:", err);

        // Specific error for validation failures
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation failed",
                errors: err.errors
            });
        }

        res.status(500).json({
            message: "Failed to create post",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});



router.put("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }

        // Allow admin to update any post or user to update their own
        if (post.userId.toString() !== req.user._id && req.user.role !== "admin") {
            return res.status(403).json({ error: "You can only update your own posts!" });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedPost);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ error: "Failed to update post", details: err.message });
    }
});




router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }

        // Allow admin to delete any post or user to delete their own
        if (post.userId.toString() !== req.user._id && req.user.role !== "admin") {
            return res.status(403).json({ error: "You can only delete your own posts!" });
        }

        await Post.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ postId: req.params.id });
        res.status(200).json({ message: "Post has been deleted!" });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Failed to delete post", details: err.message });
    }
});

// GET POST DETAILS (Public)
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        console.error("Error fetching post details:", err);
        res.status(500).json(err);
    }
});

// GET ALL POSTS (Public)
router.get("/", async (req, res) => {
    const query = req.query;
    try {
        const searchFilter = {
            title: { $regex: query.search, $options: "i" }
        };
        const posts = await Post.find(query.search ? searchFilter : null);
        res.status(200).json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json(err);
    }
});

// GET USER POSTS (Admin Only, Own Posts Only)
router.get("/user/:userId", verifyToken, isAdmin, async (req, res) => {
    try {
        if (req.params.userId !== req.user._id) {
            return res.status(403).json("You can only view your own posts!");
        }
        const posts = await Post.find({ userId: req.params.userId });
        res.status(200).json(posts);
    } catch (err) {
        console.error("Error fetching user posts:", err);
        res.status(500).json(err);
    }
});

module.exports = router;