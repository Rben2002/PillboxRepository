/* Header.js Brayden Gardner September 30, 2024

This is a React component for the application header.
It has navigation links and handles user authentication state.
Features are conditional rendering of links based on authentication status and a logout button.
*/


import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';



//Brayden: I implemented this file 
const Header = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout(); 
    navigate('/login');
  };

  return (
    <header className='header'>
      <h1 className='title'>Pillbox</h1>
      <nav>
        <Link to="/" className="nav-link">Home</Link>
        {!isAuthenticated ? (
          <Link to="/login" className="nav-link">Login</Link>
        ) : (
          <>
            <Link to="/pillbox" className="nav-link">Pillbox</Link>
            <Link to="/search" className="nav-link">Search Medications</Link>
            <Link to="/calendar" className="nav-link">Calendar</Link> {}
            <button onClick={handleLogoutClick} className="nav-link">Logout</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;

