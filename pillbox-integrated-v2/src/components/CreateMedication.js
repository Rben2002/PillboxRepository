import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';


// This is the main component for creating a custom medication.
const CreateMedication = () => {
  const [medicationData, setMedicationData] = useState({
    brand_name: '',
    generic_name: '',
    strength: '',
    dosage_form: '',
    route: '',
    manufacturer_name: '',
    marketing_status: '',
    image_url: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();


  // This function is used to update the state when the user types in the input fields.
  const handleChange = (e) => {
    setMedicationData({
      ...medicationData,
      [e.target.name]: e.target.value,
    });
  };

  // This function is called when the user submits the form to create a medication.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      setError('You must be logged in to create a medication.');
      return;
    }

    //get the medication data from the state
    try {
      const response = await fetch('http://127.0.0.1:5000/create_medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          medication: medicationData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating medication');
      }

      // Get the response data
      const data = await response.json();
      alert(data.message);
      navigate('/pillbox');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="create-medication-container">
      <h2 className="form-title">Create Custom Medication</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="medication-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="brand_name">Brand Name<span className="required">*</span></label>
          <input
            type="text"
            name="brand_name"
            id="brand_name"
            value={medicationData.brand_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="generic_name">Generic Name<span className="required">*</span></label>
          <input
            type="text"
            name="generic_name"
            id="generic_name"
            value={medicationData.generic_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="strength">Strength</label>
            <input
              type="text"
              name="strength"
              id="strength"
              value={medicationData.strength}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dosage_form">Dosage Form</label>
            <input
              type="text"
              name="dosage_form"
              id="dosage_form"
              value={medicationData.dosage_form}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="route">Route</label>
            <input
              type="text"
              name="route"
              id="route"
              value={medicationData.route}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufacturer_name">Manufacturer Name</label>
            <input
              type="text"
              name="manufacturer_name"
              id="manufacturer_name"
              value={medicationData.manufacturer_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="marketing_status">Marketing Status</label>
          <input
            type="text"
            name="marketing_status"
            id="marketing_status"
            value={medicationData.marketing_status}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="text"
            name="image_url"
            id="image_url"
            value={medicationData.image_url}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-button">Create Medication</button>
      </form>
    </div>
  );
};

export default CreateMedication;
