import { useState } from 'react';
import api from '../api/axios.js';
import Button from './Button.jsx';

export default function ConfirmDialog({ transaction, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/transactions/${transaction._id}`);
      onDeleted();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this transaction. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
        <div className="confirm-symbol">!</div><h2 id="delete-title">Delete transaction?</h2><p id="delete-description">This will permanently remove <strong>{transaction.description || transaction.category}</strong> from your transactions.</p>
        {error && <div className="error-banner modal-error" role="alert">{error}</div>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="button" className="danger-button" loading={deleting} onClick={confirm}>{deleting ? 'Deleting…' : 'Delete transaction'}</Button></div>
      </section>
    </div>
  );
}
