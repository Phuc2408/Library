const express = require('express');
const {
  getUserById,
  updateUserBanStatus,
  deleteUserById,
  getAllUsers
} = require('../services/userService');

const router = express.Router();

// Get user profile by user ID
router.get('/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's isBanned status
router.patch('/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const value = req.query.value === 'true';
  try {
    const updated = await updateUserBanStatus(userId, value);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User isBanned status updated successfully' });
  } catch (err) {
    console.error('Error updating isBanned:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const deleted = await deleteUserById(userId);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with role 'user'
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's name and phone
router.patch('/:id/update-info', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Thiếu name hoặc phone' });
  }

  try {
    const updated = await require('../services/userService').updateUserNameAndPhone(userId, name, phone);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Error updating name/phone:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password
const { updatePasswordById } = require('../services/userService');
const bcrypt = require('bcrypt');
router.patch('/:id/reset-password', async (req, res) => {
  const userId = parseInt(req.params.id);
  const newPassword = req.body.newPassword || '123456';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updatePasswordById(userId, hashedPassword);
  res.status(200).json({ message: 'Password reset successfully' });
});

module.exports = router;