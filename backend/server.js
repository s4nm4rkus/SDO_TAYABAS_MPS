const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const dashboardStatRoutes = require("./routes/dashboardStatRoutes");

const schoolYearRoutes = require("./routes/admin/schoolYearRoutes");
const schoolRoutes = require("./routes/admin/schoolRoutes");
const clusterRoutes = require("./routes/admin/clusterRoutes");
const gradingPeriodRoutes = require("./routes/admin/gradingPeriodRoutes");
const subjectRoutes = require("./routes/admin/subjectRoutes");
const gradeLevelRoutes = require("./routes/admin/gradeLevelRoutes");
const userRoutes = require("./routes/admin/userRoutes");
const monitoringRoutes = require("./routes/admin/monitoringRoutes");

const supervisorRoutes = require("./routes/supervisor/supervisorRoutes");

const sectionRoutes = require("./routes/school-head/sectionRoutes");
const mpsReportRoutes = require("./routes/school-head/mpsReportRoutes");

const teacherRoutes = require("./routes/teacher/teacherRoutes");
const studentRoutes = require("./routes/teacher/studentRoutes");
const assessmentRoutes = require("./routes/teacher/assessmentRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/dashboard-stats", dashboardStatRoutes);

// Auth
app.use("/api/auth", require("./routes/authRoutes"));

// Admin routes
app.use("/api/admin", require("./routes/admin/adminRoutes"));
app.use("/api/school-years", schoolYearRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/clusters", clusterRoutes);
app.use("/api/grading-periods", gradingPeriodRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/grade-levels", gradeLevelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/monitoring", monitoringRoutes);

// Supervisor routes
app.use("/api/supervisor", supervisorRoutes);

// School head routes
app.use("/api/sections", sectionRoutes);
app.use("/api/sh-mps", mpsReportRoutes);

// Teacher routes
app.use("/api/teacher", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/assessments", assessmentRoutes);

// ✅ Serve React frontend — must be LAST
app.use(express.static(path.join(__dirname, "../public_html")));
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../public_html", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
