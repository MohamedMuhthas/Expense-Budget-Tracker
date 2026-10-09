import { query } from 'express-validator';

export const dashboardMonthRules = [
  query('month').optional().isString().matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Month must use YYYY-MM format'),
];
