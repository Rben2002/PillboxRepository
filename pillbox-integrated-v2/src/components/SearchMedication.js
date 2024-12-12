/* SearchMedication.js Brayden Gardner November 20, 2024

This is a React component for searching medications by name.
This is what is displayed when a user wants to look up a medication.
It gets medication data from a backend API, deals with form submission, and displays search results.
Features are loading animations, error handling, and rendering "medication cards" for search endings.
*/

import React, { useState } from 'react';
import MedicationCard from './MedicationCard';
import '../App.css';


//Brayden: I implemented this file

// This component allows users to search for medication by name
const SearchMedication = () => {
  //All of these are state variables which are used to store the state of the component
  const [substanceName, setSubstanceName] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // This function is called when the user submits the search form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!substanceName.trim()) {
      setError('Please enter a medication name.');
      return;
    }

    // Reset the state
    setIsLoading(true);
    setError('');
    setResults(null);


    // Fetch medication data from the server
    try {
      const response = await fetch('http://127.0.0.1:5000/get_drug_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ substance_name: substanceName }),
      });

      if (!response.ok) {
        throw new Error('Error fetching data');
      }

      //Now we want to get the data from the response
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
      
        //The ...item is a spread operator that copies all the properties of the item object
        //.map() creates a new array with the results of calling a provided function on every element in the calling array
        const resultsWithImage = data.output.map((item) => ({
          ...item,
          image_url: data.image_url,
        }));
        setResults(resultsWithImage);
      }
    } catch (err) {
      setError('Failed to retrieve medication data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-medication-page">
      <h2 className="search-title">Search for Medication</h2>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Enter medication name"
            value={substanceName}
            onChange={(e) => setSubstanceName(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <i className="fas fa-search"></i>
          </span>
        </div>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {isLoading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {results && results.length > 0 && (
        <div className="results-container">
          {results.map((item, index) => (
            <MedicationCard
              key={index}
              item={item}
              showAddButton={true} 
            />
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <p className="no-results-message">No results found.</p>
      )}
    </div>
  );
};

export default SearchMedication;
