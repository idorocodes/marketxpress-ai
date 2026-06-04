import { db } from "../db/db.js"; 

import bcrypt from "bcryptjs"

import jwtUtils from "../util/jwt.js"
 
const Register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
 
    const checkUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role ? role.toUpperCase() : 'BUYER';
 
    const insertQuery = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role;
    `;
    
    const { rows } = await db.query(insertQuery, [name, email, hashedPassword, userRole]);
    const newUser = rows[0];
    const token = jwtUtils.generateToken(newUser);

    res.status(201).json({ token, user: newUser });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};



export default Register