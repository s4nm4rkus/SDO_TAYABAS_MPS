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
  assignSchoolsToCluster, // ← add this
} = require("../../controllers/admin/schoolController");

// Public
router.get("/", getAllSchools);

// Specific routes BEFORE dynamic /:id
router.get("/clusters-with-count", verifyToken, getClustersWithCount);
router.get("/unassigned-count", verifyToken, getUnassignedCount);
router.get("/by-cluster/:cluster_id", verifyToken, getSchoolsByCluster);

// Specific PUT before dynamic /:id
router.put(
  "/assign-schools/:cluster_id",
  verifyToken,
  authorizeRoles("admin"),
  assignSchoolsToCluster,
); // ← moved prefix first

// Dynamic routes LAST
router.get("/:id", getSchoolById);
router.post("/", verifyToken, authorizeRoles("admin"), addSchool);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateSchool);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteSchool);

module.exports = router;
