import { Router } from 'express';
import { body } from 'express-validator';
import { getMe, login, register } from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();
const emailRule = body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail();
const passwordRule = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

router.post(
  '/register',
  [body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'), emailRule, passwordRule],
  validate,
  register,
);
router.post(
  '/login',
  [emailRule, body('password').notEmpty().withMessage('Password is required')],
  validate,
  login,
);
router.get('/me', protect, getMe);

export default router;
