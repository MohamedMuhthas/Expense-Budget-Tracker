import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (userId) => jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    return res.status(201).json({ token: createToken(user.id), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.status(200).json({ token: createToken(user.id), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
};

export const getMe = (req, res) => res.status(200).json({ user: publicUser(req.user) });
