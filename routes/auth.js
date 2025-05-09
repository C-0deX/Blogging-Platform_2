const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')



// In routes/auth.js
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, img } = req.body; // Add img to destructuring
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const newUser = new User({ username, email, password: hashedPassword, img });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
  
      if (!user) return res.status(404).json("User not found");
  
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) return res.status(400).json("Wrong password");
  
      const token = jwt.sign(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        process.env.SECRET,
        { expiresIn: "3d" }
      );
  
      const { password, ...userInfo } = user._doc;
  
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 3 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({ ...userInfo, message: "Login successful" });
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

//LOGOUT
router.get("/logout", async (req, res) => {
    try {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: false, // match your login settings
          sameSite: "strict", // match your login settings
        })
        .status(200)
        .send("User logged out successfully!");
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
//REFETCH USER
router.get("/refetch", (req,res)=>{
    const token=req.cookies.token
    jwt.verify(token,process.env.SECRET,{},async (err,data)=>{
        if(err){
            return res.status(404).json(err)
        }
        res.status(200).json(data)
    })
})



module.exports=router