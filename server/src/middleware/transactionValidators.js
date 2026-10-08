import { body, param, query } from 'express-validator';
import { categories, isValidCategory } from '../utils/categories.js';

const typeRule = (field) => field.isIn(['income', 'expense']).withMessage('Type must be income or expense');
const amountRule = (field) => field.isFloat({ gt: 0 }).withMessage('Amount must be greater than zero').toFloat();
const categoryRule = (field) => field.trim().notEmpty().withMessage('Category is required');
const dateRule = (field) => field.isISO8601({ strict: true }).withMessage('Date must be a valid ISO date').toDate();

const validateCategoryForType = (value, { req }) => {
  if (req.body.type && !isValidCategory(req.body.type, value)) {
    throw new Error('Category is not valid for this transaction type');
  }
  return true;
};

export const createTransactionRules = [
  typeRule(body('type')),
  amountRule(body('amount')),
  categoryRule(body('category')).custom(validateCategoryForType),
  body('description').trim().notEmpty().withMessage('Description is required'),
  dateRule(body('date')),
];

export const updateTransactionRules = [
  body('type').optional().custom((value) => ['income', 'expense'].includes(value)).withMessage('Type must be income or expense'),
  body('amount').optional().custom((value) => Number.isFinite(Number(value)) && Number(value) > 0).withMessage('Amount must be greater than zero').toFloat(),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty').custom(validateCategoryForType),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('date').optional().custom((value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(value) && !Number.isNaN(Date.parse(value))).withMessage('Date must be a valid ISO date').toDate(),
  body().custom((value) => ['type', 'amount', 'category', 'description', 'date'].some((key) => value[key] !== undefined)).withMessage('Provide at least one transaction field to update'),
];

export const transactionIdRule = [param('id').isMongoId().withMessage('Invalid transaction ID')];

export const listTransactionRules = [
  query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  query('category').optional().custom((value, { req }) => {
    if (req.query.type && !isValidCategory(req.query.type, value)) throw new Error('Category is not valid for this transaction type');
    if (!req.query.type && !Object.values(categories).flat().includes(value)) {
      throw new Error('Invalid category');
    }
    return true;
  }),
  query('startDate').optional().isISO8601({ strict: true }).withMessage('startDate must be a valid ISO date'),
  query('endDate').optional().isISO8601({ strict: true }).withMessage('endDate must be a valid ISO date'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('minAmount must be zero or greater'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('maxAmount must be zero or greater'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('sort').optional().isIn(['date', '-date', 'amount', '-amount', 'createdAt', '-createdAt']).withMessage('sort must be date, -date, amount, -amount, createdAt, or -createdAt'),
];
