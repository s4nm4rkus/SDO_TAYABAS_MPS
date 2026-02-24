import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import MainDashboard from "../pages/dashboard/MainDashboard";
import TeacherDashboard from "../pages/dashboard/TeacherDashboard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layouts/MainLayout";
import DashboardLayout from "../components/layouts/DashboardLayout";

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
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
