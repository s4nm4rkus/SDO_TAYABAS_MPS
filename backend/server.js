const express = require("express");
const cors = require("cors");
require("dotenv").config();

const schoolYearRoutes = require("./routes/admin/schoolYearRoutes");
const schoolRoutes = require("./routes/admin/schoolRoutes");
const clusterRoutes = require("./routes/admin/clusterRoutes");
const gradingPeriodRoutes = require("./routes/admin/gradingPeriodRoutes");
const subjectRoutes = require("./routes/admin/subjectRoutes");
const gradeLevelRoutes = require("./routes/admin/gradeLevelRoutes");
const userRoutes = require("./routes/admin/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API running..."));

// Auth
app.use("/api/auth", require("./routes/authRoutes"));

// Role-based
// Admin routes
app.use("/api/admin", require("./routes/admin/adminRoutes"));
app.use("/api/school-years", schoolYearRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/clusters", clusterRoutes);
app.use("/api/grading-periods", gradingPeriodRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/grade-levels", gradeLevelRoutes);
app.use("/api/users", userRoutes);

// Teacher routes
app.use("/api/teacher", require("./routes/teacherRoutes"));

// ... add schoolHead, clusterSupervisor similarly

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
