import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Transactions() {
  return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h1>Transactions</h1><p>Review and organize money coming in and going out.</p></div></div><Card className="page-panel"><EmptyState title="Transactions are coming soon" message="Your transaction list and filters will appear here." /></Card></div>;
}
