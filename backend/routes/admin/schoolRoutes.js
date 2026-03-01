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
} = require("../../controllers/admin/schoolController");

// Public
router.get("/", getAllSchools);
router.get("/:id", getSchoolById);

// Admin only
router.post("/", verifyToken, authorizeRoles("admin"), addSchool);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateSchool);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteSchool);

module.exports = router;
