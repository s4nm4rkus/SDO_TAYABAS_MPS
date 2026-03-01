const db = require("../../config/db");

// Get all school years
exports.getAllSchoolYears = (req, res) => {
  db.query("SELECT * FROM school_years ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json(results);
  });
};

// Get active school year
exports.getActiveSchoolYear = (req, res) => {
  db.query(
    "SELECT * FROM school_years WHERE is_active = 1 LIMIT 1",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!results.length)
        return res.status(404).json({ message: "No active school year found" });
      res.json(results[0]);
    },
  );
};

// Add new school year
exports.addSchoolYear = (req, res) => {
  const { year_label, is_active } = req.body;

  if (!year_label)
    return res.status(400).json({ message: "year_label is required" });

  // If new entry is active, deactivate all others first
  if (is_active) {
    db.query("UPDATE school_years SET is_active = 0", (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });

      db.query(
        "INSERT INTO school_years (year_label, is_active) VALUES (?, ?)",
        [year_label, 1],
        (err, result) => {
          if (err)
            return res.status(500).json({ message: "DB error", error: err });
          res.json({
            message: "School year added successfully",
            id: result.insertId,
          });
        },
      );
    });
  } else {
    db.query(
      "INSERT INTO school_years (year_label, is_active) VALUES (?, ?)",
      [year_label, 0],
      (err, result) => {
        if (err)
          return res.status(500).json({ message: "DB error", error: err });
        res.json({
          message: "School year added successfully",
          id: result.insertId,
        });
      },
    );
  }
};

// Update/edit a school year
exports.updateSchoolYear = (req, res) => {
  const { id } = req.params;
  const { year_label, is_active } = req.body;

  // If setting this one active, deactivate all others first
  if (is_active) {
    db.query("UPDATE school_years SET is_active = 0", (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });

      db.query(
        "UPDATE school_years SET year_label = ?, is_active = ? WHERE id = ?",
        [year_label, 1, id],
        (err) => {
          if (err)
            return res.status(500).json({ message: "DB error", error: err });
          res.json({ message: "School year updated successfully" });
        },
      );
    });
  } else {
    db.query(
      "UPDATE school_years SET year_label = ?, is_active = ? WHERE id = ?",
      [year_label, 0, id],
      (err) => {
        if (err)
          return res.status(500).json({ message: "DB error", error: err });
        res.json({ message: "School year updated successfully" });
      },
    );
  }
};

// Delete a school year
exports.deleteSchoolYear = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM school_years WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "School year deleted successfully" });
  });
};
