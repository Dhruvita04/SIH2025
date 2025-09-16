const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY || process.env.JWT_SECRET;

const tokenAuthentication = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : null;
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      console.error("JWT verify error:", err && err.message, {
        name: err && err.name,
        message: err && err.message,
      });
      return res.status(403).json({ message: "Token is not valid" });
    }

    req.id = user.id;
    req.email = user.email;
    req.role = user.role;

    next();
  });
};
module.exports = { tokenAuthentication };
