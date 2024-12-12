/* ProtectedRoute.js Brayden Gardner September 30, 2024

This is a React component for protecting routes and making sure  that only authenticated users can access certain pages.
It conditionally renders the protected sutff or redirects to the login page based on the user's authentication status.
*/


import React from 'react';
import { Navigate } from 'react-router-dom';

// This prevents users from accessing the children of the ProtectedRoute component if they are not authenticated.
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
