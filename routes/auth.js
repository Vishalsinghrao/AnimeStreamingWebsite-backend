import express from 'express';
import EmployeeModel from '../models/Employee.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv';


const router = express.Router();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await EmployeeModel.findOne({ email });

    if (!user) return res.json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, {
        httpOnly: true
      }).json("Success");
    } else {
      res.json("Invalid credentials");
    }
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err });
  }
});

router.get('/check-auth', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isLoggedIn: false });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.json({ isLoggedIn: false });
    res.json({ isLoggedIn: true, email: user.email });
  });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const newUser = await EmployeeModel.create({
      email,
      password: hashedPassword,
    });

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err });
  }
});


router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});



export default router;