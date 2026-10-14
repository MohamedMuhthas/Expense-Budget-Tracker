export default function Toast({ message, type = 'success' }) {
  return <div className={`toast toast-${type}`} role={type === 'error' ? 'alert' : 'status'}>{message}</div>;
}
