const currencyCode = import.meta.env.VITE_CURRENCY || 'USD';

const formatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: currencyCode,
  maximumFractionDigits: 2,
});

export const formatCurrency = (amount) => formatter.format(Number(amount) || 0);
