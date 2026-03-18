const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const sectionController = require("../../controllers/school-head/sectionController");

const schoolHeadOnly = [verifyToken, authorizeRoles("school_head")];

// ── GET routes — specific first, dynamic last ──
router.get("/", ...schoolHeadOnly, sectionController.getSections);
router.get("/teachers", ...schoolHeadOnly, sectionController.getSchoolTeachers);
router.get("/schools", ...schoolHeadOnly, sectionController.getAssignedSchools);

// ── POST ──
router.post("/", ...schoolHeadOnly, sectionController.createSection);

// ── PUT ──
router.put("/:id", ...schoolHeadOnly, sectionController.updateSection);
router.put("/:id/assign", ...schoolHeadOnly, sectionController.assignAdviser);

// ── DELETE ──
router.delete("/:id", ...schoolHeadOnly, sectionController.deleteSection);
router.get(
  "/teacher-list",
  ...schoolHeadOnly,
  sectionController.getSchoolTeacherList,
);

module.exports = router;
