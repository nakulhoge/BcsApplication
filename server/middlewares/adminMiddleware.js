// adminMiddleware.js
const adminMiddleware = (req, res, next) => {
    const user = req.user;
  
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Unauthorized, User not authenticated" });
    }
  
    // Check if user is an admin
    if (user.isAdmin !== true) {
      return res.status(403).json({ message: "Forbidden, Access denied" });
    }
  
    // If user is authenticated and is an admin, proceed
    next();
  };
  
  module.exports = adminMiddleware;
  