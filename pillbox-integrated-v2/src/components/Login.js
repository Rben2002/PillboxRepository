/* Login.js Brayden Gardner October 7, 2024

This is a React component for dealing with user login and sign-up functionality.
It provides a form for users to input their credentials, handles form submission,
and navigates to the pillbox page when successful login/sign-up.
Features are conditional showing of form fields based on login/sign-up mode.
*/



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import '../App.css';  
import '../Login.css';  



//Brayden: I implemented this file
const Login = ({ onLogin }) => {  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();  

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoginMode) {
      // Handle login request
      try {
        const response = await fetch('http://127.0.0.1:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await response.json();
        if (response.status === 200) {
          console.log('Login successful');
          localStorage.setItem('token', 'token'); // If you have a token
          localStorage.setItem('user_id', data.user_id); // Store user ID
          onLogin();  // Update authentication state in App
          navigate('/pillbox');  // Redirect to pillbox
        } else {
          console.log('Login failed:', data.message);
          alert('Login failed: ' + data.message);
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
      }
    } else {
      // Handle sign-up request
      try {
        const response = await fetch('http://127.0.0.1:5000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),  // this sends name, age, email, password
        });

        const data = await response.json();
        if (response.status === 201) {
          console.log('Account created successfully');
          alert('Account created successfully. Please log in.');
          navigate('/login');  // this changes to login after successful sign-up
        } else if (response.status === 202) {
          console.log('Account already exists');
          alert('Account already exists. Please log in.');
          navigate('/login');  // goes  to login
        } else {
          console.log('Sign-up failed:', data.message);
          alert('Sign-up failed: ' + data.message);
        }
      } catch (error) {
        console.error('Error during sign-up:', error);
        alert('An error happened during sign-up. Please try again.');
      }
    }
  };

  return (
    <div className="container">
      <h1 className="titleLog">{isLoginMode ? 'Log In' : 'Create an Account'}</h1>
      
      <form className="form" onSubmit={handleSubmit}>
        {!isLoginMode && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="input"
              required
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="input"
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="input"
          required
        />

        <button type="submit" className="button">
          {isLoginMode ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <p className="switchText">
        {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
        <button className="switchButton" onClick={toggleMode}>
          {isLoginMode ? 'Sign Up' : 'Log In'}
        </button>
      </p>
    </div>
  );
};

export default Login;
