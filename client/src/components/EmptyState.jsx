export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">◇</span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
