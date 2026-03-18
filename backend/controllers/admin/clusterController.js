const db = require("../../config/db");

// Get all clusters with their schools
exports.getAllClusters = async (req, res) => {
  try {
    const [clusters] = await db
      .promise()
      .query("SELECT * FROM clusters ORDER BY id DESC");

    const [schools] = await db
      .promise()
      .query("SELECT * FROM schools ORDER BY school_name ASC");

    const result = clusters.map((c) => ({
      ...c,
      schools: schools.filter((s) => s.cluster_id === c.id),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single cluster with schools
exports.getClusterById = async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM clusters WHERE id = ?", [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ message: "Cluster not found" });

    const [schools] = await db
      .promise()
      .query(
        "SELECT * FROM schools WHERE cluster_id = ? ORDER BY school_name ASC",
        [req.params.id],
      );

    res.json({ ...rows[0], schools });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add cluster with schools inline
exports.addCluster = async (req, res) => {
  const { cluster_name, cluster_code, schools } = req.body;

  if (!cluster_name || !cluster_code)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO clusters (cluster_name, cluster_code) VALUES (?, ?)",
        [cluster_name, cluster_code],
      );

    const cluster_id = result.insertId;

    // Add schools if provided
    if (schools?.length) {
      for (const school of schools) {
        if (!school.school_name || !school.school_id) continue;
        await db
          .promise()
          .query(
            "INSERT INTO schools (school_name, school_id, cluster_id) VALUES (?, ?, ?)",
            [school.school_name, school.school_id, cluster_id],
          );
      }
    }

    res.json({
      message: "Cluster and schools added successfully.",
      id: cluster_id,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ message: "Cluster code or School ID already exists." });
    res.status(500).json({ message: err.message });
  }
};

// Update cluster
exports.updateCluster = async (req, res) => {
  const { id } = req.params;
  const { cluster_name, cluster_code } = req.body;

  if (!cluster_name || !cluster_code)
    return res.status(400).json({ message: "All fields are required" });

  try {
    await db
      .promise()
      .query(
        "UPDATE clusters SET cluster_name = ?, cluster_code = ? WHERE id = ?",
        [cluster_name, cluster_code, id],
      );
    res.json({ message: "Cluster updated successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Cluster code already exists." });
    res.status(500).json({ message: err.message });
  }
};

// Delete cluster — sets schools cluster_id to NULL
exports.deleteCluster = async (req, res) => {
  const { id } = req.params;
  try {
    // Unassign schools first
    await db
      .promise()
      .query("UPDATE schools SET cluster_id = NULL WHERE cluster_id = ?", [id]);
    await db.promise().query("DELETE FROM clusters WHERE id = ?", [id]);
    res.json({ message: "Cluster deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
