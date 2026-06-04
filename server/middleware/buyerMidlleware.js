 
import jwt from 'jsonwebtoken';

export const verifyBuyer = (req, res, next) => {
  try {
  
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authorization denied" });
    }

    const token = authHeader.split(' ')[1];

 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
   
    if (decoded.role !== 'BUYER') {
      return res.status(403).json({ message: "Access denied. Vendors only." });
    }
 
    req.vendor = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};