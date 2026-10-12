export default function Input({ label, id, error, ...props }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} className={`field-input ${error ? 'field-input-error' : ''}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
