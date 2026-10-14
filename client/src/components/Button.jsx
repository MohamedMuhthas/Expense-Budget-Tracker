export default function Button({ children, className = '', variant = 'primary', loading = false, disabled = false, ...props }) {
  return (
    <button className={`button button-${variant} ${className}`} disabled={loading || disabled} {...props}>
      {loading && <span className="button-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
