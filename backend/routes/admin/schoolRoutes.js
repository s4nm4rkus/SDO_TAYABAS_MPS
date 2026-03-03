const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const {
  getAllSchools,
  getSchoolById,
  addSchool,
  updateSchool,
  deleteSchool,
  getSchoolsByCluster,
  getClustersWithCount,
  getUnassignedCount,
} = require("../../controllers/admin/schoolController");
// Public
router.get("/", getAllSchools);

// These MUST come before /:id
router.get("/clusters-with-count", verifyToken, getClustersWithCount);
router.get("/unassigned-count", verifyToken, getUnassignedCount);
router.get("/by-cluster/:cluster_id", verifyToken, getSchoolsByCluster);

// This must come LAST
router.get("/:id", getSchoolById);

// Admin only
router.post("/", verifyToken, authorizeRoles("admin"), addSchool);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateSchool);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteSchool);

module.exports = router;
