const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const {
  getAllClusters,
  getClusterById,
  addCluster,
  updateCluster,
  deleteCluster,
} = require("../../controllers/admin/clusterController");

// Public
router.get("/", getAllClusters);
router.get("/:id", getClusterById);

// Admin only
router.post("/", verifyToken, authorizeRoles("admin"), addCluster);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateCluster);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteCluster);

module.exports = router;
