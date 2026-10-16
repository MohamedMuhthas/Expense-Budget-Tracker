import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Input from '../components/Input.jsx';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { currentMonth } from '../utils/date.js';
import { formatCurrency } from '../utils/currency.js';

function BudgetForm({ month, budget, onClose, onSaved }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(budget?.category || 'overall');
  const [limit, setLimit] = useState(budget ? String(budget.limit) : '');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [limitError, setLimitError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/categories')
      .then(({ data }) => { if (active) setCategories(data.data.expense); })
      .catch(() => { if (active) setError('Could not load budget categories. Please try again.'); })
      .finally(() => { if (active) setLoadingCategories(false); });
    return () => { active = false; };
  }, []);

  const save = async (event) => {
    event.preventDefault();
    const amount = Number(limit);
    if (!Number.isFinite(amount) || amount <= 0) {
      setLimitError('Enter a limit greater than zero.');
      return;
    }
    setSubmitting(true);
    setError('');
    setLimitError('');
    try {
      await api.post('/budgets', { month, category: category === 'overall' ? null : category, limit: amount });
      onSaved(budget ? 'Budget updated.' : 'Budget saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save this budget. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="budget-form-title">
        <div className="modal-heading"><div><p className="eyebrow">MONTHLY PLAN · {month}</p><h2 id="budget-form-title">{budget ? 'Edit budget' : 'Add a budget'}</h2></div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}>×</button></div>
        {error && <div className="error-banner modal-error" role="alert">{error}</div>}
        <form className="transaction-form" onSubmit={save} noValidate>
          <div className="field"><label className="field-label" htmlFor="budget-category">Budget category</label>{loadingCategories ? <div className="budget-category-loading"><Spinner label="Loading categories…" /></div> : <select id="budget-category" className="field-input" value={category} onChange={(event) => setCategory(event.target.value)} disabled={Boolean(budget)}><option value="overall">Overall monthly budget</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>}{budget && <span className="field-hint">To change the category, add a separate budget and remove this one.</span>}</div>
          <Input id="budget-limit" label="Monthly limit" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={limit} onChange={(event) => { setLimit(event.target.value); setLimitError(''); }} error={limitError} />
          <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={submitting} disabled={loadingCategories}>{submitting ? 'Saving…' : budget ? 'Save changes' : 'Save budget'}</Button></div>
        </form>
      </section>
    </div>
  );
}

