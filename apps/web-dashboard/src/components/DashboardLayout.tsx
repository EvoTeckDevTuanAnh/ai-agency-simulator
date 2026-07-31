import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import './DashboardLayout.css';

export function DashboardLayout() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
