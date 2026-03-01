const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const {
  getAllGradingPeriods,
  getGradingPeriodsByYear,
  addGradingPeriod,
  updateGradingPeriod,
  deleteGradingPeriod,
} = require("../../controllers/admin/gradingPeriodController");

// Public
router.get("/", getAllGradingPeriods);
router.get("/by-year/:school_year_id", getGradingPeriodsByYear);

// Admin only
router.post("/", verifyToken, authorizeRoles("admin"), addGradingPeriod);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateGradingPeriod);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteGradingPeriod,
);

module.exports = router;
