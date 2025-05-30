const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcrypt')
const Post=require('../models/Post')
const Comment=require('../models/Comment')
const verifyToken = require('../verifyToken')

// CREATE
router.post("/create",verifyToken,async (req,res)=>{
    try{
        const newComment=new Comment(req.body)
        const savedComment=await newComment.save()
        res.status(200).json(savedComment)
    }
    catch(err){
        res.status(500).json(err)
    }
     
})

//UPDATE
router.put("/:id",verifyToken,async (req,res)=>{
    try{
       
        const updatedComment=await Comment.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true})
        res.status(200).json(updatedComment)

    }
    catch(err){
        res.status(500).json(err)
    }
})


router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json("Comment not found");
      }
  
      const post = await Post.findById(comment.postId);
      
      // Allow deletion if:
      // 1. User is comment author OR
      // 2. User is admin AND owns the post
      if (req.user._id !== comment.userId && 
          !(req.user.role === "admin" && req.user._id === post.userId)) {
        return res.status(403).json("You can only delete your own comments");
      }
  
      await Comment.findByIdAndDelete(req.params.id);
      res.status(200).json("Comment deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  });


//GET POST COMMENTS
router.get("/post/:postId",async (req,res)=>{
    try{
        const comments=await Comment.find({postId:req.params.postId})
        res.status(200).json(comments)
    }
    catch(err){
        res.status(500).json(err)
    }
})


module.exports=router

