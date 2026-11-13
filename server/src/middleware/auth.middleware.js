import { verifyToken } from '../utils/jwt.js';
import User from '../models/user.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const header = req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      const message = error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token.';
      return res.status(401).json({ message });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

export const authenticateToken = authenticate;
