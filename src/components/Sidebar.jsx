import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Set sidebar open by default
  const [isInstitutesExpanded, setIsInstitutesExpanded] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleInstitutesSection = () => {
    setIsInstitutesExpanded(!isInstitutesExpanded);
  };

  const renderButtons = () => {
    switch (userRole) {
      case 'mainadmin':
        return (
          <>
            <button onClick={() => navigate('/mainadmin/dashboard')}>Dashboard</button>
            <button onClick={() => navigate('/mainadmin/manage-admins')}>Manage Admins</button>
            <button onClick={() => navigate('/mainadmin/semcalender')}>Manage Calender</button>
            <button onClick={toggleInstitutesSection}>Institutes</button>
            {isInstitutesExpanded && (
              <div className="sub-buttons">
                <button onClick={() => navigate('/mainadmin/manageinstitutes')}>Manage Institutes</button>
              </div>
            )}
          </>
        );
      case 'admin':
        return (
          <>
            <button onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
            <button onClick={() => navigate('/admin/manage-students')}>Manage Students</button>
            <button onClick={() => navigate('/admin/manage-teachers')}>Manage Teachers</button>
            <button onClick={() => navigate('/admin/settings')}>Settings</button>
          </>
        );
      case 'teacher':
        return (
          <>
            <button onClick={() => navigate('/teacher/dashboard')}>Dashboard</button>
            <button onClick={() => navigate('/teacher/my-classes')}>My Classes</button>
            <button onClick={() => navigate('/teacher/assignments')}>Assignments</button>
            <button onClick={() => navigate('/teacher/timetable')}>TimeTable</button>
          </>
        );
      case 'student':
        return (
          <>
            <button onClick={() => navigate('/student')}>Dashboard</button>
            <button onClick={() => navigate(`/student/profile`)}>My Profile</button>
            <button onClick={() => navigate('/student/assignments')}>Assignments</button>
            <button onClick={() => navigate('/student/grades')}>Grades</button>
            <button onClick={() => navigate('/student/timetable')}>Timetable</button>
          </>
        );
      default:
        return <button onClick={() => navigate('/dashboard')}>Dashboard</button>;
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Hamburger Icon (Optional for smaller screens) */}
      <div className="hamburger" onClick={toggleSidebar}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      {/* Sidebar Content */}
      <div className="sidebar-content">
        <h2>Menu</h2>
        <div className="buttons">{renderButtons()}</div>
      </div>
    </div>
  );
};

export default Sidebar;