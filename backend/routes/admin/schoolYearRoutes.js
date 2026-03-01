const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const {
  addSchoolYear,
  updateSchoolYear,
  deleteSchoolYear,
  getAllSchoolYears,
  getActiveSchoolYear,
} = require("../../controllers/admin/schoolYearController");

// Public — no token needed
router.get("/", getAllSchoolYears);
router.get("/active", getActiveSchoolYear);

// Admin only
router.post("/", verifyToken, authorizeRoles("admin"), addSchoolYear);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateSchoolYear);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteSchoolYear);

module.exports = router;
