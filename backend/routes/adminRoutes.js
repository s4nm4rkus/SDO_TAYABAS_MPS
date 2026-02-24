const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const adminController = require("../controllers/adminController");

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("admin"),
  adminController.getDashboard,
);
router.post(
  "/add-user",
  verifyToken,
  authorizeRoles("admin"),
  adminController.addUser,
);

module.exports = router;
