import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

export default function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Restoring your session…" />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
