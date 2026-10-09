import mongoose from 'mongoose';
import { categories } from '../utils/categories.js';

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    category: {
      type: String,
      default: null,
      validate: {
        validator(value) {
          return value === null || categories.expense.includes(value);
        },
        message: 'Budget category must be a valid expense category or null',
      },
    },
    limit: { type: Number, required: true, min: [Number.MIN_VALUE, 'Limit must be greater than zero'] },
  },
  { timestamps: true },
);

budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
