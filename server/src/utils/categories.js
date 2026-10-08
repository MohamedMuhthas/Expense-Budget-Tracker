export const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Health', 'Entertainment', 'Education', 'Other'],
};

export const isValidCategory = (type, category) => categories[type]?.includes(category) ?? false;
