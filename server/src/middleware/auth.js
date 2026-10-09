import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  const match = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '');
  if (!match) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token' });
  }

  try {
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid authentication token' });
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default protect;
