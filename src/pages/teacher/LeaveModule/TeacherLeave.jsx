import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TeacherLeave.scss";

const TeacherLeave = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [leaveBalance, setLeaveBalance] = useState({});
  const [salary, setSalary] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.teacherId;
  const instituteId = user?.instituteId;

  useEffect(() => {
    if (!teacherId || !instituteId) return;

    const fetchLeaveData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/employee/meta/${teacherId}`);
        if (res.data) {
          setSalary(res.data.monthlySalary);
          const balance = {};
          res.data.leaves.forEach(leave => {
            balance[leave.type] = leave.count;
          });
          // Initialize Academic leave type if not exists
          if (!balance["Academic"]) {
            balance["Academic"] = 0;
          }
          setLeaveBalance(balance);
        }

        const calendarRes = await axios.get(
          `http://localhost:5000/calendar/${instituteId}/all`
        );
        if (calendarRes.data.length > 0) {
          const mostRecent = calendarRes.data.reduce((prev, current) =>
            new Date(current.updatedAt) > new Date(prev.updatedAt) ? current : prev
          );

          const filtered = mostRecent.calendar.filter(dateObj => {
            const date = new Date(dateObj.date);
            return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
          });

          setCalendarData(filtered);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load leave data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveData();
  }, [teacherId, instituteId, currentYear, currentMonth]);

  const handleDateClick = (dateObj) => {
    if (dateObj.type !== 'working_day') return;

    const dateStr = dateObj.date;
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedDates.length === 0) {
      toast.warning("Please select at least one date");
      return;
    }

    if (!leaveType) {
      toast.warning("Please select leave type");
      return;
    }

    if (!reason.trim()) {
      toast.warning("Please enter reason for leave");
      return;
    }

    // For academic leave, no need to check balance
    if (leaveType !== "Academic") {
      const available = leaveBalance[leaveType] || 0;
      if (available < selectedDates.length) {
        const confirmProceed = window.confirm(
          `You only have ${available} ${leaveType} leave(s) remaining but are applying for ${selectedDates.length} days. Do you want to proceed? The excess will be recorded as negative balance.`
        );
        if (!confirmProceed) return;
      }
    }

    setIsLoading(true);
    try {
      const leaveApplication = {
        teacherId,
        instituteId,
        leaveType,
        dates: selectedDates,
        reason,
        status: "Pending"
      };

      const response = await axios.post(
        "http://localhost:5000/leave/apply",
        leaveApplication
      );

      console.log("Leave application submitted:", response.data);
      toast.success("Leave application submitted successfully!");

      setSelectedDates([]);
      setLeaveType("");
      setReason("");

      // Refresh leave balance
      const metaRes = await axios.get(`http://localhost:5000/employee/meta/${teacherId}`);
      const balance = {};
      metaRes.data.leaves.forEach(leave => {
        balance[leave.type] = leave.count;
      });
      if (!balance["Academic"]) balance["Academic"] = 0;
      setLeaveBalance(balance);
    } catch (error) {
      console.error("Error submitting leave application:", error);
      toast.error(error.response?.data?.error || "Failed to submit leave application");
    } finally {
      setIsLoading(false);
    }
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      let newMonth = direction === 'next' ? prev + 1 : prev - 1;
      let newYear = currentYear;

      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
        setCurrentYear(newYear);
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
        setCurrentYear(newYear);
      }

      return newMonth;
    });
    setSelectedDates([]); // Reset selected dates when changing month
  };

  // Group dates by week for better calendar display with proper alignment
  const groupByWeek = (dates) => {
    const weeks = [];
    let currentWeek = [];

    // Get first day of month to determine offset
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sunday) to 6 (Saturday)

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push(null);
    }

    // Add all days of the month
    dates.forEach(dateObj => {
      const date = new Date(dateObj.date);
      const dayOfWeek = date.getDay();

      currentWeek.push(dateObj);

      if (dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add the last week if not empty
    if (currentWeek.length > 0) {
      // Fill remaining days with empty cells
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const renderDayCell = (dateObj, weekIndex, dayIndex) => {
    if (!dateObj) {
      return (
        <div
          key={`empty-${weekIndex}-${dayIndex}`}
          className="day-cell empty"
        ></div>
      );
    }

    const date = new Date(dateObj.date);
    const dayOfMonth = date.getDate();
    const isSelected = selectedDates.includes(dateObj.date);
    const isSelectable = dateObj.type === 'working_day';

    return (
      <div
        key={dateObj.date}
        className={`day-cell ${dateObj.type} ${isSelected ? 'selected' : ''
          } ${isSelectable ? 'selectable' : ''}`}
        onClick={() => isSelectable && handleDateClick(dateObj)}
        title={dateObj.name || dateObj.type}
      >
        <div className="day-number">{dayOfMonth}</div>
        {dateObj.name && <div className="holiday-label">{dateObj.name}</div>}
        {isSelected && <div className="selected-marker">✓</div>}
      </div>
    );
  };

  const weeks = groupByWeek(calendarData);
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <Sidebar />
      <div className="teacher-leave-container">
        <ToastContainer position="top-center" autoClose={3000} />
        <h2>Apply for Leave</h2>

        <div className="leave-balance-container">
          <h3>Your Leave Balance</h3>
          <div className="balance-cards">
            {Object.entries(leaveBalance).map(([type, count]) => (
              <div key={type} className={`balance-card ${type.toLowerCase()}`}>
                <span className="leave-type">{type}</span>
                <span className="leave-count">
                  {count >= 0 ? count : `${Math.abs(count)} (negative)`} days
                </span>
              </div>
            ))}
          </div>
          <div className="salary-info">
            Monthly Salary: ₹{salary.toLocaleString()}
          </div>
        </div>

        <div className="leave-form-container">
          <div className="calendar-section">
            <div className="calendar-header">
              <h3>{monthName}</h3>
              <div className="month-navigation">
                <button onClick={() => changeMonth('prev')} disabled={isLoading}>
                  &lt; Prev
                </button>
                <button onClick={() => changeMonth('next')} disabled={isLoading}>
                  Next &gt;
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              <div className="day-header-row">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="day-header">{day}</div>
                ))}
              </div>

              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="week-row">
                  {week.map((dateObj, dayIndex) =>
                    renderDayCell(dateObj, weekIndex, dayIndex)
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="leave-details-section">
            <h3>Leave Details</h3>
            <div className="selected-dates">
              <h4>Selected Dates:</h4>
              {selectedDates.length > 0 ? (
                <ul>
                  {selectedDates.map(date => (
                    <li key={date}>{new Date(date).toLocaleDateString()}</li>
                  ))}
                </ul>
              ) : (
                <p>No dates selected</p>
              )}
            </div>

            {/* <div className="form-group">
              <label htmlFor="leaveType">Leave Type:</label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                disabled={selectedDates.length === 0}
              >
                <option value="">Select Leave Type</option>
                {Object.keys(leaveBalance).map(type => (
                  <option key={type} value={type}>
                    {type} (Remaining: {leaveBalance[type]})
                  </option>
                ))}
              </select>
            </div> */}

            <div className="form-group">
              <label htmlFor="leaveType">Leave Type:</label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                disabled={selectedDates.length === 0}
              >
                <option value="">Select Leave Type</option>
                {Object.keys(leaveBalance).map(type => (
                  <option key={type} value={type}>
                    {type} {type !== "Academic" && `(Remaining: ${leaveBalance[type]})`}
                  </option>
                ))}
              </select>
              {leaveType === "Academic" && (
                <p className="leave-info-note">
                  Academic leave is for official academic purposes and doesn't deduct from your regular leave balance.
                </p>
              )}
              {leaveType && leaveType !== "Academic" && leaveBalance[leaveType] < selectedDates.length && (
                <p className="leave-warning-note">
                  Warning: You're applying for more days than your available balance.
                  The excess will be recorded as negative balance if approved.
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason:</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for leave"
                rows="3"
                disabled={selectedDates.length === 0 || !leaveType}
              />
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isLoading || selectedDates.length === 0 || !leaveType || !reason.trim()}
            >
              {isLoading ? "Submitting..." : "Apply for Leave"}
            </button>

            {/* {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherLeave;