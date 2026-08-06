import { Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, Receipt, User, LogOut } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside style={{ width: '250px', padding: '1rem', borderRight: '1px solid #ccc', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Brand/Logo */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Tracker</h2>
      </div>
      
      {/* Main Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/income" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <Wallet size={20} /> Income
        </Link>
        <Link to="/expense" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <Receipt size={20} /> Expense
        </Link>
      </nav>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <User size={20} /> Profile
        </Link>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '1rem' }}>
          <LogOut size={20} /> Logout
        </button>
      </div>
      
    </aside>
  );
};

export default Sidebar;