import { Router } from 'express';
import { deleteBudget, listBudgets, upsertBudget } from '../controllers/budgetController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { budgetIdRules, budgetMonthRules, upsertBudgetRules } from '../middleware/budgetValidators.js';

const router = Router();

router.use(protect);
router.post('/', upsertBudgetRules, validate, upsertBudget);
router.get('/', budgetMonthRules, validate, listBudgets);
router.delete('/:id', budgetIdRules, validate, deleteBudget);

export default router;
