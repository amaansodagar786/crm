// Update your StudentAcademic.jsx to use the new component
import React from 'react';
import Sidebar from '../../../components/Sidebar';
import './TeacherAcademic.scss';
import TeacherAcademicCalendar from './TeacherAcademicCalendar';

const StudentAcademic = () => {
  return (
    <div className="student-academic-page">
      <Sidebar />
      <div className="student-academic-content">
        <TeacherAcademicCalendar />
      </div>
    </div>
  );
};

export default StudentAcademic;