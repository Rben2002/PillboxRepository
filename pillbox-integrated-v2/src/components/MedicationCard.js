/* MedicationCard.js Ryan Kluttz, Brayden Gardner November 15, 2024

This is a React component for displaying medication information in a card format. 
This is the object that actually goes into the User's Pillbox
It provides functionality for editing, deleting, and scheduling medications, as well as adding them to a pillbox.
Features are conditional rendering of buttons and forms considering the medication's state and user permissions.
*/




import React, { useState } from 'react';
import '../App.css';




//Brayden & Ryan: Anything in this file made as calender/scheduling was made by Ryan
//Anything else was made by Brayden



// Medicaiton Card here is a reusable component that can be used to display medication information.
const MedicationCard = ({
  item,
  showAddButton = false,
  isInPillbox = false,
  updateMedicationInState,
  removeMedicationFromState,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMedication, setEditedMedication] = useState(item);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [timesInput, setTimesInput] = useState([]);
  const [dosageInput, setDosageInput] = useState('');

  //Used for calender part
  const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  //adding medication to the pillbox
  const handleAddToPillbox = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      alert('You must be logged in to add medications to your pillbox.');
      return;
    }

    //fetching the data from the server
    try {
      const response = await fetch('http://127.0.0.1:5000/add_to_pillbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          medication: item,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Problem adding medication to pillbox');
      }

      //once we get it, we will get the data from the response
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };


  //Helper functions for the edit, cancel, save and delete buttons
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedMedication(item);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMedication({ ...editedMedication, [name]: value });
  };

  const handleSaveChanges = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      alert('You must be logged in to edit medications.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/update_medication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          medication_id: item.id, //associated with the medication
          medication: editedMedication,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating medication');
      }

      const data = await response.json();
      alert(data.message);

      // Update the UI with the new medication data
      setIsEditing(false);
      if (updateMedicationInState) {
        updateMedicationInState({ ...editedMedication, id: item.id });
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this medication?')) {
      return;
    }

    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      alert('You must be logged in to delete medications.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/delete_medication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          medication_id: item.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting medication');
      }

      const data = await response.json();
      alert(data.message);

      // Remove the medication from the UI
      if (removeMedicationFromState) {
        removeMedicationFromState(item.id);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Calendar-related functions
  const handleAddToCalendarClick = () => {
    setShowScheduleForm(true);
  };


  //Functionality for the schedule form
  const handleDaysChange = (e) => {
    const value = e.target.value;
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((day) => day !== value) : [...prev, value]
    );
  };

  const handleTimesChange = (e) => {
    const options = e.target.options;
    const selectedTimes = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTimes.push(options[i].value);
      }
    }
    setTimesInput(selectedTimes);
  };

  const handleScheduleSave = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      alert('You must be logged in to schedule medications.');
      return;
    }

    if (selectedDays.length === 0 || timesInput.length === 0 || !dosageInput) {
      alert('Please fill in all schedule fields.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/add_medication_schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          medication_id: item.id,
          days_of_week: selectedDays,
          dosage: dosageInput,
          times: timesInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error adding medication schedule');
      }

      const data = await response.json();
      alert(data.message);
      setShowScheduleForm(false);
      setSelectedDays([]);
      setTimesInput([]);
      setDosageInput('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="medication-card">
      {/* Delete button is only shown if the medication is in the pillbox */}
      {isInPillbox && (
        <button onClick={handleDelete} className="delete-button">
          Delete
        </button>
      )}
      {isEditing ? (
        // Edit Mode
        <>
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor={`brand_name_${item.id}`}>Brand Name:</label>
              <input
                type="text"
                id={`brand_name_${item.id}`}
                name="brand_name"
                value={editedMedication.brand_name || ''}
                onChange={handleInputChange}
                placeholder="Brand Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`generic_name_${item.id}`}>Generic Name:</label>
              <input
                type="text"
                id={`generic_name_${item.id}`}
                name="generic_name"
                value={editedMedication.generic_name || ''}
                onChange={handleInputChange}
                placeholder="Generic Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`strength_${item.id}`}>Strength:</label>
              <input
                type="text"
                id={`strength_${item.id}`}
                name="strength"
                value={editedMedication.strength || ''}
                onChange={handleInputChange}
                placeholder="Strength"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`dosage_form_${item.id}`}>Dosage Form:</label>
              <input
                type="text"
                id={`dosage_form_${item.id}`}
                name="dosage_form"
                value={editedMedication.dosage_form || ''}
                onChange={handleInputChange}
                placeholder="Dosage Form"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`route_${item.id}`}>Route:</label>
              <input
                type="text"
                id={`route_${item.id}`}
                name="route"
                value={editedMedication.route || ''}
                onChange={handleInputChange}
                placeholder="Route"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`manufacturer_name_${item.id}`}>Manufacturer:</label>
              <input
                type="text"
                id={`manufacturer_name_${item.id}`}
                name="manufacturer_name"
                value={editedMedication.manufacturer_name || ''}
                onChange={handleInputChange}
                placeholder="Manufacturer"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`marketing_status_${item.id}`}>Marketing Status:</label>
              <input
                type="text"
                id={`marketing_status_${item.id}`}
                name="marketing_status"
                value={editedMedication.marketing_status || ''}
                onChange={handleInputChange}
                placeholder="Marketing Status"
              />
            </div>
            <div className="form-group">
              <label htmlFor={`image_url_${item.id}`}>Image URL:</label>
              <input
                type="text"
                id={`image_url_${item.id}`}
                name="image_url"
                value={editedMedication.image_url || ''}
                onChange={handleInputChange}
                placeholder="Image URL"
              />
            </div>
          </div>
          <div className="button-group">
            <button onClick={handleSaveChanges} className="save-button">
              Save Changes
            </button>
            <button onClick={handleCancelEdit} className="cancel-button">
              Cancel
            </button>
          </div>
        </>
      ) : (
        // View Mode
        <>
          <h3>{item.brand_name}</h3>
          <p>
            <strong>Generic Name:</strong> {item.generic_name}
          </p>
          <p>
            <strong>Strength:</strong> {item.strength}
          </p>
          <p>
            <strong>Dosage Form:</strong> {item.dosage_form}
          </p>
          <p>
            <strong>Route:</strong> {item.route}
          </p>
          <p>
            <strong>Manufacturer:</strong> {item.manufacturer_name}
          </p>
          <p>
            <strong>Marketing Status:</strong> {item.marketing_status}
          </p>
          {item.image_url && (
            <img src={item.image_url} alt="Medication" className="medication-image" />
          )}
          {/* Render Add to Pillbox button only if showAddButton is true */}
          {showAddButton && (
            <button onClick={handleAddToPillbox} className="add-button">
              Add to Pillbox
            </button>
          )}
          {/* Conditionally render Edit and Add to Calendar buttons */}
          {isInPillbox && (
            <>
              <button onClick={handleEditClick} className="edit-button">
                Edit
              </button>
              <button
                onClick={handleAddToCalendarClick}
                className="calendar-button"
              >
                Add to Calendar
              </button>
            </>
          )}
          {/* Schedule Form */}
          {showScheduleForm && (
            <div className="schedule-form">
              <h4>Schedule Medication</h4>
              <div className="form-group">
                <label>Days of Week:</label>
                <div className="checkbox-group">
                  {weekDays.map((day) => (
                    <label key={day}>
                      <input
                        type="checkbox"
                        value={day}
                        checked={selectedDays.includes(day)}
                        onChange={handleDaysChange}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Select Times:</label>
                <select multiple value={timesInput} onChange={handleTimesChange}>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour12 = i % 12 === 0 ? 12 : i % 12;
                    const ampm = i < 12 ? 'AM' : 'PM';
                    const timeLabel = `${hour12}:00 ${ampm}`;
                    return (
                      <option key={i} value={timeLabel}>
                        {timeLabel}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Dosage:</label>
                <input
                  type="text"
                  name="dosage"
                  value={dosageInput}
                  onChange={(e) => setDosageInput(e.target.value)}
                  placeholder="Dosage"
                />
              </div>
              <div className="button-group">
                <button onClick={handleScheduleSave} className="save-button">
                  Save Schedule
                </button>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicationCard;
