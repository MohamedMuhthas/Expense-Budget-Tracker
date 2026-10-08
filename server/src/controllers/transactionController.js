import Transaction from '../models/Transaction.js';
import { categories, isValidCategory } from '../utils/categories.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilters = (query, userId) => {
  const filter = { user: userId };
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.search) {
    const search = new RegExp(escapeRegex(String(query.search).trim()), 'i');
    filter.$or = [{ description: search }, { category: search }];
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    filter.amount = {};
    if (query.minAmount !== undefined) filter.amount.$gte = Number(query.minAmount);
    if (query.maxAmount !== undefined) filter.amount.$lte = Number(query.maxAmount);
  }
  return filter;
};

const sortFromQuery = (sort = '-date') => {
  const descending = sort.startsWith('-');
  return { [descending ? sort.slice(1) : sort]: descending ? -1 : 1 };
};

const toCsvCell = (value) => {
  const text = String(value ?? '');
  const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};

const sendValidationError = (res, message) => res.status(400).json({ message });

export const getCategories = (req, res) => res.status(200).json({ data: categories });

export const createTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create({ ...req.body, user: req.user.id });
    return res.status(201).json({ data: transaction });
  } catch (error) {
    return next(error);
  }
};

export const listTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, minAmount, maxAmount } = req.query;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) return sendValidationError(res, 'startDate must be before or equal to endDate');
    if (minAmount !== undefined && maxAmount !== undefined && Number(minAmount) > Number(maxAmount)) return sendValidationError(res, 'minAmount must be less than or equal to maxAmount');

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const filter = buildFilters(req.query, req.user.id);
    const [data, total] = await Promise.all([
      Transaction.find(filter).sort(sortFromQuery(req.query.sort)).skip((page - 1) * limit).limit(limit),
      Transaction.countDocuments(filter),
    ]);
    return res.status(200).json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return next(error);
  }
};

export const exportTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, minAmount, maxAmount } = req.query;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) return sendValidationError(res, 'startDate must be before or equal to endDate');
    if (minAmount !== undefined && maxAmount !== undefined && Number(minAmount) > Number(maxAmount)) return sendValidationError(res, 'minAmount must be less than or equal to maxAmount');

    const records = await Transaction.find(buildFilters(req.query, req.user.id)).sort(sortFromQuery(req.query.sort)).lean();
    const rows = [
      ['id', 'type', 'amount', 'category', 'description', 'date'],
      ...records.map((item) => [item._id, item.type, item.amount, item.category, item.description, new Date(item.date).toISOString()]),
    ];
    const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};

const findOwnedTransaction = (id, userId) => Transaction.findOne({ _id: id, user: userId });

export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await findOwnedTransaction(req.params.id, req.user.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    return res.status(200).json({ data: transaction });
  } catch (error) {
    return next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await findOwnedTransaction(req.params.id, req.user.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const type = req.body.type ?? transaction.type;
    const category = req.body.category ?? transaction.category;
    if (!isValidCategory(type, category)) return sendValidationError(res, 'Category is not valid for this transaction type');

    for (const field of ['type', 'amount', 'category', 'description', 'date']) {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    }
    await transaction.save();
    return res.status(200).json({ data: transaction });
  } catch (error) {
    return next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
