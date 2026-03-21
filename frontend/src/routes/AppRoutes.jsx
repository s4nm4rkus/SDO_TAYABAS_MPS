import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import MainDashboard from "../pages/dashboard/MainDashboard";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layouts/MainLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";

import AdminDashboard from "../pages/dashboard/admin/AdminDashboard";
import AcademicSetup from "../pages/dashboard/admin/AcademicSetup";
import SchoolManagement from "../pages/dashboard/admin/SchoolManagement";
import UserManagement from "../pages/dashboard/admin/UserManagement";
import MonitoringReports from "../pages/dashboard/admin/MonitoringReports";

import TeacherDashboard from "../pages/dashboard/teacher/TeacherDashboard";
import MySection from "../pages/dashboard/teacher/MySection";
import MPSEncoding from "../pages/dashboard/teacher/MPSEncoding";
import MPSReport from "../pages/dashboard/teacher/MPSReport";

//Supervisor
import SupervisorDashboard from "../pages/dashboard/supervisor/SupervisorDashboard";
import SupervisorMPSReport from "../pages/dashboard/supervisor/SupervisorMPSReport";
import SupervisorSchoolHeadList from "../pages/dashboard/supervisor/SchoolHeadList";

// School Head
import SchoolHeadDashboard from "../pages/dashboard/school-head/SchoolHeadDashboard";
import SectionManagement from "../pages/dashboard/school-head/SectionManagement";
import TeacherList from "../pages/dashboard/school-head/TeacherList";
import SchoolHeadMPSReport from "../pages/dashboard/school-head/SchoolHeadMPSReport";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===== PUBLIC AREA ===== */}
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<MainDashboard />} />
      </Route>

      {/* ===== PRIVATE AREA ===== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Teacher */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/section" element={<MySection />} />
            <Route path="/teacher/mps" element={<MPSEncoding />} />
            <Route path="/teacher/report" element={<MPSReport />} />
          </Route>
          {/* Administrator */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="admin/acad" element={<AcademicSetup />} />
            <Route path="/admin/school" element={<SchoolManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/reports" element={<MonitoringReports />} />
          </Route>
          {/* Supervisor */}
          <Route element={<ProtectedRoute allowedRoles={["supervisor"]} />}>
            <Route path="/supervisor" element={<SupervisorDashboard />} />
            <Route
              path="/supervisor/mps-report"
              element={<SupervisorMPSReport />}
            />
            <Route
              path="/supervisor/school-heads"
              element={<SupervisorSchoolHeadList />}
            />
          </Route>

          {/* School Head */}
          <Route element={<ProtectedRoute allowedRoles={["school_head"]} />}>
            <Route path="/school-head" element={<SchoolHeadDashboard />} />
            <Route
              path="/school-head/sections"
              element={<SectionManagement />}
            />
            <Route path="/school-head/teachers" element={<TeacherList />} />
            <Route
              path="/school-head/mps-report"
              element={<SchoolHeadMPSReport />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
