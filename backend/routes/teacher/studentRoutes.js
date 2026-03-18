const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const studentController = require("../../controllers/teacher/studentController");

const teacherOnly = [verifyToken, authorizeRoles("teacher")];

router.get("/my-section", ...teacherOnly, studentController.getMySection);
router.get("/", ...teacherOnly, studentController.getMyStudents);
router.post("/", ...teacherOnly, studentController.addStudent);
router.put("/:id", ...teacherOnly, studentController.updateStudent);
router.delete("/:id", ...teacherOnly, studentController.deleteStudent);

module.exports = router;
