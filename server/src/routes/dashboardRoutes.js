import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { dashboardMonthRules } from '../middleware/dashboardValidators.js';

const router = Router();

router.get('/', protect, dashboardMonthRules, validate, getDashboard);

export default router;
