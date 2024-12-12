/* app.js Brayden Gardner Virginia Tech November 9, 2024
* This file implements a React application with user authentication and routing 
for different components such as a homepage, login, search medication, pillbox, and calendar.
*/

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/Homepage';
import Login from './components/Login';
import SearchMedication from './components/SearchMedication';
import ProtectedRoute from './components/ProtectedRoute';
import Pillbox from './components/Pillbox';
import CreateMedication from './components/CreateMedication'; 
import Calendar from './components/Calendar'; 

function App() {
  // Check if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user_id'));


  
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
  };

  return (

    <Router>
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/signup" 
          element={<Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/search" 
          element={
            isAuthenticated ? <SearchMedication /> : <Navigate to="/login" replace />
          }
        
        />
        <Route
          path="/create-medication"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreateMedication />
            </ProtectedRoute>
          }
        />
        
        {/* Protect the pillbox route */}
        <Route
          path="/pillbox"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Pillbox />
            </ProtectedRoute>
          }
        />
        {/* Calendar route */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Calendar />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
