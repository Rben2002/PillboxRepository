
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MedicationCard from './MedicationCard';
import '../App.css';

const Pillbox = () => {
  // Add medications state
  const [medications, setMedications] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  // Get the medication ID from the calendar
  const medication_id_from_calendar = location.state?.medication_id;

  // useEffect here is used to fetch the pillbox data when the component mounts
  useEffect(() => {
    const fetchPillbox = async () => {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        setError('You must be logged in to view your pillbox.');
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000/get_pillbox?user_id=${user_id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error fetching pillbox');
        }

        const data = await response.json();
        setMedications(data.medications);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchPillbox();
  }, []);


  // Update medication in state
  const updateMedicationInState = (updatedMedication) => {
    setMedications((prevMedications) =>
      prevMedications.map((med) =>
        // This tell us that if the medication id is the same as the updated medication id, then return the updated medication, else return the medication
        med.id === updatedMedication.id ? updatedMedication : med
      )
    );
  };

  const removeMedicationFromState = (medicationId) => {
    setMedications((prevMedications) =>
      prevMedications.filter((med) => med.id !== medicationId)
    );
  };

  // Handle navigation from calendar
  useEffect(() => {
    //if medication_id_from_calendar is present
    if (medication_id_from_calendar) {
      // Scroll to the medication or highlight it
      const medicationElement = document.getElementById(`medication-${medication_id_from_calendar}`);
      if (medicationElement) {
        medicationElement.scrollIntoView({ behavior: 'smooth' });
        //add a highlight class
        medicationElement.classList.add('highlight');
        // Remove the highlight after some time
        setTimeout(() => {
          medicationElement.classList.remove('highlight');
        }, 2000);
      }
    }
  }, [medications, medication_id_from_calendar]);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <>
      {medications.length > 0 && (
        <div id="button">
          <button
            className="create-medication-button"
            onClick={() => navigate('/create-medication')}
          >
            Add Custom Medication
          </button>
        </div>
      )}

      <div className="pillbox">
        <h2 className="pillbox-title">Your Pillbox</h2>
        {medications.length === 0 ? (
          <div className="empty-pillbox">
            <img
              src="/pillbottle.svg"
              alt="Empty Pillbox"
              className="empty-pillbox-image"
            />
            <p className="empty-pillbox-message">Your pillbox is empty.</p>

            <div className="empty-pillbox-actions">
              <button
                className="add-medication-button"
                onClick={() => navigate('/search')}
              >
                Search for Medications
              </button>
              <p className="or-text">or</p>
              <button
                className="create-medication-button"
                onClick={() => navigate('/create-medication')}
              >
                Create a Custom Medication
              </button>
            </div>
          </div>
        ) : (
          <div className="results-container">
            {medications.map((item, index) => (
              <div key={index} id={`medication-${item.id}`}>
                <MedicationCard
                  key={index}
                  item={item}
                  isInPillbox={true} // Pass isInPillbox as true
                  updateMedicationInState={updateMedicationInState}
                  removeMedicationFromState={removeMedicationFromState}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Pillbox;
