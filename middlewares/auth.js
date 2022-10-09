const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("user-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded) {
      return res.status(401).json({
        error: "Access denied. Invalid token.",
      });
    }

    req.user = decoded._id;
    next();
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = auth;
