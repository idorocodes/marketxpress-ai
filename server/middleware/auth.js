import jwtUtils from "../util/jwt.js"
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  const decoded = jwtUtils.verifyToken(token);
  if (!decoded) return res.status(401).json({ message: "Token is not valid" });

  req.user = decoded;
  next();
};

export default authMiddleware;