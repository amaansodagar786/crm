// 📁 File: src/components/SemesterCalendar.jsx
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

  // Set default dates to current semester if not provided
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Default to Jan-Jun semester
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

  // Fetch public holidays for the selected period
  const fetchPublicHolidays = async () => {
    try {
      const res = await axios.get(
        `/api/calendar/holidays?start=${startDate}&end=${endDate}`
      );
      setPublicHolidays(res.data);
    } catch (error) {
      console.error("Error fetching public holidays", error);
      setMessage("Failed to fetch public holidays");
    }
  };

  // Generate calendar data structure
  const generateCalendar = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // First try to load existing calendar
      const res = await axios.get(
        `http://localhost:5000/calendar/${instituteId}/load?semesterStart=${startDate}&semesterEnd=${endDate}`
      );

      if (res.data) {
        setCalendarData(res.data.calendar);
        setMessage("Loaded existing calendar");
      } else {
        // If no existing calendar, generate a new one
        await fetchPublicHolidays();
        createNewCalendar();
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // No existing calendar found - create new
        await fetchPublicHolidays();
        createNewCalendar();
      } else {
        console.error("Error loading calendar", error);
        setMessage("Failed to load calendar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create new calendar from scratch
  const createNewCalendar = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      const holiday = publicHolidays.find((h) => h.date === dateStr);

      dates.push({
        date: dateStr,
        type: holiday
          ? "public_holiday"
          : isWeekend
            ? "weekend"
            : "working_day",
        name: holiday ? holiday.name : "",
      });

      current.setDate(current.getDate() + 1);
    }

    setCalendarData(dates);
    setMessage("Generated new calendar");
  };

  // Toggle day between working day and custom holiday
  const toggleCustomHoliday = (date) => {
    setCalendarData((prev) =>
      prev.map((d) =>
        d.date === date.date
          ? {
            ...d,
            type: d.type === "custom_holiday"
              ? (d.name ? "public_holiday" : "working_day")
              : "custom_holiday",
            name: d.type === "custom_holiday"
              ? (d.name ? d.name : "")
              : "Institute Holiday",
          }
          : d
      )
    );
  };

  // Save calendar to backend
  const saveCalendar = async () => {
    setIsLoading(true);
    try {
      await axios.post(`http://localhost:5000/calendar/${instituteId}/save`, {
        semesterStart: startDate,
        semesterEnd: endDate,
        calendar: calendarData,
      });
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

            // Add empty cells for days before the first day of the month
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
                  onClick={() => toggleCustomHoliday(dateObj)}
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
                onClick={() => toggleCustomHoliday(dateObj)}
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
    const month = dateObj.date.slice(0, 7); // YYYY-MM
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
    </div>
  );
};

export default SemesterCalendar;