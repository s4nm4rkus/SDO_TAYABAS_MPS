const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");
const userController = require("../../controllers/admin/userController");
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");

const adminOnly = [verifyToken, authorizeRoles("admin")];

// Create user — reuses register from authController
router.post("/", ...adminOnly, authController.register);

// Get all users
router.get("/", ...adminOnly, userController.getAllUsers);

// Get user by ID
router.get("/:id", ...adminOnly, userController.getUserById);

// Assign role + school/cluster
router.put("/:id/assign", ...adminOnly, userController.assignUser);

// Activate / Deactivate
router.put("/:id/status", ...adminOnly, userController.toggleStatus);

// Delete user
router.delete("/:id", ...adminOnly, userController.deleteUser);

module.exports = router;
