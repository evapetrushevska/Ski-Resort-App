import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, getRoleIdByName, createUser } from '../db/database.js';

const router = express.Router();

// POST /auth/register
const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
      res.status(400).json({ success: false, message: "First name, last name, email and password are required." });
      return;
    }

    const existingUsers = await findUserByEmail(email.trim());
    if (existingUsers.length > 0) {
      res.status(409).json({ success: false, message: "A user with this email already exists." });
      return;
    }

    const roleId = await getRoleIdByName("visitor");
    if (!roleId) {
      res.status(500).json({ success: false, message: "Visitor role not found in database." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await createUser(firstName.trim(), lastName.trim(), email.trim(), hashedPassword, roleId);

    if (result.affectedRows === 1) {
      res.status(201).json({ success: true, message: "User registered successfully." });
      return;
    }

    res.status(500).json({ success: false, message: "User was not registered." });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    const users = await findUserByEmail(email.trim());
    if (users.length === 0) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const user = users[0];
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role_name,
      },
    });
  } catch (error) {
    next(error);
  }
};

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;