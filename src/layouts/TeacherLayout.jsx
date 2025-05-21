import React from 'react'
import TeachSidebar from '../pages/teacher/TeacherSidebar/TeachSidebar'
import TeacherDashboard from '../pages/teacher/TeacherDashboard/TeacherDashboard'
import Sidebar from '../components/Sidebar'

const TeacherLayout = () => {
  return (
    <>
    <Sidebar/>
    <TeacherDashboard/>
    </>
  )
}

export default TeacherLayout