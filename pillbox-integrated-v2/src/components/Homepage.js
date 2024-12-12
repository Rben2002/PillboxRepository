/* Homepage.js Brayden Gardner September 30, 2024

This is a React component for the application's homepage.
It displays a brief introduction to the Pillbox application and gives a "Get Started" button to navigate to the login or pillbox page based on user authentication status.
Features are responsive styling and conditional navi.
*/



import React from 'react';
import { useNavigate } from 'react-router-dom';



//Brayden: I implemented this file
const HomePage = () => {
  const navigate = useNavigate();  // Hook for navigation

  const handleGetStarted = () => {
    //Check if we are logged in
    if(localStorage.getItem('user_id')){
      navigate('/pillbox');
    } else{
      navigate('/login')
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <h1 style={styles.title}>Pillbox</h1>
        <p style={styles.description}>
          Welcome to Pillbox! A simple way to manage your daily medications. Track your prescriptions, get reminders, and never miss a dose again!
        </p>
        <button style={styles.button} onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

//`styles` object is used to style the components
const styles = {
  background: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #6e8efb, #a777e3)', 
  },
  container: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontSize: '3.5rem',
    color: '#333',
    fontWeight: '700',
    marginBottom: '1.5rem',
    fontFamily: "'Poppins', sans-serif",
  },
  description: {
    fontSize: '1.3rem',
    color: '#555',
    marginBottom: '2.5rem',
    fontFamily: "'Open Sans', sans-serif",
  },
  button: {
    padding: '15px 30px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
};

export default HomePage;
