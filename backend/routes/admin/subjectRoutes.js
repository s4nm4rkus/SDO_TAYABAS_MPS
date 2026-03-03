const express = require("express");
const router = express.Router();
const subjectController = require("../../controllers/admin/subjectController");
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");

// All authenticated roles can read
router.get("/", verifyToken, subjectController.getAllSubjects);
router.get("/:id", verifyToken, subjectController.getSubjectById);

// Admin only
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  subjectController.addSubject,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  subjectController.updateSubject,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  subjectController.deleteSubject,
);

module.exports = router;