function BudgetDeleteDialog({ budget, month, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const remove = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/budgets/${budget._id}`);
      onDeleted();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this budget. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="budget-delete-title">
        <div className="confirm-symbol">!</div><h2 id="budget-delete-title">Delete this budget?</h2><p>This removes the {budget.category || 'overall'} budget for <strong>{month}</strong>. Your transactions won’t be affected.</p>
        {error && <div className="error-banner modal-error" role="alert">{error}</div>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="button" className="danger-button" loading={deleting} onClick={remove}>{deleting ? 'Deleting…' : 'Delete budget'}</Button></div>
      </section>
    </div>
  );
}

function BudgetProgress({ budget }) {
  const status = budget.status === 'exceeded' ? 'exceeded' : budget.status === 'warning' ? 'warning' : 'ok';
  const percent = Math.max(0, Number(budget.percentUsed) || 0);
  const displayPercent = Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(1);
  const remaining = Number(budget.remaining) || 0;
  return (
    <div className="budget-progress-wrap">
      <div className="budget-progress-track" role="progressbar" aria-label={`${budget.category || 'Overall'} budget used`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(100, Math.round(percent))} aria-valuetext={`${displayPercent}% used`}>
        <span className={`budget-progress-fill ${status}`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <div className="budget-progress-text">
        <span>{formatCurrency(budget.spent)} spent <span className="budget-muted">of</span> {formatCurrency(budget.limit)} limit</span>
        <span className="budget-percent-used">{displayPercent}% used</span>
        <span className={`budget-remaining ${remaining < 0 ? 'remaining-negative' : ''}`}>
          {remaining < 0 ? `${formatCurrency(Math.abs(remaining))} over budget` : `${formatCurrency(remaining)} remaining`}
        </span>
      </div>
    </div>
  );
}

export default function Budgets() {
  const [month, setMonth] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState('all');
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [formBudget, setFormBudget] = useState(undefined);
  const [deleteBudget, setDeleteBudget] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/budgets', { params: { month }, signal: controller.signal });
        setBudgets(data.data);
      } catch (requestError) {
        if (requestError.name !== 'CanceledError' && requestError.code !== 'ERR_CANCELED') setError(requestError.response?.data?.message || 'Could not load budgets. Check that the server is running.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [month, retry]);

  const saved = (message) => {
    setFormBudget(undefined);
    setStatusFilter('all');
    setRetry((value) => value + 1);
    showToast(message);
  };

  const deleted = () => {
    setDeleteBudget(null);
    setRetry((value) => value + 1);
    showToast('Budget deleted.');
  };

  const exceeded = budgets.filter((budget) => budget.status === 'exceeded');
  const overallBudget = budgets.find((budget) => !budget.category);
  const categoryBudgets = budgets.filter((budget) => budget.category);
  const trackedLimit = overallBudget?.limit ?? categoryBudgets.reduce((total, budget) => total + budget.limit, 0);
  const trackedSpent = overallBudget?.spent ?? categoryBudgets.reduce((total, budget) => total + budget.spent, 0);
  const trackedRemaining = trackedLimit - trackedSpent;
  const statusOptions = [
    { value: 'all', label: 'All budgets' },
    { value: 'ok', label: 'On track' },
    { value: 'warning', label: 'Nearly there' },
    { value: 'exceeded', label: 'Exceeded' },
  ];
  const visibleBudgets = statusFilter === 'all'
    ? budgets
    : budgets.filter((budget) => budget.status === statusFilter);

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">Plan with purpose</p><h1>Budgets</h1><p>Set a monthly limit and keep an eye on your progress.</p></div><label className="month-picker-label">View month<input className="month-picker" type="month" value={month} onChange={(event) => { setMonth(event.target.value); setStatusFilter('all'); }} /></label></div>
      <aside className="budget-help"><strong>How budgets work</strong><p>Set a monthly spending limit. Add expenses in <b>Transactions</b> using the same month and category to update your progress.</p><div><span><i className="budget-help-dot ok" />On track: under 80%</span><span><i className="budget-help-dot warning" />Nearly there: 80–99%</span><span><i className="budget-help-dot exceeded" />Exceeded: 100% or more</span></div></aside>
      {!loading && !error && exceeded.length > 0 && <div className="budget-warning" role="status"><span className="warning-icon" aria-hidden="true">!</span><div><strong>{exceeded.length === 1 ? 'A budget has been exceeded' : `${exceeded.length} budgets have been exceeded`}</strong><p>{exceeded.map((item) => item.category || 'Overall budget').join(', ')} is at or above its monthly limit.</p></div></div>}
      {!loading && !error && budgets.length > 0 && <div className="budget-overview-grid">
        <Card className="budget-overview-card"><span>Monthly limit</span><strong>{formatCurrency(trackedLimit)}</strong><small>{overallBudget ? 'Overall monthly cap' : 'Combined category limits'}</small></Card>
        <Card className="budget-overview-card"><span>Tracked spending</span><strong>{formatCurrency(trackedSpent)}</strong><small>{overallBudget ? 'All expenses this month' : 'Expenses in budgeted categories'}</small></Card>
        <Card className={`budget-overview-card ${trackedRemaining < 0 ? 'budget-overview-negative' : ''}`}><span>{trackedRemaining < 0 ? 'Over budget' : 'Remaining'}</span><strong>{formatCurrency(Math.abs(trackedRemaining))}</strong><small>{overallBudget ? 'Overall monthly budget' : 'Across budgeted categories'}</small></Card>
      </div>}
      {!error && !loading && budgets.length > 0 && <div className="budget-toolbar"><span>{budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'} for {month}</span><Button onClick={() => setFormBudget(null)}>＋ Add budget</Button></div>}
      {!loading && !error && budgets.length > 0 && <div className="budget-filters" role="group" aria-label="Filter budgets by status">{statusOptions.map((option) => {
        const count = option.value === 'all' ? budgets.length : budgets.filter((budget) => budget.status === option.value).length;
        return <button key={option.value} className={`budget-filter ${statusFilter === option.value ? 'budget-filter-active' : ''}`} type="button" aria-pressed={statusFilter === option.value} onClick={() => setStatusFilter(option.value)}>{option.label}<span>{count}</span></button>;
      })}</div>}
      {loading && <div className="budget-list" aria-label="Loading budgets">{[1, 2, 3].map((item) => <Card className="budget-skeleton" key={item}><div className="skeleton skeleton-title" /><div className="skeleton skeleton-copy" /><div className="skeleton skeleton-list" /></Card>)}</div>}
      {error && <div className="page-error" role="alert"><div><strong>Budgets unavailable</strong><p>{error}</p></div><button className="button button-secondary" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>}
      {!loading && !error && budgets.length === 0 && <Card className="page-panel"><EmptyState title="No budgets for this month" message="Create an overall budget or set limits for individual expense categories." action={<Button onClick={() => setFormBudget(null)}>＋ Add your first budget</Button>} /></Card>}
      {!loading && !error && budgets.length > 0 && visibleBudgets.length === 0 && <Card className="page-panel"><EmptyState title="No budgets in this status" message="Choose another status filter to view your budgets." action={<Button variant="secondary" onClick={() => setStatusFilter('all')}>Show all budgets</Button>} /></Card>}
      {!loading && !error && visibleBudgets.length > 0 && <div className="budget-list">{visibleBudgets.map((budget) => <Card className="budget-card" key={budget._id}>
        <div className="budget-card-heading"><div className="budget-category-heading"><span className={`budget-category-icon ${budget.category ? '' : 'overall-icon'}`} aria-hidden="true">{budget.category ? '◇' : '◎'}</span><div><h2>{budget.category || 'Overall monthly budget'}</h2><span>{budget.category ? 'Category budget' : 'All expenses combined'}</span></div></div><div className="budget-card-actions"><span className={`budget-status ${budget.status}`}>{budget.status === 'ok' ? 'On track' : budget.status === 'warning' ? 'Nearly there' : 'Exceeded'}</span><button className="budget-action" aria-label={`Edit ${budget.category || 'overall'} budget`} onClick={() => setFormBudget(budget)}>Edit</button><button className="budget-action budget-delete-action" aria-label={`Delete ${budget.category || 'overall'} budget`} onClick={() => setDeleteBudget(budget)}>Delete</button></div></div>
        <BudgetProgress budget={budget} />
      </Card>)}</div>}
      {formBudget !== undefined && <BudgetForm month={month} budget={formBudget} onClose={() => setFormBudget(undefined)} onSaved={saved} />}
      {deleteBudget && <BudgetDeleteDialog budget={deleteBudget} month={month} onClose={() => setDeleteBudget(null)} onDeleted={deleted} />}
    </div>
  );
}
