import Transaction from '../models/Transaction.js';

const toMonth = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
const monthStart = (month) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1));
};

export const getDashboard = async (req, res, next) => {
  try {
    const selectedMonth = req.query.month || toMonth(new Date());
    const selectedStart = monthStart(selectedMonth);
    const selectedEnd = new Date(Date.UTC(selectedStart.getUTCFullYear(), selectedStart.getUTCMonth() + 1, 1));
    const trendStart = new Date(Date.UTC(selectedStart.getUTCFullYear(), selectedStart.getUTCMonth() - 5, 1));
    const userId = req.user._id;

    const [totals, recentTransactions, expenseByCategory, trendRows] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: selectedStart, $lt: selectedEnd } } },
        { $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        } },
      ]),
      Transaction.find({ user: userId, date: { $gte: selectedStart, $lt: selectedEnd } }).sort({ date: -1, _id: -1 }).limit(5),
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: selectedStart, $lt: selectedEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $project: { _id: 0, category: '$_id', total: 1 } },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: trendStart, $lt: selectedEnd } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        } },
      ]),
    ]);

    const trendMap = new Map(trendRows.map((row) => [row._id, { income: row.income, expense: row.expense }]));
    const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(trendStart.getUTCFullYear(), trendStart.getUTCMonth() + index, 1));
      const month = toMonth(date);
      return { month, ...(trendMap.get(month) || { income: 0, expense: 0 }) };
    });

    const totalIncome = totals[0]?.totalIncome || 0;
    const totalExpense = totals[0]?.totalExpense || 0;
    return res.status(200).json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      recentTransactions,
      expenseByCategory,
      monthlyTrend,
    });
  } catch (error) {
    return next(error);
  }
};
