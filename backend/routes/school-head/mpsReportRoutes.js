const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const mpsReportController = require("../../controllers/school-head/mpsReportController");

const schoolHeadOnly = [verifyToken, authorizeRoles("school_head")];

router.get(
  "/grading-periods",
  ...schoolHeadOnly,
  mpsReportController.getGradingPeriods,
);
router.get(
  "/report/:grading_period_id",
  ...schoolHeadOnly,
  mpsReportController.getMPSReport,
);

module.exports = router;
