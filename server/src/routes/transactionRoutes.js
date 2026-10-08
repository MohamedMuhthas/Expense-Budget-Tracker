import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  exportTransactions,
  getTransaction,
  listTransactions,
  updateTransaction,
} from '../controllers/transactionController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createTransactionRules,
  listTransactionRules,
  transactionIdRule,
  updateTransactionRules,
} from '../middleware/transactionValidators.js';

const router = Router();

router.use(protect);
router.post('/', createTransactionRules, validate, createTransaction);
router.get('/export', listTransactionRules, validate, exportTransactions);
router.get('/', listTransactionRules, validate, listTransactions);
router.get('/:id', transactionIdRule, validate, getTransaction);
router.put('/:id', [...transactionIdRule, ...updateTransactionRules], validate, updateTransaction);
router.delete('/:id', transactionIdRule, validate, deleteTransaction);

export default router;
