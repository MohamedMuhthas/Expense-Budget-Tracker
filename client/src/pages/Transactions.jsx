import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { useToast } from '../context/ToastContext.jsx';
import useTransactions from '../hooks/useTransactions.js';
import { formatCurrency } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('-date');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [categoriesError, setCategoriesError] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    api.get('/categories')
      .then(({ data }) => { if (active) setCategories(data.data); })
      .catch(() => { if (active) setCategoriesError('Could not load transaction categories.'); })
    return () => { active = false; };
  }, []);

  const filters = useMemo(() => ({
    search: debouncedSearch,
    type,
    category,
    startDate,
    endDate: endDate ? `${endDate}T23:59:59.999Z` : '',
    sort,
    page,
    limit: 10,
  }), [debouncedSearch, type, category, startDate, endDate, sort, page]);
  const { data: transactions, limit, total, totalPages, loading, error, refresh } = useTransactions(filters);
  const categoryOptions = type ? (categories[type] || []) : [...new Set([...categories.income, ...categories.expense])];
  const currentPageCount = Math.max(totalPages, 1);

  useEffect(() => {
    if (!loading && page > currentPageCount) setPage(currentPageCount);
  }, [loading, page, currentPageCount]);

  const changeFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const saveTransaction = (message) => {
    setFormOpen(false);
    setEditing(null);
    refresh();
    showToast(message);
  };

  const deleteTransaction = () => {
    setDeleteTarget(null);
    refresh();
    showToast('Transaction deleted.');
  };

  const exportCsv = async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([key, value]) => !['page', 'limit'].includes(key) && value !== ''));
      const { data } = await api.get('/transactions/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('CSV export downloaded.');
    } catch {
      showToast('Could not export transactions. Please try again.', 'error');
    }
  };

  const edit = (item) => { setEditing(item); setFormOpen(true); };
  const add = () => { setEditing(null); setFormOpen(true); };

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">Your activity</p><h1>Transactions</h1><p>Search, review, and organize your income and expenses.</p></div><div className="heading-actions"><Button variant="secondary" onClick={exportCsv}>↓ <span className="desktop-only">Export CSV</span><span className="mobile-only">Export</span></Button><Button onClick={add}>＋ Add transaction</Button></div></div>
      <Card className="transactions-panel">
        <div className="filter-bar">
          <div className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search transactions" value={search} placeholder="Search description or category" onChange={(event) => changeFilter(setSearch, event.target.value)} /></div>
          <select aria-label="Filter by type" className="filter-select" value={type} onChange={(event) => { changeFilter(setType, event.target.value); setCategory(''); }}><option value="">All types</option><option value="expense">Expenses</option><option value="income">Income</option></select>
          <select aria-label="Filter by category" className="filter-select" value={category} onChange={(event) => changeFilter(setCategory, event.target.value)}><option value="">All categories</option>{categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <label className="filter-date"><span>From</span><input type="date" value={startDate} onChange={(event) => changeFilter(setStartDate, event.target.value)} aria-label="Start date" /></label>
          <label className="filter-date"><span>To</span><input type="date" value={endDate} onChange={(event) => changeFilter(setEndDate, event.target.value)} aria-label="End date" /></label>
          <select aria-label="Sort transactions" className="filter-select filter-sort" value={sort} onChange={(event) => changeFilter(setSort, event.target.value)}><option value="-date">Newest first</option><option value="date">Oldest first</option><option value="-amount">Highest amount</option><option value="amount">Lowest amount</option></select>
        </div>
        {categoriesError && <p className="inline-error">{categoriesError}</p>}
        {error && <div className="page-error" role="alert"><div><strong>Transactions unavailable</strong><p>{error}</p></div><button className="button button-secondary" onClick={refresh}>Try again</button></div>}
        {loading && <div className="transactions-loading"><Spinner label="Loading transactions…" /></div>}
        {!loading && !error && transactions.length === 0 && <EmptyState title="No matching transactions" message="Try changing your filters, or add a transaction to get started." action={<Button onClick={add}>＋ Add transaction</Button>} />}
        {!loading && !error && transactions.length > 0 && <>
          <div className="desktop-table-wrap"><table className="transaction-table"><thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th>Type</th><th className="amount-cell">Amount</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{transactions.map((item) => <tr key={item._id}><td><div className="table-description"><span className={`transaction-symbol ${item.type}`}>{item.type === 'income' ? '↙' : '↗'}</span><strong>{item.description || item.category}</strong></div></td><td><span className="category-pill">{item.category}</span></td><td className="muted-cell">{formatDate(item.date)}</td><td><span className={`type-badge ${item.type}`}>{item.type}</span></td><td className={`amount-cell ${item.type}`}>{item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}</td><td><div className="row-actions"><button aria-label={`Edit ${item.description || item.category}`} onClick={() => edit(item)}>Edit</button><button className="delete-link" aria-label={`Delete ${item.description || item.category}`} onClick={() => setDeleteTarget(item)}>Delete</button></div></td></tr>)}</tbody></table></div>
          <div className="transaction-cards">{transactions.map((item) => <article className="transaction-mobile-card" key={item._id}><div className="mobile-card-top"><span className={`transaction-symbol ${item.type}`}>{item.type === 'income' ? '↙' : '↗'}</span><div className="mobile-description"><strong>{item.description || item.category}</strong><span>{item.category} · {formatDate(item.date)}</span></div><strong className={`recent-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}</strong></div><div className="mobile-card-bottom"><span className={`type-badge ${item.type}`}>{item.type}</span><div className="row-actions"><button onClick={() => edit(item)}>Edit</button><button className="delete-link" onClick={() => setDeleteTarget(item)}>Delete</button></div></div></article>)}</div>
          <div className="pagination"><span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span><div><button className="pagination-button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>← Previous</button><span className="pagination-page">{page} / {currentPageCount}</span><button className="pagination-button" disabled={page >= currentPageCount} onClick={() => setPage((value) => value + 1)}>Next →</button></div></div>
        </>}
      </Card>
      {formOpen && <TransactionForm transaction={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={saveTransaction} />}
      {deleteTarget && <ConfirmDialog transaction={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={deleteTransaction} />}
    </div>
  );
}
