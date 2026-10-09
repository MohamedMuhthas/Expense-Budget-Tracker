import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

const getMonthRange = (month) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return { start: new Date(Date.UTC(year, monthNumber - 1, 1)), end: new Date(Date.UTC(year, monthNumber, 1)) };
};

const getStatus = (percentUsed) => {
  if (percentUsed >= 100) return 'exceeded';
  if (percentUsed >= 80) return 'warning';
  return 'ok';
};

export const upsertBudget = async (req, res, next) => {
  try {
    const category = req.body.category ?? null;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, month: req.body.month, category },
      { $set: { limit: req.body.limit }, $setOnInsert: { user: req.user.id, month: req.body.month, category } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return res.status(200).json({ data: budget });
  } catch (error) {
    return next(error);
  }
};

export const listBudgets = async (req, res, next) => {
  try {
    const { start, end } = getMonthRange(req.query.month);
    const [budgets, spending] = await Promise.all([
      Budget.find({ user: req.user.id, month: req.query.month }).sort({ category: 1 }),
      Transaction.aggregate([
        { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lt: end } } },
        { $group: { _id: '$category', spent: { $sum: '$amount' } } },
      ]),
    ]);

    const spentByCategory = new Map(spending.map((item) => [item._id, item.spent]));
    const totalSpent = spending.reduce((total, item) => total + item.spent, 0);
    const data = budgets.map((budget) => {
      const spent = budget.category === null ? totalSpent : (spentByCategory.get(budget.category) || 0);
      const percentUsed = (spent / budget.limit) * 100;
      return {
        ...budget.toObject(),
        spent,
        remaining: budget.limit - spent,
        percentUsed,
        status: getStatus(percentUsed),
      };
    });

    return res.status(200).json({ data, month: req.query.month });
  } catch (error) {
    return next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    return res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
