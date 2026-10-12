import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setSubmitting(true);
    setServerError('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Could not create your account. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page auth-page-register">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">E</span><span>Everyday Ledger</span></div>
        <div className="auth-heading"><p className="eyebrow">START FRESH</p><h1>Make room for clarity.</h1><p>Create your account to begin tracking your money.</p></div>
        {serverError && <div className="error-banner" role="alert">{serverError}</div>}
        <form className="auth-form" onSubmit={submit} noValidate>
          <Input id="name" name="name" label="Your name" type="text" autoComplete="name" placeholder="Alex Morgan" value={form.name} onChange={update} error={errors.name} />
          <Input id="email" name="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} error={errors.email} />
          <Input id="password" name="password" label="Password" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={update} error={errors.password} />
          <Input id="confirmPassword" name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" placeholder="Enter your password again" value={form.confirmPassword} onChange={update} error={errors.confirmPassword} />
          <Button type="submit" className="auth-submit" loading={submitting}>{submitting ? 'Creating account…' : 'Create account'}<span aria-hidden="true">→</span></Button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="auth-footnote">Simple tools for more confident everyday choices.</p>
      </section>
      <aside className="auth-aside"><div className="aside-orb orb-one" /><div className="aside-orb orb-two" /><div className="aside-copy"><span className="aside-kicker">Your next chapter starts here</span><h2>Know where it goes.<br />Choose where it grows.</h2><p>Keep a gentle eye on everyday spending and build a budget that works for you.</p><div className="aside-stats"><span><b>01</b> Start with one expense</span><span><b>02</b> Build a habit over time</span></div></div></aside>
    </main>
  );
}
