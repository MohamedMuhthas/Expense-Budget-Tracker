import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Budgets() {
  return <div className="page-stack"><div className="page-heading"><div><p className="eyebrow">PLAN WITH PURPOSE</p><h1>Budgets</h1><p>Set a monthly limit and keep an eye on your progress.</p></div></div><Card className="page-panel"><EmptyState title="Your budget plan starts here" message="Your monthly budgets and spending progress will appear here." /></Card></div>;
}
