const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const {
  getAllGradingPeriods,
  getGradingPeriodsByYear,
  updateGradingPeriod,
  setActiveGradingPeriod,
  deleteGradingPeriod,
} = require("../../controllers/admin/gradingPeriodController");

// Public
router.get("/", getAllGradingPeriods);
router.get("/by-year/:school_year_id", getGradingPeriodsByYear);

// Admin only
router.put("/:id", verifyToken, authorizeRoles("admin"), updateGradingPeriod);
router.put(
  "/:id/set-active",
  verifyToken,
  authorizeRoles("admin"),
  setActiveGradingPeriod,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteGradingPeriod,
);

module.exports = router;
