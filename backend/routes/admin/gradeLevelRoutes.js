const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const {
  getAllGradeLevels,
  getGradeLevelById,
  addGradeLevel,
  updateGradeLevel,
  deleteGradeLevel,
  getGradeLevelSubjects,
} = require("../../controllers/admin/gradeLevelController");

// Public
router.get("/", getAllGradeLevels);
router.get("/:id", getGradeLevelById);
router.get("/:id/subjects", getGradeLevelSubjects);

// Admin only
router.post("/", verifyToken, authorizeRoles("admin"), addGradeLevel);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateGradeLevel);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteGradeLevel);

module.exports = router;
