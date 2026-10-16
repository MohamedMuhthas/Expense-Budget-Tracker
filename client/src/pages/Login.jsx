import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setSubmitting(true);
    setServerError('');
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Could not sign in. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">E</span><span>Everyday Ledger</span></div>
        <div className="auth-heading"><p className="eyebrow">Welcome back</p><h1>Good to see you.</h1><p>Sign in to pick up where you left off.</p></div>
        {serverError && <div className="error-banner" role="alert">{serverError}</div>}
        <form className="auth-form" onSubmit={submit} noValidate>
          <Input id="email" name="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} error={errors.email} />
          <Input id="password" name="password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={update} error={errors.password} />
          <Button type="submit" className="auth-submit" loading={submitting}>{submitting ? 'Signing in…' : 'Sign in'}<span aria-hidden="true">→</span></Button>
        </form>
        <p className="auth-switch">New to Everyday Ledger? <Link to="/register">Create an account</Link></p>
        <p className="auth-footnote">Your money, made a little easier to understand.</p>
      </section>
      <aside className="auth-aside"><div className="aside-orb orb-one" /><div className="aside-orb orb-two" /><div className="aside-copy"><span className="aside-kicker">A clearer view of your money</span><h2>Small steps.<br />Better money habits.</h2><p>Bring your spending, income, and monthly plans into one calm place.</p><div className="aside-stats"><span><b>01</b> Track what matters</span><span><b>02</b> Make a plan that fits</span></div></div></aside>
    </main>
  );
}
