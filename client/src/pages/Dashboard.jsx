import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Dashboard() {
  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">YOUR MONEY, AT A GLANCE</p><h1>Overview</h1><p>Welcome to your personal finance workspace.</p></div><span className="date-pill">Expense &amp; Budget Tracker</span></div>
      <div className="summary-grid">
        <Card className="summary-card"><span className="summary-label">Total income</span><strong>—</strong><span className="summary-note">Your income summary will appear here</span></Card>
        <Card className="summary-card"><span className="summary-label">Total expenses</span><strong>—</strong><span className="summary-note">Your spending summary will appear here</span></Card>
        <Card className="summary-card summary-card-highlight"><span className="summary-label">Available balance</span><strong>—</strong><span className="summary-note">Income minus expenses</span></Card>
      </div>
      <div className="dashboard-grid">
        <Card className="dashboard-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Your latest activity will show here.</p></div><Link to="/transactions" className="text-link">View all <span aria-hidden="true">→</span></Link></div><EmptyState title="Your activity starts here" message="Once you add a transaction, you’ll see it in this space." /></Card>
        <Card className="dashboard-panel"><div className="panel-heading"><div><h2>Monthly budget</h2><p>Keep your spending in view.</p></div><Link to="/budgets" className="text-link">View budgets <span aria-hidden="true">→</span></Link></div><div className="budget-placeholder"><span className="budget-ring"><span>—</span></span><div><strong>No budget yet</strong><p>Set a monthly budget to track your progress.</p><Link to="/budgets" className="text-link">Explore budgets →</Link></div></div></Card>
      </div>
      <Card className="dashboard-panel trend-panel"><div className="panel-heading"><div><h2>Income &amp; expenses</h2><p>A six-month view will appear when you connect dashboard data.</p></div></div><div className="trend-placeholder"><div className="trend-line" /><span>Monthly trend chart</span></div></Card>
    </div>
  );
}
