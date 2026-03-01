const db = require("../../config/db");

// Get all clusters
exports.getAllClusters = (req, res) => {
  db.query("SELECT * FROM clusters ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

// Get single cluster
exports.getClusterById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM clusters WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (!results.length)
      return res.status(404).json({ message: "Cluster not found" });
    res.json(results[0]);
  });
};

// Add new cluster
exports.addCluster = (req, res) => {
  const { cluster_name, cluster_code } = req.body;

  if (!cluster_name || !cluster_code)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "INSERT INTO clusters (cluster_name, cluster_code) VALUES (?, ?)",
    [cluster_name, cluster_code],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res
            .status(400)
            .json({ message: "Cluster code already exists" });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ message: "Cluster added successfully", id: result.insertId });
    },
  );
};

// Update cluster
exports.updateCluster = (req, res) => {
  const { id } = req.params;
  const { cluster_name, cluster_code } = req.body;

  if (!cluster_name || !cluster_code)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "UPDATE clusters SET cluster_name = ?, cluster_code = ? WHERE id = ?",
    [cluster_name, cluster_code, id],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res
            .status(400)
            .json({ message: "Cluster code already exists" });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ message: "Cluster updated successfully" });
    },
  );
};

// Delete cluster
exports.deleteCluster = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM clusters WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Cluster deleted successfully" });
  });
};
