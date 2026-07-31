import { NavLink } from 'react-router-dom';
import { logout } from '../api/client';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

export function Sidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch {}
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">AI Agency</div>
      <nav className="sidebar-nav">
        <NavLink to="/office" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">&#x1F3E2;</span>
          Office
        </NavLink>
        <NavLink to="/agents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">&#x1F916;</span>
          Agents
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}
