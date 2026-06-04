
import jwt from "jsonwebtoken"
import dotenv from "dotenv";


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generates a signed JWT for a given user payload
 * @param {Object} user - User object containing id and role
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

/**
 * Verifies an incoming JWT token string
 * @param {string} token - The raw JWT token from headers
 * @returns {Object|null} Decoded payload if valid, null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; 
  }
};





 export default {generateToken,verifyToken}