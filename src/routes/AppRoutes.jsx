import { Routes, Route, useLocation } from "react-router-dom";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Home from "../pages/Home/Home";
import ForgotPassword from "../pages/auth/ForgotPassword";
import MainadminLayout from "../layouts/MainadminLayout";
import AdminLayout from "../layouts/AdminLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import StudentLayout from "../layouts/StudentLayout";
import Manageinstitutes from "../pages/mainadmin/Manageinstitutes";
import PendingRequest from "../pages/mainadmin/InstitutesDetails/PendingRequest";
import InstituteDashboard from "../pages/mainadmin/InstitutesDetails/InstituteDashboard";
import AddClass from "../pages/mainadmin/Class/AddClass";
import Navbar from "../components/Navbar";
import StuProfile from "../pages/student/Profile/StuProfile";
import ShowClasses from "../pages/mainadmin/Class/ShowClasses";
import AddStuDetails from "../pages/mainadmin/ManageStudents/AddStuDetails";
import Timetable from "../pages/mainadmin/Timetable/Timetable";
import Showtimetable from "../pages/mainadmin/Timetable/Showtimetable";
import StudentDashboard from "../pages/student/StudentDashboard/StudentDashboard";
import StudentTimetable from "../pages/student/StudentTimetable/StudentTimetable";
import TeacherTimetable from "../pages/teacher/TecherTimetable/TeacherTimetable";
import SemesterCalendar from "../pages/mainadmin/SemesterCalender/SemesterCalendar";
import StudentAcademic from "../pages/student/StudentAcedemic/StudentAcedemic";
import TeacherAcademic from "../pages/teacher/TeacherAcedemic/TeacherAcademic";
import ManageFaculties from "../pages/mainadmin/Management/ManageFaculties";

const AppRoutes = () => {
  const location = useLocation();

  // Define routes where the navbar should NOT appear
  const noNavbarRoutes = ["/login", "/register", "/forgotpass"];

  // Check if the current route is in the noNavbarRoutes array
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />} 
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpass" element={<ForgotPassword />} />

        {/* Layouts */}
        <Route path="/mainadmin" element={<MainadminLayout />} />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/teacher" element={<TeacherLayout />} />
        <Route path="/student" element={<StudentLayout/>} />

        {/* Main Admin Routes */}
        <Route path="/mainadmin/manageinstitutes" element={<Manageinstitutes />} />
        <Route path="/mainadmin/institute/dashboard/:instituteId" element={<InstituteDashboard />} />
        <Route path="/mainadmin/pendingrequest/:instituteId" element={<PendingRequest />} />
        <Route path="/mainadmin/addclass/:instituteId" element={<AddClass />} />
        <Route path="/mainadmin/showclass/:instituteId" element={<ShowClasses />} />
        <Route path="/mainadmin/calendar/:instituteId" element={<SemesterCalendar />} />
        <Route path="/mainadmin/manage/:instituteId" element={<ManageFaculties />} />

        {/* Main Admin Manage Routes */}
        <Route path="/mainadmin/adddetails/:instituteId" element={<AddStuDetails />} />
        <Route path="/mainadmin/timetable/:instituteId" element={<Timetable />} />
        <Route path="/mainadmin/showtimetable/:instituteId" element={<Showtimetable />} />



        {/*  Student Routes */}
        <Route path="/student/profile" element={<StuProfile />} />
        <Route path="/student/timetable" element={<StudentTimetable />} />
        <Route path="/student/academic" element={<StudentAcademic />} />


        {/*  Teachers Routes */}
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route path="/teacher/academic" element={<TeacherAcademic />} />
        {/* <Route path="/student/timetable" element={<StudentTimetable />} /> */}
      </Routes>
    </>
  );
};

export default AppRoutes;