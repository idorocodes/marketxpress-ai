 import { db } from '../../db/db.js'; 
import bcrypt from 'bcryptjs';
import  jwtUtils  from "../../util/jwt.js";

 const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

 
    const queryText = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
    const { rows } = await db.query(queryText, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

 
    const token = jwtUtils.generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,  
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};


export default Login 