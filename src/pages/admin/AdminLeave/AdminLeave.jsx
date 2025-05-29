import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminLeave.scss";

const AdminLeave = () => {
  // State for leave application
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [leaveBalance, setLeaveBalance] = useState({});
  const [salary, setSalary] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // State for pending leave requests
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [activeTab, setActiveTab] = useState("apply"); // 'apply' or 'requests'

  const user = JSON.parse(localStorage.getItem("user"));
  const adminId = user?.adminId || user?.teacherId; // Handle both admin and teacher cases
  const instituteId = user?.instituteId;

  // Fetch leave data for application
  useEffect(() => {
    if (!adminId || !instituteId || activeTab !== 'apply') return;

    const fetchLeaveData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/employee/meta/${adminId}`);
        if (res.data) {
          setSalary(res.data.monthlySalary);
          const balance = {};
          res.data.leaves.forEach(leave => {
            balance[leave.type] = leave.count;
          });
          if (!balance["Academic"]) balance["Academic"] = 0;
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
  }, [adminId, instituteId, currentYear, currentMonth, activeTab]);

  // Fetch pending leave requests
  useEffect(() => {
    if (!instituteId || activeTab !== 'requests') return;

    const fetchPendingLeaves = async () => {
      setLoadingPending(true);
      try {
        const response = await axios.get(`http://localhost:5000/leave/pending/${instituteId}`);
        setPendingLeaves(response.data);
        setLoadingPending(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch leave requests');
        setLoadingPending(false);
        toast.error('Failed to load leave requests');
      }
    };

    fetchPendingLeaves();
  }, [instituteId, currentYear, currentMonth, activeTab]);

  // Common functions
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
    setSelectedDates([]);
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Leave application functions
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
        adminId,
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

      toast.success("Leave application submitted successfully!");
      setSelectedDates([]);
      setLeaveType("");
      setReason("");

      // Refresh leave balance
      const metaRes = await axios.get(`http://localhost:5000/employee/meta/${adminId}`);
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

  // Pending leave functions
  const handleProcessLeave = async (leaveId, action) => {
    try {
      if (action === 'reject' && !rejectionReason) {
        toast.warning('Please provide a reason for rejection');
        return;
      }

      await axios.put(`http://localhost:5000/leave/process/${leaveId}`, {
        action,
        reason: rejectionReason
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setPendingLeaves(pendingLeaves.filter(leave => leave._id !== leaveId));
      setRejectionReason('');
      setSelectedLeave(null);
      
      toast.success(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to process leave request';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Calendar rendering functions
  const groupByWeek = (dates) => {
    const weeks = [];
    let currentWeek = [];

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push(null);
    }

    dates.forEach(dateObj => {
      const date = new Date(dateObj.date);
      const dayOfWeek = date.getDay();

      currentWeek.push(dateObj);

      if (dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
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
        className={`day-cell ${dateObj.type} ${isSelected ? 'selected' : ''} ${isSelectable ? 'selectable' : ''}`}
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
      <div className="admin-leave-container">
        <ToastContainer position="top-center" autoClose={3000} />
        <h1>Leave Management</h1>

        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'apply' ? 'active' : ''}`}
            onClick={() => setActiveTab('apply')}
          >
            Apply for Leave
          </button>
          <button 
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Pending Requests ({pendingLeaves.length})
          </button>
        </div>

        {activeTab === 'apply' ? (
          <>
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
                        renderDayCell(dateObj, weekIndex, dayIndex))
                      }
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
                      Academic leave is for official purposes and doesn't deduct from your regular leave balance.
                    </p>
                  )}
                  {leaveType && leaveType !== "Academic" && leaveBalance[leaveType] < selectedDates.length && (
                    <p className="leave-warning-note">
                      Warning: You're applying for more days than your available balance.
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
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="month-navigation">
              <button onClick={() => changeMonth('prev')}>
                &lt; Prev
              </button>
              <span className="current-month">
                {new Date(currentYear, currentMonth).toLocaleString('default', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
              <button onClick={() => changeMonth('next')}>
                Next &gt;
              </button>
            </div>
            
            {loadingPending ? (
              <div className="loading-spinner">Loading...</div>
            ) : pendingLeaves.length === 0 ? (
              <div className="no-leaves">No pending leave requests</div>
            ) : (
              <div className="leave-cards">
                {pendingLeaves.map((leave) => (
                  <div key={leave._id} className="leave-card">
                    <div className="leave-header">
                      <div>
                        <h3>{leave.userInfo.name}</h3>
                        <p className="user-role">{leave.userInfo.role}</p>
                        <p className="user-email">{leave.userInfo.email}</p>
                      </div>
                      <span className={`leave-type ${leave.leaveType.toLowerCase()}`}>
                        {leave.leaveType}
                      </span>
                    </div>
                    
                    <div className="leave-details">
                      <p><strong>Dates:</strong> {leave.dates.map(date => formatDate(date)).join(', ')}</p>
                      <p><strong>Duration:</strong> {leave.dates.length} day(s)</p>
                      <p><strong>Reason:</strong> {leave.reason}</p>
                      <p><strong>Salary:</strong> ₹{leave.salary.toLocaleString()}/month</p>
                      <p><strong>Applied On:</strong> {formatDate(leave.appliedOn)}</p>
                      
                      <div className="leave-balances">
                        <strong>Leave Balances:</strong>
                        {leave.leaveBalances.map(balance => (
                          <span key={balance.type} className="balance-tag">
                            {balance.type}: {balance.count >= 0 ? balance.count : `${Math.abs(balance.count)} (negative)`}
                          </span>
                        ))}
                      </div>

                      {leave.willResultInNegative && (
                        <div className="negative-warning">
                          <strong>Warning:</strong> Approving this will result in negative balance: -{leave.negativeAmount}
                        </div>
                      )}
                    </div>
                    
                    <div className="leave-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleProcessLeave(leave._id, 'approve')}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => setSelectedLeave(leave)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedLeave && (
              <div className="rejection-modal">
                <div className="modal-content">
                  <h3>Reject Leave Request</h3>
                  <p>For: {selectedLeave.userInfo.name} ({selectedLeave.userInfo.role})</p>
                  <p>Dates: {selectedLeave.dates.map(date => formatDate(date)).join(', ')}</p>
                  
                  <textarea
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                  
                  <div className="modal-actions">
                    <button 
                      className="confirm-reject-btn"
                      onClick={() => handleProcessLeave(selectedLeave._id, 'reject')}
                    >
                      Confirm Rejection
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => {
                        setSelectedLeave(null);
                        setRejectionReason('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AdminLeave;