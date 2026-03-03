const db = require("../../config/db");

// Get all grade levels
exports.getAllGradeLevels = (req, res) => {
  db.query(`SELECT * FROM grade_levels ORDER BY id ASC`, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

// Get grade level by ID
exports.getGradeLevelById = (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM grade_levels WHERE id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Grade level not found" });
    res.json(results[0]);
  });
};

// Add grade level
exports.addGradeLevel = (req, res) => {
  const { grade_name } = req.body;

  if (!grade_name)
    return res.status(400).json({ message: "Grade name is required" });

  db.query(
    "INSERT INTO grade_levels (grade_name) VALUES (?)",
    [grade_name],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res
            .status(400)
            .json({ message: "Grade level already exists" });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({
        message: "Grade level added successfully",
        id: result.insertId,
      });
    },
  );
};

// Update grade level
exports.updateGradeLevel = (req, res) => {
  const { id } = req.params;
  const { grade_name } = req.body;

  if (!grade_name)
    return res.status(400).json({ message: "Grade name is required" });

  db.query(
    "UPDATE grade_levels SET grade_name = ? WHERE id = ?",
    [grade_name, id],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY")
          return res
            .status(400)
            .json({ message: "Grade level already exists" });
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ message: "Grade level updated successfully" });
    },
  );
};

// Delete grade level
exports.deleteGradeLevel = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM grade_levels WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Grade level deleted successfully" });
  });
};
