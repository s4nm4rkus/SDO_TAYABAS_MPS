const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public
router.post("/login", authController.login);

// Protected — get current logged in user
router.get("/me", verifyToken, authController.getCurrentUser);

module.exports = router;
