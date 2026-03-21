const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const supervisorController = require("../../controllers/supervisor/supervisorDashboardController");

const supervisorOnly = [verifyToken, authorizeRoles("supervisor")];

router.get("/dashboard", ...supervisorOnly, supervisorController.getDashboard);
router.get(
  "/grading-periods",
  ...supervisorOnly,
  supervisorController.getGradingPeriods,
);
router.get(
  "/mps-report/:grading_period_id",
  ...supervisorOnly,
  supervisorController.getMPSReport,
);

// ← New school head routes
router.get(
  "/school-heads",
  ...supervisorOnly,
  supervisorController.getSchoolHeads,
);
router.post(
  "/school-heads",
  ...supervisorOnly,
  supervisorController.createSchoolHead,
);
router.put(
  "/school-heads/:id/unassign",
  ...supervisorOnly,
  supervisorController.unassignSchoolHead,
);
router.put(
  "/school-heads/:id",
  ...supervisorOnly,
  supervisorController.updateSchoolHead,
);
router.delete(
  "/school-heads/:id",
  ...supervisorOnly,
  supervisorController.deleteSchoolHead,
);

module.exports = router;
