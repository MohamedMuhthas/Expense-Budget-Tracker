import mongoose from 'mongoose';
import { categories } from '../utils/categories.js';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: [Number.MIN_VALUE, 'Amount must be greater than zero'] },
    category: {
      type: String,
      required: true,
      validate: {
        validator(category) {
          return categories[this.type]?.includes(category) ?? false;
        },
        message: 'Category is not valid for this transaction type',
      },
    },
    description: { type: String, trim: true, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

transactionSchema.index({ user: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);
