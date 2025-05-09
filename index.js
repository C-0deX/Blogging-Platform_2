const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
const multer=require('multer')
const path=require("path")
const cookieParser=require('cookie-parser')
const authRoute=require('./routes/auth')
const userRoute=require('./routes/users')
const postRoute=require('./routes/posts')
const commentRoute=require('./routes/comments')
dotenv.config()

//database
const connectDB=async()=>{
    try{
        console.log("MONGO_URL:", process.env.MONGO_URL);

        await mongoose.connect(process.env.MONGO_URL)
        console.log("database is connected successfully!")

    }
    catch(err){
        console.log(err)
    }
}



//middlewares
app.use(express.json())
app.use(cors({origin:"http://localhost:5173",credentials:true}))
app.use(cookieParser())
app.use("/api/auth",authRoute)
app.use("/api/users",userRoute)
app.use("/api/posts",postRoute)
app.use("/api/comments",commentRoute)
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mern-blog", // Cloudinary folder name
        allowed_formats: ["jpg", "png", "jpeg"],
        public_id: (req, file) => file.originalname.split('.')[0],
    },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        // `req.file.path` contains Cloudinary URL
        res.status(200).json({ url: req.file.path });
    } catch (err) {
        res.status(500).json(err);
    }
});

// In your index.js (backend)
// Add this route for avatar uploads
app.post("/api/upload-avatar", upload.single("file"), (req, res) => {
    try {
      res.status(200).json({ url: req.file.path });
    } catch (err) {
      res.status(500).json(err);
    }
  });


app.listen(process.env.PORT,()=>{
    connectDB()
    console.log("app is running on port "+process.env.PORT)
})