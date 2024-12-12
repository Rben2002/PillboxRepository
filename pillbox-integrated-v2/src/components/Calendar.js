// Calendar.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Calendar = () => {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        setError('You must be logged in to view your calendar.');
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/get_medication_schedules?user_id=${user_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error fetching schedules');
        }

        const data = await response.json();
        setSchedules(data.schedules);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchSchedules();
  }, []);

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  // Define days and hours in 12-hour format
  const weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Generate hours in 12-hour format with AM/PM
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour12 = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    hours.push({ hour24: i, display: `${hour12}:00 ${ampm}` });
  }

  // get calendar data
  const calendarData = {};
  weekDays.forEach((day) => {
    calendarData[day] = {};
    hours.forEach(({ hour24 }) => {
      calendarData[day][hour24] = [];
    });
  });

  // set calendar data with schedules
  schedules.forEach((schedule) => {
    const days = schedule.days_of_week.split(',');
    const times = schedule.times.split(',');

    days.forEach((day) => {
      times.forEach((time) => {
        let [hourStr, minuteStr] = time.trim().split(':');
        minuteStr = minuteStr.replace(/\s*(AM|PM)/i, '');
        let hour = parseInt(hourStr, 10);
        const ampmMatch = time.trim().match(/(AM|PM)/i);
        const ampm = ampmMatch ? ampmMatch[0].toUpperCase() : null;
        if (ampm === 'PM' && hour !== 12) {
          hour += 12;
        } else if (ampm === 'AM' && hour === 12) {
          hour = 0;
        }

        if (calendarData[day] && calendarData[day][hour]) {
          calendarData[day][hour].push({
            schedule_id: schedule.id,
            medication_name: schedule.medication_name,
            dosage: schedule.dosage,
            medication_id: schedule.medication_id,
          });
        }
      });
    });
  });

  const handleMedicationClick = (medication_id) => {
    navigate('/pillbox', { state: { medication_id } });
  };

  const handleDeleteSchedule = async (schedule_id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/delete_medication_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting schedule');
      }

      const data = await response.json();
      alert(data.message);

      // Refresh schedules
      setSchedules((prevSchedules) =>
        prevSchedules.filter((schedule) => schedule.id !== schedule_id)
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Your Medication Calendar</h2>
      <div className="calendar-grid">
        <div className="calendar-header">
          <div className="time-slot-header"></div>
          {weekDays.map((day) => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-body">
          {hours.map(({ hour24, display }) => (
            <div key={hour24} className="calendar-row">
              <div className="time-slot">{display}</div>
              {weekDays.map((day) => (
                <div key={day} className="calendar-cell">
                  {calendarData[day][hour24].map((entry, index) => (
                    <div key={index} className="calendar-entry">
                      <span
                        onClick={() => handleMedicationClick(entry.medication_id)}
                      >
                        {entry.medication_name} ({entry.dosage})
                      </span>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteSchedule(entry.schedule_id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
