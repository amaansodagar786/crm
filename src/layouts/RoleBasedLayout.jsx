import React from "react";
import MainadminLayout from "./MainadminLayout";
import AdminLayout from "./AdminLayout";
import TeacherLayout from "./TeacherLayout";
import StudentLayout from "./StudentLayout";

const RoleBasedLayout = ({ children }) => {
  // Get the user's role from localStorage
  const userRole = localStorage.getItem("userRole");

  // Render the appropriate layout based on the role
  switch (userRole) {
    case "mainadmin":
      return <MainadminLayout>{children}</MainadminLayout>;
    case "admin":
      return <AdminLayout>{children}</AdminLayout>;
    case "teacher":
      return <TeacherLayout>{children}</TeacherLayout>;
    case "student":
      return <StudentLayout>{children}</StudentLayout>;
    default:
      // If no role is found, redirect to login or show an error
      return <div>Unauthorized. Please log in.</div>;
  }
};

export default RoleBasedLayout;