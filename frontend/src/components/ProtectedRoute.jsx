import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children }) => {
  // If there is no user, redirect to the login page
  if (!user) {
    return ;
  }
  
  // If the user exists, render whatever is wrapped inside (your Layout)
  return children;
};

export default ProtectedRoute;