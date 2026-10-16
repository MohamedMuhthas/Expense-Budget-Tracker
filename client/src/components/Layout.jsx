import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const links = [
  { to: '/', label: 'Overview', mark: '◫', end: true },
  { to: '/transactions', label: 'Transactions', mark: '↔' },
  { to: '/budgets', label: 'Budgets', mark: '◎' },
];

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('You have been signed out.');
    navigate('/login', { replace: true });
  };

  const sidebar = (
    <>
      <div className="brand"><span className="brand-mark">E</span><span>Everyday<span className="brand-light"> Ledger</span></span></div>
      <div className="nav-caption">Workspace</div>
      <nav className="side-nav" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setDrawerOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
            <span className="nav-mark" aria-hidden="true">{link.mark}</span>{link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><span className="tip-dot" />Your finances, in focus.</div></div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>
      {drawerOpen && <button className="drawer-backdrop" aria-label="Close navigation menu" onClick={() => setDrawerOpen(false)} />}
      <aside className={`mobile-drawer ${drawerOpen ? 'mobile-drawer-open' : ''}`} aria-label="Mobile navigation">
        <button className="drawer-close" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>×</button>{sidebar}
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="hamburger" aria-label="Open navigation menu" onClick={() => setDrawerOpen(true)}><span /><span /><span /></button>
          <div className="topbar-spacer" />
          <div className="user-chip"><span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span><span className="user-name">{user?.name}</span></div>
          <button className="logout-button" onClick={handleLogout}>Log out</button>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
