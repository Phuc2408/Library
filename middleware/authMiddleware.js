const jwt = require('jsonwebtoken');
const { getUserById } = require('../services/userService');

const secretKey = 'your_secret_key'; // Secret key for JWT

function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.error('Token missing in request headers');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    const rawUserId = decoded.userId;

  if (!rawUserId || typeof rawUserId !== 'string') {
    console.error('Invalid or missing userId in token:', rawUserId);
    return res.status(400).json({ message: 'Invalid user data in token' });
  }
    try { 
      const user = await getUserById(decoded.userId);
      if (!user) {
        console.error('User not found in database');
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = user;
      console.log('Token verified. User:', decoded);
      next();
    } catch (e) {
      console.error('Error during user lookup:', e);
      res.status(500).json({ message: 'Server error during token verification' });
    }
  });
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.Role !== 'admin') {
    console.error(`Access denied. User role: ${req.user?.Role}`);
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  console.log('Admin access granted for user:', req.user.Username);
  next();
}

module.exports = { verifyToken, isAdmin };
