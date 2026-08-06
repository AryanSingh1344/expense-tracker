import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { formatRupee } from './utils/formatters';

// Temporary component to test the layout
const DashboardPlaceholder = () => (
  <div>
    Dashboard Active: {formatRupee(0)}
  </div>
);

function App() {
  return (
    <Routes>
      {/* The Layout component wraps all the nested routes */}
      <Route path="/" element={<Layout />}>
        {/* The "index" route renders when the path is exactly "/" */}
        <Route index element={<DashboardPlaceholder />} />
        
        <Route path="income" element={<div>Income Page coming soon</div>} />
        <Route path="expense" element={<div>Expense Page coming soon</div>} />
        <Route path="profile" element={<div>Profile Page coming soon</div>} />
      </Route>
    </Routes>
  );
}

export default App;