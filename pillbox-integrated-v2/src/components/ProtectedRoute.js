// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// This prevents users from accessing the children of the ProtectedRoute component if they are not authenticated.
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
