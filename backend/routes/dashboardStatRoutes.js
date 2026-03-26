const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardStatController");

router.get("/", getDashboardStats);

module.exports = router;
