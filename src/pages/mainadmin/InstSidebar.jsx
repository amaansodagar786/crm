// 📁 File: src/components/InstSidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './InstSidebar.scss';

const InstSidebar = () => {
  const { instituteId } = useParams();
  const [isOpen, setIsOpen] = useState(true);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [showClasses, setShowClasses] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleManageStudents = () => setShowManageStudents(!showManageStudents);
  const toggleClasses = () => setShowClasses(!showClasses);
  const toggleTimetable = () => setShowTimetable(!showTimetable);
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className={`inst-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="hamburger" onClick={toggleSidebar}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      <div className="sidebar-content">
        <h2>Institute Menu</h2>
        <div className="buttons">
          <button onClick={() => handleNavigation(`/mainadmin/institute/dashboard/${instituteId}`)}>
            Dashboard
          </button>

          <button onClick={() => handleNavigation(`/mainadmin/pendingrequest/${instituteId}`)}>
            Pending Requests
          </button>

          <button onClick={() => handleNavigation(`/mainadmin/manage/${instituteId}`)}>
            Manage Teachers
          </button>

          <button onClick={toggleClasses}>Classes</button>
          {showClasses && (
            <div className="nested-buttons">
              <button onClick={() => handleNavigation(`/mainadmin/addclass/${instituteId}`)}>
                Add Class
              </button>
              <button onClick={() => handleNavigation(`/mainadmin/showclass/${instituteId}`)}>
                Show Classes
              </button>
            </div>
          )}

          <button onClick={toggleManageStudents}>Manage Students</button>
          {showManageStudents && (
            <div className="nested-buttons">
              <button onClick={() => handleNavigation(`/mainadmin/adddetails/${instituteId}`)}>
                Add Details
              </button>
              <button onClick={() => handleNavigation(`/mainadmin/student-details/${instituteId}`)}>
                Details
              </button>
            </div>
          )}

          <button onClick={toggleTimetable}>Timetable</button>
          {showTimetable && (
            <div className="nested-buttons">
              <button onClick={() => handleNavigation(`/mainadmin/timetable/${instituteId}`)}>
                Add Timetable
              </button>
              <button onClick={() => handleNavigation(`/mainadmin/showtimetable/${instituteId}`)}>
                Show Timetable
              </button>
            </div>
          )}

          <button onClick={toggleCalendar}>Academic Calendar</button>
          {showCalendar && (
            <div className="nested-buttons">
              <button onClick={() => handleNavigation(`/mainadmin/calendar/${instituteId}`)}>
                Manage Calendar
              </button>
              <button onClick={() => handleNavigation(`/mainadmin/view-calendar/${instituteId}`)}>
                View Calendar
              </button>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default InstSidebar;