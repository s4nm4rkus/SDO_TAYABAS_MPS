const db = require("../../config/db");

// Get all schools
exports.getAllSchools = (req, res) => {
  db.query("SELECT * FROM schools ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

// Get single school
exports.getSchoolById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM schools WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (!results.length)
      return res.status(404).json({ message: "School not found" });
    res.json(results[0]);
  });
};

// Add new school
exports.addSchool = (req, res) => {
  const { school_name, school_id, cluster_id } = req.body;

  if (!school_name || !school_id || !cluster_id)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "INSERT INTO schools (school_name, school_id, cluster_id) VALUES (?, ?, ?)",
    [school_name, school_id, cluster_id],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "School ID already exists" });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ message: "School added successfully", id: result.insertId });
    },
  );
};

// Update school
exports.updateSchool = (req, res) => {
  const { id } = req.params;
  const { school_name, school_id, cluster_id } = req.body;

  if (!school_name || !school_id || !cluster_id)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "UPDATE schools SET school_name = ?, school_id = ?, cluster_id = ? WHERE id = ?",
    [school_name, school_id, cluster_id, id],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res.status(400).json({ message: "School ID already exists" });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ message: "School updated successfully" });
    },
  );
};

// Delete school
exports.deleteSchool = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM schools WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "School deleted successfully" });
  });
};
