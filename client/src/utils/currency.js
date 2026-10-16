const formatter = new Intl.NumberFormat(undefined, {
  style: 'decimal',
  maximumFractionDigits: 2,
});

export const formatCurrency = (amount) => `Rs ${formatter.format(Number(amount) || 0)}`;
