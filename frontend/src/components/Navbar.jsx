const Navbar = () => {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <h2>Overview</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <strong>User Name</strong>
          <small>user@example.com</small>
        </div>
        
        {/* Avatar Circle */}
        <div style={{
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: '#007bff', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          U
        </div>
      </div>
    </nav>
  );
};

export default Navbar;