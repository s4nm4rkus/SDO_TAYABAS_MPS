const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const sectionController = require("../../controllers/school-head/sectionController");

const schoolHeadOnly = [verifyToken, authorizeRoles("school_head")];

// ── GET — specific first, dynamic last ──
router.get("/", ...schoolHeadOnly, sectionController.getSections);
router.get("/teachers", ...schoolHeadOnly, sectionController.getSchoolTeachers);
router.get(
  "/teacher-list",
  ...schoolHeadOnly,
  sectionController.getSchoolTeacherList,
);
router.get("/schools", ...schoolHeadOnly, sectionController.getAssignedSchools);
router.get(
  "/dashboard",
  ...schoolHeadOnly,
  sectionController.getSchoolHeadDashboard,
);

// ── POST ──
router.post("/", ...schoolHeadOnly, sectionController.createSection);
router.post(
  "/teachers/create",
  ...schoolHeadOnly,
  sectionController.createTeacher,
);

// ── PUT — specific first, dynamic last ──
router.put("/teachers/:id", ...schoolHeadOnly, sectionController.updateTeacher);
router.put("/:id/assign", ...schoolHeadOnly, sectionController.assignAdviser);
router.put("/:id", ...schoolHeadOnly, sectionController.updateSection);

// ── DELETE ──
router.delete("/:id", ...schoolHeadOnly, sectionController.deleteSection);

module.exports = router;
