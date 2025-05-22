import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../SemesterCalender/SemesterCalendar.scss";

const SemesterCalendar = () => {
  const { instituteId } = useParams();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [calendarData, setCalendarData] = useState([]);
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayType, setHolidayType] = useState("custom_holiday");



  // Set default dates to current semester if not provided
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const defaultStart = `${currentYear}-01-01`;
    const defaultEnd = `${currentYear}-06-30`;
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  // Load calendar when dates change
  useEffect(() => {
    if (startDate && endDate) {
      generateCalendar();
    }
  }, [startDate, endDate]);

  // Fetch public holidays
  const fetchPublicHolidays = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/calendar/holidays?start=${startDate}&end=${endDate}`
      );
      console.log('Fetched public holidays:', res.data); // Add logging
      setPublicHolidays(res.data);
    } catch (error) {
      console.error("Error fetching public holidays", error.response?.data || error.message);
      setMessage("Failed to fetch public holidays");
    }
  };


  useEffect(() => {
    if (publicHolidays.length > 0 && calendarData.length === 0) {
      createNewCalendar();
    }
  }, [publicHolidays]);

  // Generate calendar data structure
  const generateCalendar = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      // First try to load existing calendar
      const res = await axios.get(
        `http://localhost:5000/calendar/${instituteId}/load?semesterStart=${startDate}&semesterEnd=${endDate}`
      );

      if (res.data.calendar && res.data.calendar.length > 0) {
        setCalendarData(res.data.calendar);
        setMessage("Loaded existing calendar");
      } else {
        // Only fetch public holidays if no existing calendar
        await fetchPublicHolidays();
        createNewCalendar();
      }
    } catch (error) {
      console.error("Error loading calendar", error);
      setMessage("Failed to load calendar");
    } finally {
      setIsLoading(false);
    }
  };


  // Create new calendar
  const createNewCalendar = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let current = new Date(start);

    // Merge with existing calendar data if any
    const existingDates = calendarData.filter(d =>
      new Date(d.date) >= start && new Date(d.date) <= end
    );

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];

      // Check if date exists in existing data
      const existingDate = existingDates.find(d => d.date === dateStr);

      if (existingDate) {
        dates.push(existingDate);
      } else {
        const isWeekend = current.getDay() === 0 || current.getDay() === 6;
        const holiday = publicHolidays.find((h) => h.date === dateStr);

        dates.push({
          date: dateStr,
          type: holiday ? 'public_holiday' : isWeekend ? 'weekend' : 'working_day',
          name: holiday ? holiday.name : ''
        });
      }

      current.setDate(current.getDate() + 1);
    }

    setCalendarData(dates);
    setMessage("Generated new calendar");
  };

  // Handle day click - open modal
  const handleDayClick = (dateObj) => {
    // Remove this restriction
    // if (dateObj.type === "public_holiday") return;

    setSelectedDay(dateObj);
    setHolidayName(dateObj.name || "");
    // Set current type or default to custom_holiday
    setHolidayType(dateObj.type === "working_day" ? "working_day" : "custom_holiday");
    setModalOpen(true);
  };

  // Save holiday from modal
  const saveHoliday = () => {
    setCalendarData((prev) =>
      prev.map((d) => {
        if (d.date !== selectedDay.date) return d;

        // If name is empty, treat as working day
        if (!holidayName.trim()) {
          return {
            ...d,
            type: "working_day",
            name: ""
          };
        }

        return {
          ...d,
          type: holidayType,
          name: holidayName.trim()
        };
      })
    );
    setModalOpen(false);
  };


  // Updated saveCalendar function
  const saveCalendar = async () => {
    setIsLoading(true);
    try {
      // Get the full date range from the calendar data
      const dates = calendarData.map(d => new Date(d.date));
      const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
      const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];

      await axios.post(
        `http://localhost:5000/calendar/${instituteId}/save`,
        {
          semesterStart: minDate,
          semesterEnd: maxDate,
          calendar: calendarData
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setMessage("Calendar saved successfully");
    } catch (error) {
      console.error("Error saving calendar", error);
      setMessage("Failed to save calendar");
    } finally {
      setIsLoading(false);
    }
  };

  // Render a single month
  const renderMonth = (monthDates) => {
    const monthName = new Date(monthDates[0].date).toLocaleString("default", {
      month: "long",
      year: 'numeric'
    });

    return (
      <div className="month" key={monthName}>
        <h3>{monthName}</h3>
        <div className="days-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
        <div className="days">
          {monthDates.map((dateObj) => {
            const date = new Date(dateObj.date);
            const dayOfMonth = date.getDate();
            const dayOfWeek = date.getDay();

            if (dayOfMonth === 1) {
              const emptyCells = [];
              for (let i = 0; i < dayOfWeek; i++) {
                emptyCells.push(<div key={`empty-${i}`} className="day empty"></div>);
              }
              return emptyCells.concat(
                <div
                  key={dateObj.date}
                  className={`day ${dateObj.type}`}
                  title={dateObj.name}
                  onClick={() => handleDayClick(dateObj)}
                >
                  {dayOfMonth}
                  {dateObj.name && <span className="holiday-name">{dateObj.name}</span>}
                </div>
              );
            }

            return (
              <div
                key={dateObj.date}
                className={`day ${dateObj.type}`}
                title={dateObj.name}
                onClick={() => handleDayClick(dateObj)}
              >
                {dayOfMonth}
                {dateObj.name && <span className="holiday-name">{dateObj.name}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Group dates by month
  const groupedByMonth = (calendarData || []).reduce((acc, dateObj) => {
    const month = dateObj.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(dateObj);
    return acc;
  }, {});

  return (
    <div className="semester-calendar">
      <h2>Institute Academic Calendar</h2>

      {message && <div className={`message ${isLoading ? 'loading' : ''}`}>{message}</div>}

      <div className="controls">
        <div className="date-inputs">
          <label>
            Semester Start:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            Semester End:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </label>
        </div>

        <div className="actions">
          <button onClick={generateCalendar} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Generate Calendar'}
          </button>
          <button onClick={saveCalendar} disabled={isLoading || !(calendarData?.length > 0)}>
            {isLoading ? 'Saving...' : 'Save Calendar'}
          </button>
        </div>
      </div>

      <div className="legend">
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

      <div className="calendar">
        {Object.keys(groupedByMonth).length > 0 ? (
          Object.keys(groupedByMonth).map((month) => renderMonth(groupedByMonth[month]))
        ) : (
          <div className="empty-calendar">
            {isLoading ? 'Loading calendar...' : 'No calendar data available. Set dates and generate calendar.'}
          </div>
        )}
      </div>

      {/* Holiday Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Holiday</h3>
            <div className="modal-content">
              <div className="form-group">
                <label>Holiday Name:</label>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="Enter holiday name"
                />
              </div>
              <div className="form-group">
                <label>Holiday Type:</label>
                <select
                  value={holidayType}
                  onChange={(e) => setHolidayType(e.target.value)}
                >
                  <option value="custom_holiday">Institute Holiday</option>
                  <option value="working_day">Working Day</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setModalOpen(false)}>Cancel</button>
              <button onClick={saveHoliday}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterCalendar;