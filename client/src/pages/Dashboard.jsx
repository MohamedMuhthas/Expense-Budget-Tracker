import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axios.js';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { currentMonth, formatDate } from '../utils/date.js';
import { formatCurrency } from '../utils/currency.js';

const chartColors = ['#5a50cf', '#31a77d', '#e4777e', '#e3a844', '#5986cf', '#a878c8', '#48a9b4', '#ee8d51', '#8792a6'];

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
        <Card className="dashboard-panel recent-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Latest activity for {month}.</p></div><Link to="/transactions" className="text-link">View all <span aria-hidden="true">→</span></Link></div>
          {dashboard.recentTransactions?.length ? <div className="recent-list">{dashboard.recentTransactions.map((item) => <div className="recent-row" key={item._id}><span className={`transaction-symbol ${item.type}`}>{item.type === 'income' ? '↙' : '↗'}</span><div className="recent-main"><strong>{item.description || item.category}</strong><span>{item.category} · {formatDate(item.date)}</span></div><strong className={`recent-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}</strong></div>)}</div> : <EmptyState title="No transactions this month" message="Add your first income or expense to see it here." action={<Link className="text-link" to="/transactions">Go to transactions →</Link>} />}
        </Card>
        <div className="charts-grid">
          <Card className="dashboard-panel chart-card"><div className="panel-heading"><div><h2>Expenses by category</h2><p>Breakdown for {month}.</p></div></div>
            {dashboard.expenseByCategory?.length ? <div className="donut-chart" role="img" aria-label="Expense totals by category"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dashboard.expenseByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius="48%" outerRadius="76%" paddingAngle={2} stroke="none">{dashboard.expenseByCategory.map((item, index) => <Cell key={item.category} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value) => formatCurrency(value)} /><Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={7} formatter={(value) => <span className="chart-legend-label">{value}</span>} /></PieChart></ResponsiveContainer></div> : <EmptyState title="No expenses to chart" message="Expense categories will appear here after you add expenses." />}
          </Card>
          <Card className="dashboard-panel chart-card"><div className="panel-heading"><div><h2>Income vs expenses</h2><p>Your last six months.</p></div></div>
            {dashboard.monthlyTrend?.some((item) => item.income || item.expense) ? <div className="bar-chart" role="img" aria-label="Monthly income compared with expenses"><ResponsiveContainer width="100%" height="100%"><BarChart data={dashboard.monthlyTrend} margin={{ top: 12, right: 4, left: -18, bottom: 0 }} barGap={5}><CartesianGrid stroke="#eef0f5" vertical={false} /><XAxis dataKey="month" tickFormatter={(value) => new Date(`${value}-15T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' })} tickLine={false} axisLine={false} tick={{ fill: '#929bad', fontSize: 10 }} /><YAxis tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} tickLine={false} axisLine={false} tick={{ fill: '#929bad', fontSize: 9 }} /><Tooltip formatter={(value, name) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expenses']} /><Legend iconType="circle" iconSize={7} formatter={(value) => <span className="chart-legend-label">{value === 'income' ? 'Income' : 'Expenses'}</span>} /><Bar dataKey="income" name="income" fill="#31a77d" radius={[4, 4, 0, 0]} maxBarSize={24} /><Bar dataKey="expense" name="expense" fill="#e4777e" radius={[4, 4, 0, 0]} maxBarSize={24} /></BarChart></ResponsiveContainer></div> : <EmptyState title="Not enough data yet" message="Your monthly comparison will appear as you add transactions." />}
          </Card>
        </div>
      </>}
    </div>
  );
}
