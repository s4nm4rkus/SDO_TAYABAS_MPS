const db = require("../../config/db");

exports.getAllSchools = (req, res) => {
  db.query("SELECT * FROM schools ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

exports.getSchoolById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM schools WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (!results.length)
      return res.status(404).json({ message: "School not found" });
    res.json(results[0]);
  });
};

// cluster_id now optional
exports.addSchool = (req, res) => {
  const { school_name, school_id, cluster_id } = req.body;
  if (!school_name || !school_id)
    return res
      .status(400)
      .json({ message: "School name and ID are required." });

  db.query(
    "INSERT INTO schools (school_name, school_id, cluster_id) VALUES (?, ?, ?)",
    [school_name, school_id, cluster_id || null],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "School ID already exists." });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ message: "School added successfully", id: result.insertId });
    },
  );
};

// cluster_id now optional
exports.updateSchool = (req, res) => {
  const { id } = req.params;
  const { school_name, school_id, cluster_id } = req.body;
  if (!school_name || !school_id)
    return res
      .status(400)
      .json({ message: "School name and ID are required." });

  db.query(
    "UPDATE schools SET school_name = ?, school_id = ?, cluster_id = ? WHERE id = ?",
    [school_name, school_id, cluster_id || null, id],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "School ID already exists." });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ message: "School updated successfully." });
    },
  );
};

exports.deleteSchool = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM schools WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "School deleted successfully." });
  });
};

exports.getSchoolsByCluster = (req, res) => {
  const { cluster_id } = req.params;
  const query =
    cluster_id === "unassigned"
      ? `SELECT s.*, c.cluster_name FROM schools s
       LEFT JOIN clusters c ON s.cluster_id = c.id
       WHERE s.cluster_id IS NULL OR s.cluster_id = 0`
      : `SELECT s.*, c.cluster_name FROM schools s
       LEFT JOIN clusters c ON s.cluster_id = c.id
       WHERE s.cluster_id = ?`;
  const params = cluster_id === "unassigned" ? [] : [cluster_id];
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

exports.getClustersWithCount = (req, res) => {
  db.query(
    `SELECT c.id, c.cluster_name, c.cluster_code,
      COUNT(DISTINCT s.id) AS school_count,
      u.fullname AS supervisor_name
     FROM clusters c
     LEFT JOIN schools s ON s.cluster_id = c.id
     LEFT JOIN users u ON u.cluster_id = c.id AND u.role = 'supervisor'
     GROUP BY c.id, c.cluster_name, c.cluster_code, u.fullname
     ORDER BY c.cluster_name ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    },
  );
};

exports.getUnassignedCount = (req, res) => {
  db.query(
    "SELECT COUNT(*) as count FROM schools WHERE cluster_id IS NULL OR cluster_id = 0",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results[0]);
    },
  );
};

// Bulk assign schools to cluster
exports.assignSchoolsToCluster = (req, res) => {
  const { cluster_id } = req.params;
  const { school_ids } = req.body;
  if (!school_ids?.length)
    return res.status(400).json({ message: "No schools selected." });
  db.query(
    "UPDATE schools SET cluster_id = ? WHERE id IN (?)",
    [cluster_id, school_ids],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "Schools assigned successfully." });
    },
  );
};
