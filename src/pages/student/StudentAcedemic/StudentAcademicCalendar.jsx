import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StudentAcademicCalendar.scss";

const StudentAcademicCalendar = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [instituteId, setInstituteId] = useState("");
  const [availableCalendars, setAvailableCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.instituteId) {
      setInstituteId(user.instituteId);
    } else {
      setMessage("Institute ID not found. Please login again.");
    }
  }, []);

  useEffect(() => {
    if (!instituteId) return;

    const loadCalendars = async () => {
      setIsLoading(true);
      try {
        // First get all available calendars
        const calendarsRes = await axios.get(
          `http://localhost:5000/calendar/${instituteId}/all`
        );

        if (calendarsRes.data.length > 0) {
          setAvailableCalendars(calendarsRes.data);
          
          // Find the most recent calendar by default
          const mostRecent = calendarsRes.data.reduce((prev, current) => 
            new Date(current.updatedAt) > new Date(prev.updatedAt) ? current : prev
          );
          setSelectedCalendarId(mostRecent._id);

          // Filter for current year
          const filtered = mostRecent.calendar.filter(dateObj => 
            new Date(dateObj.date).getFullYear() === currentYear
          );

          setCalendarData(filtered);
          setMessage(`Loaded calendar updated at ${new Date(mostRecent.updatedAt).toLocaleString()}`);
        } else {
          setMessage("No calendar data available");
          setCalendarData([]);
        }
      } catch (error) {
        console.error("Error loading calendars", error);
        setMessage("Failed to load academic calendar");
        setCalendarData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendars();
  }, [instituteId]);

  useEffect(() => {
    if (!selectedCalendarId || !availableCalendars.length) return;

    const loadSelectedCalendar = async () => {
      setIsLoading(true);
      try {
        const selectedCalendar = availableCalendars.find(c => c._id === selectedCalendarId);
        if (selectedCalendar) {
          const filtered = selectedCalendar.calendar.filter(dateObj => 
            new Date(dateObj.date).getFullYear() === currentYear
          );
          setCalendarData(filtered);
          setMessage(`Showing calendar from ${selectedCalendar.semesterStart} to ${selectedCalendar.semesterEnd}`);
        }
      } catch (error) {
        console.error("Error loading selected calendar", error);
        setMessage("Failed to load selected calendar");
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedCalendar();
  }, [selectedCalendarId, currentYear, availableCalendars]);

  // Group dates by month
  const groupedByMonth = (calendarData || []).reduce((acc, dateObj) => {
    const month = dateObj.date.slice(0, 7); // YYYY-MM format
    if (!acc[month]) acc[month] = [];
    acc[month].push(dateObj);
    return acc;
  }, {});

  // Render a single month
  const renderMonth = (monthDates) => {
    const firstDate = new Date(monthDates[0].date);
    const monthName = firstDate.toLocaleString("default", {
      month: "long",
      year: 'numeric'
    });

    return (
      <div className="month-card" key={monthName}>
        <div className="month-header">
          <h3>{monthName}</h3>
        </div>
        <div className="days-header">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
        <div className="days-grid">
          {monthDates.map((dateObj) => {
            const date = new Date(dateObj.date);
            const dayOfMonth = date.getDate();
            const dayOfWeek = date.getDay();

            if (dayOfMonth === 1) {
              const emptyCells = [];
              for (let i = 0; i < dayOfWeek; i++) {
                emptyCells.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
              }
              return emptyCells.concat(
                <div
                  key={dateObj.date}
                  className={`day-cell ${dateObj.type}`}
                  title={dateObj.name || (dateObj.type === 'weekend' ? 'Weekend' : 'Working day')}
                >
                  <div className="day-number">{dayOfMonth}</div>
                  {dateObj.name && <div className="holiday-label">{dateObj.name}</div>}
                </div>
              );
            }

            return (
              <div
                key={dateObj.date}
                className={`day-cell ${dateObj.type}`}
                title={dateObj.name || (dateObj.type === 'weekend' ? 'Weekend' : 'Working day')}
              >
                <div className="day-number">{dayOfMonth}</div>
                {dateObj.name && <div className="holiday-label">{dateObj.name}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const changeYear = (direction) => {
    setCurrentYear(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  return (
    <div className="student-academic-calendar">
      <div className="calendar-header">
        <h2>Academic Calendar {currentYear}</h2>
        <div className="year-navigation">
          <button onClick={() => changeYear('prev')} disabled={isLoading}>
            &lt; Prev Year
          </button>
          <span className="current-year">{currentYear}</span>
          <button onClick={() => changeYear('next')} disabled={isLoading}>
            Next Year &gt;
          </button>
        </div>
      </div>

      {availableCalendars.length > 0 && (
        <div className="calendar-selector">
          <select 
            value={selectedCalendarId}
            onChange={(e) => setSelectedCalendarId(e.target.value)}
            disabled={isLoading}
          >
            {availableCalendars.map(calendar => (
              <option key={calendar._id} value={calendar._id}>
                {new Date(calendar.semesterStart).toLocaleDateString()} to {new Date(calendar.semesterEnd).toLocaleDateString()} 
                (Updated: {new Date(calendar.updatedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {message && <div className={`status-message ${isLoading ? 'loading' : ''}`}>{message}</div>}

      <div className="legend-container">
        <div className="legend-item">
          <span className="color-box working_day"></span>
          <span>Working Day</span>
        </div>
        <div className="legend-item">
          <span className="color-box weekend"></span>
          <span>Weekend</span>
        </div>
        <div className="legend-item">
          <span className="color-box public_holiday"></span>
          <span>Public Holiday</span>
        </div>
        <div className="legend-item">
          <span className="color-box custom_holiday"></span>
          <span>Institute Holiday</span>
        </div>
      </div>

      <div className="calendar-container">
        {isLoading ? (
          <div className="empty-calendar">Loading calendar...</div>
        ) : Object.keys(groupedByMonth).length > 0 ? (
          Object.keys(groupedByMonth).map((month) => renderMonth(groupedByMonth[month]))
        ) : (
          <div className="empty-calendar">
            No academic calendar available for {currentYear}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAcademicCalendar;