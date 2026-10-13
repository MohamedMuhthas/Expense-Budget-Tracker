import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Button from './Button.jsx';
import Input from './Input.jsx';
import Spinner from './Spinner.jsx';
import { toDateInputValue } from '../utils/date.js';

const blankTransaction = () => ({ type: 'expense', amount: '', category: '', date: toDateInputValue(new Date().toISOString()), description: '' });

export default function TransactionForm({ transaction, onClose, onSaved }) {
  const [form, setForm] = useState(() => transaction ? {
    type: transaction.type,
    amount: String(transaction.amount),
    category: transaction.category,
    date: toDateInputValue(transaction.date),
    description: transaction.description || '',
  } : blankTransaction());
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/categories')
      .then(({ data }) => { if (active) setCategories(data.data); })
      .catch(() => { if (active) setServerError('Could not load categories. Close this window and try again.'); })
      .finally(() => { if (active) setLoadingCategories(false); });
    return () => { active = false; };
  }, []);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const chooseType = (type) => {
    setForm((current) => ({ ...current, type, category: '' }));
    setErrors((current) => ({ ...current, type: '', category: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.amount || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) nextErrors.amount = 'Enter an amount greater than zero.';
    if (!form.category) nextErrors.category = 'Choose a category.';
    if (!form.date || Number.isNaN(Date.parse(form.date))) nextErrors.date = 'Choose a valid date.';
    if (!form.description.trim()) nextErrors.description = 'Description is required.';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setSubmitting(true);
    setServerError('');
    const payload = { ...form, amount: Number(form.amount), date: new Date(`${form.date}T00:00:00.000Z`).toISOString() };
    try {
      if (transaction) await api.put(`/transactions/${transaction._id}`, payload);
      else await api.post('/transactions', payload);
      onSaved(transaction ? 'Transaction updated.' : 'Transaction added.');
    } catch (requestError) {
      const response = requestError.response?.data;
      setServerError(response?.message || 'Could not save this transaction. Please try again.');
      if (Array.isArray(response?.errors)) {
        setErrors(Object.fromEntries(response.errors.map((item) => [item.field, item.message])));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card transaction-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
        <div className="modal-heading"><div><p className="eyebrow">TRANSACTION DETAILS</p><h2 id="transaction-modal-title">{transaction ? 'Edit transaction' : 'Add transaction'}</h2></div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}>×</button></div>
        {serverError && <div className="error-banner modal-error" role="alert">{serverError}</div>}
        <form onSubmit={submit} className="transaction-form" noValidate>
          <div className="field"><span className="field-label">Transaction type</span><div className="type-toggle" role="group" aria-label="Transaction type">
            {['expense', 'income'].map((type) => <button key={type} type="button" className={`type-option ${form.type === type ? `type-option-${type}` : ''}`} onClick={() => chooseType(type)}>{type === 'expense' ? 'Expense' : 'Income'}</button>)}
          </div>{errors.type && <p className="field-error">{errors.type}</p>}</div>
          <Input id="transaction-amount" name="amount" label="Amount" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={form.amount} onChange={update} error={errors.amount} />
          {loadingCategories ? <Spinner label="Loading categories…" /> : <div className="field"><label className="field-label" htmlFor="transaction-category">Category</label><select id="transaction-category" name="category" className={`field-input ${errors.category ? 'field-input-error' : ''}`} value={form.category} onChange={update}><option value="">Choose a category</option>{(categories[form.type] || []).map((category) => <option key={category} value={category}>{category}</option>)}</select>{errors.category && <p className="field-error">{errors.category}</p>}</div>}
          <Input id="transaction-date" name="date" label="Date" type="date" value={form.date} onChange={update} error={errors.date} />
          <Input id="transaction-description" name="description" label="Description" type="text" placeholder="What was this for?" value={form.description} onChange={update} error={errors.description} />
          <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={submitting}>{submitting ? 'Saving…' : transaction ? 'Save changes' : 'Add transaction'}</Button></div>
        </form>
      </section>
    </div>
  );
}
