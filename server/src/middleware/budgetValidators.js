import { body, param, query } from 'express-validator';
import { categories } from '../utils/categories.js';

const validMonth = (value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export const upsertBudgetRules = [
  body('month').isString().custom(validMonth).withMessage('Month must use YYYY-MM format'),
  body('category').optional({ nullable: true }).custom((value) => categories.expense.includes(value)).withMessage('Category must be a valid expense category or null'),
  body('limit').isFloat({ gt: 0 }).withMessage('Limit must be greater than zero').toFloat(),
];

export const budgetMonthRules = [
  query('month').isString().custom(validMonth).withMessage('Month is required and must use YYYY-MM format'),
];

export const budgetIdRules = [param('id').isMongoId().withMessage('Invalid budget ID')];
