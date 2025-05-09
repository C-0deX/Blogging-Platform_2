const jwt=require('jsonwebtoken')




const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json("You are not authenticated!");
    }
    jwt.verify(token, process.env.SECRET, (err, data) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(403).json("Token has expired. Please log in again.");
            }
            return res.status(403).json("Token is not valid!");
        }
        req.user = data; // Includes _id, username, email, role
        next();
    });
};

module.exports=verifyToken;