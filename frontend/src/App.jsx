import React, { useEffect, useState } from 'react'; 
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'; 
import Layout from './components/Layout';
import Login from './components/Login';
import Signup from './components/Signup';

// 1. ADD THIS IMPORT (Make sure the path matches where your file is!)
import ProtectedRoute from './components/ProtectedRoute'; 

const API_URL = "http://localhost:4000";

const App = () => {
  // 2. YOU MUST DEFINE THESE VARIABLES BEFORE USING THEM IN THE RETURN BLOCK
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Placeholder functions so your Layout doesn't crash
  const handleLogout = () => setUser(null);
  const addTransaction = (data) => console.log("Add", data);
  const editTransaction = (data) => console.log("Edit", data);
  const deleteTransaction = (id) => console.log("Delete", id);
  const refreshTransactions = () => console.log("Refresh");

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<Login  />} />
        <Route path='/signup' element={<Signup  />} />

        {/* Protected Dashboard/Layout Wrapper */}
        {/* Note: I added path="/" here so this actually renders on your homepage */}
        <Route path="/" element={
          <ProtectedRoute user={user}>
            <Layout
              user={user}
              onLogout={handleLogout}
              transactions={transactions}
              addTransaction={addTransaction}
              editTransaction={editTransaction}
              deleteTransaction={deleteTransaction}
              refreshTransactions={refreshTransactions} 
            />
          </ProtectedRoute>
        } />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
};

export default App;