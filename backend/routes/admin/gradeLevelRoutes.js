const express = require("express");
const router = express.Router();
const gradeLevelController = require("../../controllers/admin/gradeLevelController");
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");

// All authenticated roles can read
router.get("/", verifyToken, gradeLevelController.getAllGradeLevels);
router.get("/:id", verifyToken, gradeLevelController.getGradeLevelById);

// Admin only
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  gradeLevelController.addGradeLevel,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  gradeLevelController.updateGradeLevel,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  gradeLevelController.deleteGradeLevel,
);

module.exports = router;
