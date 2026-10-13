import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axios.js';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { currentMonth, formatDate } from '../utils/date.js';
import { formatCurrency } from '../utils/currency.js';

function DashboardSkeleton() {
  return <div className="page-stack" aria-label="Loading dashboard">
    <div className="page-heading"><div><div className="skeleton skeleton-eyebrow" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-copy" /></div><div className="skeleton skeleton-month" /></div>
    <div className="summary-grid">{[1, 2, 3].map((item) => <div className="card skeleton-card" key={item}><div className="skeleton skeleton-copy" /><div className="skeleton skeleton-amount" /><div className="skeleton skeleton-copy" /></div>)}</div>
    <div className="dashboard-grid"><Card className="dashboard-panel"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-list" /></Card><Card className="dashboard-panel"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-chart" /></Card></div>
  </div>;
}

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/dashboard', { params: { month }, signal: controller.signal });
        setDashboard(data);
      } catch (requestError) {
        if (requestError.name !== 'CanceledError' && requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.data?.message || 'Could not load your dashboard. Check that the server is running.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadDashboard();
    return () => controller.abort();
  }, [month, retry]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">YOUR MONEY, AT A GLANCE</p><h1>Overview</h1><p>A clear picture of your income and spending.</p></div><label className="month-picker-label">VIEW MONTH<input className="month-picker" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label></div>
      {error && <div className="page-error" role="alert"><div><strong>Dashboard unavailable</strong><p>{error}</p></div><button className="button button-secondary" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>}
      {!error && dashboard && <>
        <div className="summary-grid">
          <Card className="summary-card summary-income"><span className="summary-label">Total income</span><strong>{formatCurrency(dashboard.totalIncome)}</strong><span className="summary-note">Income received this month</span></Card>
          <Card className="summary-card summary-expense"><span className="summary-label">Total expenses</span><strong>{formatCurrency(dashboard.totalExpense)}</strong><span className="summary-note">Expenses recorded this month</span></Card>
          <Card className={`summary-card summary-balance ${dashboard.balance < 0 ? 'summary-negative' : ''}`}><span className="summary-label">Available balance</span><strong>{formatCurrency(dashboard.balance)}</strong><span className="summary-note">Income minus expenses</span></Card>
        </div>
        <div className="dashboard-grid">
          <Card className="dashboard-panel recent-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Latest activity for {month}.</p></div><Link to="/transactions" className="text-link">View all <span aria-hidden="true">→</span></Link></div>
            {dashboard.recentTransactions?.length ? <div className="recent-list">{dashboard.recentTransactions.map((item) => <div className="recent-row" key={item._id}><span className={`transaction-symbol ${item.type}`}>{item.type === 'income' ? '↙' : '↗'}</span><div className="recent-main"><strong>{item.description || item.category}</strong><span>{item.category} · {formatDate(item.date)}</span></div><strong className={`recent-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}</strong></div>)}</div> : <EmptyState title="No transactions this month" message="Add your first income or expense to see it here." action={<Link className="text-link" to="/transactions">Go to transactions →</Link>} />}
          </Card>
          <Card className="dashboard-panel"><div className="panel-heading"><div><h2>Income &amp; expenses</h2><p>Your last six months.</p></div></div>
            {dashboard.monthlyTrend?.some((item) => item.income || item.expense) ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dashboard.monthlyTrend} margin={{ top: 12, right: 4, left: -18, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#28a879" stopOpacity={0.18} /><stop offset="95%" stopColor="#28a879" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e06c75" stopOpacity={0.17} /><stop offset="95%" stopColor="#e06c75" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#eef0f5" vertical={false} /><XAxis dataKey="month" tickFormatter={(value) => new Date(`${value}-01T00:00:00`).toLocaleDateString(undefined, { month: 'short' })} tickLine={false} axisLine={false} tick={{ fill: '#929bad', fontSize: 10 }} /><YAxis tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} tickLine={false} axisLine={false} tick={{ fill: '#929bad', fontSize: 9 }} /><Tooltip formatter={(value, name) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expenses']} labelFormatter={(label) => label} /><Area type="monotone" dataKey="income" name="income" stroke="#28a879" strokeWidth={2} fill="url(#incomeFill)" /><Area type="monotone" dataKey="expense" name="expense" stroke="#e06c75" strokeWidth={2} fill="url(#expenseFill)" /></AreaChart></ResponsiveContainer></div> : <EmptyState title="Not enough data yet" message="Your monthly comparison will appear as you add transactions." />}
          </Card>
        </div>
      </>}
    </div>
  );
}
