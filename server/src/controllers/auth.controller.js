import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';
import { HttpError } from '../utils/errors.js';
import { cleanString, isString, normalizeEmail, isValidEmail, validatePassword } from '../utils/validate.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const signup = async (req, res) => {
  const name = cleanString(req.body.name, 100);
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!name || !email || !password) {
    throw new HttpError(400, 'All fields are required');
  }
  if (!isValidEmail(email)) throw new HttpError(400, 'Enter a valid email address');
  validatePassword(password);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    message: 'User created successfully',
    token: generateToken(user._id),
    user: publicUser(user)
  });
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !isString(password) || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email });
  const isMatch = user ? await user.comparePassword(password) : false;
  if (!isMatch) {
    throw new HttpError(401, 'Invalid credentials');
  }

  res.json({
    message: 'Login successful',
    token: generateToken(user._id),
    user: publicUser(user)
  });
};

export const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};
