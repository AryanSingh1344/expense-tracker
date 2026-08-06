import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* Sidebar on the left */}
      <Sidebar />
      
      {/* Main content area on the right */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        
        {/* Navbar at the top of the main area */}
        <Navbar />
        
        {/* Scrollable page content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {/* The current page (Dashboard, Income, etc.) will render exactly here */}
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default Layout;