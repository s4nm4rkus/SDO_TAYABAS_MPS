const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const monitoringController = require("../../controllers/admin/monitoringController");

const adminOnly = [verifyToken, authorizeRoles("admin")];

router.get("/overview", ...adminOnly, monitoringController.getOverview);
router.get(
  "/grading-periods",
  ...adminOnly,
  monitoringController.getGradingPeriods,
);
router.get(
  "/mps-report/:grading_period_id",
  ...adminOnly,
  monitoringController.getMPSReport,
);

module.exports = router;
