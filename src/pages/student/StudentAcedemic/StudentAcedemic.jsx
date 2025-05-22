// Update your StudentAcademic.jsx to use the new component
import React from 'react';
import Sidebar from '../../../components/Sidebar';
import StudentAcademicCalendar from './StudentAcademicCalendar';
import './StudentAcademic.scss';

const StudentAcademic = () => {
  return (
    <div className="student-academic-page">
      <Sidebar />
      <div className="student-academic-content">
        <StudentAcademicCalendar />
      </div>
    </div>
  );
};

export default StudentAcademic;