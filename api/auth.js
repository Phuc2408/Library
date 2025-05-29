const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  findUserByEmailOrUsername,
  createUser,
  checkPassword,
  getUserByUsername,
  updatePasswordById,
  getUserById
} = require('../services/userService');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const secretKey = 'your_secret_key'; // 🔐 Đổi key này trong môi trường thật

// Đăng ký tài khoản
router.post('/signup', async (req, res) => {
  const { email, username, password, name, id, phone, gender, role } = req.body;

  if (!email || !username || !password || !name || !id || !phone || !gender) {
    return res.status(400).json({ message: "All fields (email, username, password, name, id, phone, gender) are required" });
  }

  const existingUser = await findUserByEmailOrUsername(email, username);
  if (existingUser) {
    return res.status(400).json({ message: existingUser.Email === email ? "Email is already in use" : "Username is already taken" });
  }

  try {
    const newUser = await createUser(email, username, password, name, id, phone, gender, role || 'user', false);
    res.status(201).json({ message: "Signup successful", userId: newUser.UserId });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Signup failed due to a server error" });
  }
});

// Đăng nhập
router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);
    if (!user || !(await checkPassword(password, user.PasswordHash))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (user.IsBanned) {
      return res.status(403).json({ message: 'Your account is banned. Please contact support.' });
    }

    const token = jwt.sign(
      {
        userId: String(user.UserId), // ✅ ép kiểu chuỗi
        username: user.Username,
        role: user.Role
      },
      secretKey,
      { expiresIn: '1h' }
    );

    const responseData = {
      message: 'Login successful',
      token,
      user: {
        username: user.Username,
        email: user.Email,
        phone: user.Phone,
        name: user.Name,
        id: user.UserId,
        role: user.Role,
        isBanned: user.IsBanned
      }
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Server error during signin' });
  }
});

// Đổi mật khẩu
router.post('/change-password', verifyToken, async (req, res) => {
  const { password, newPassword } = req.body;
  try {
    const user = await getUserById(req.user.UserId);
    if (!user || !(await checkPassword(password, user.PasswordHash))) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePasswordById(req.user.UserId, hashedPassword);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error during changing password:', error);
    res.status(500).json({ message: 'Server error during changing password' });
  }
});

// Xác minh token
router.get('/verify', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, secretKey);
    res.status(200).json({
      valid: true,
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    });
  } catch (error) {
    console.error('Error during token verification:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
