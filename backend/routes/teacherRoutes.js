const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const teacherController = require("../controllers/teacherController");

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("teacher"),
  teacherController.getDashboard,
);

module.exports = router;
