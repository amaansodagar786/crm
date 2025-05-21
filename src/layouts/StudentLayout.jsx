import React from 'react'
import StudentDashboard from '../pages/student/StudentDashboard/StudentDashboard'
import StuSidebar from '../pages/student/StudentSidebar/StuSidebar'
import Sidebar from '../components/Sidebar'


const StudentLayout = () => {
  return (
    <>
    <Sidebar/>
    <StudentDashboard/>
    </>
  )
}

export default StudentLayout