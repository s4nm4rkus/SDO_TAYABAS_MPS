const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const assessmentController = require("../../controllers/teacher/assessmentController");

const teacherOnly = [verifyToken, authorizeRoles("teacher")];

router.get("/subjects", ...teacherOnly, assessmentController.getSubjects);
router.get(
  "/grading-periods",
  ...teacherOnly,
  assessmentController.getGradingPeriods,
);
router.post(
  "/start",
  ...teacherOnly,
  assessmentController.getOrCreateAssessment,
);
router.post("/scores", ...teacherOnly, assessmentController.saveScores);
router.get(
  "/mps/:grading_period_id",
  ...teacherOnly,
  assessmentController.getMPSReport,
);

router.get("/report", ...teacherOnly, assessmentController.getFullMPSReport);

module.exports = router;
