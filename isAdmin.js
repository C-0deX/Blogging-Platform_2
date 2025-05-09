// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
}
  console.log("User role:", req.user?.role); // Debug log
  if (req.user?.role !== "admin") {
      console.log("Unauthorized access attempt by:", req.user?._id);
      return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = isAdmin;