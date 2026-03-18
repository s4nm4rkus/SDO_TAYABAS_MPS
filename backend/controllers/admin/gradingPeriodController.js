const db = require("../../config/db");

// Get all grading periods
exports.getAllGradingPeriods = (req, res) => {
  db.query(
    `SELECT gp.*, sy.year_label 
     FROM grading_periods gp
     JOIN school_years sy ON gp.school_year_id = sy.id
     ORDER BY gp.school_year_id, gp.order_num ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    },
  );
};

// Get grading periods by school year
exports.getGradingPeriodsByYear = (req, res) => {
  const { school_year_id } = req.params;
  db.query(
    `SELECT gp.*, sy.year_label 
     FROM grading_periods gp
     JOIN school_years sy ON gp.school_year_id = sy.id
     WHERE gp.school_year_id = ?
     ORDER BY gp.order_num ASC`,
    [school_year_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    },
  );
};

// Update grading period name only
exports.updateGradingPeriod = (req, res) => {
  const { id } = req.params;
  const { period_name } = req.body;

  if (!period_name)
    return res.status(400).json({ message: "Period name is required" });

  db.query(
    "UPDATE grading_periods SET period_name = ? WHERE id = ?",
    [period_name, id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "Grading period updated successfully" });
    },
  );
};

// Set active grading period
exports.setActiveGradingPeriod = (req, res) => {
  const { id } = req.params;

  // Get school_year_id of this period first
  db.query(
    "SELECT school_year_id FROM grading_periods WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (!results.length)
        return res.status(404).json({ message: "Grading period not found" });

      const { school_year_id } = results[0];

      // Deactivate all periods in same school year
      db.query(
        "UPDATE grading_periods SET is_active = 0 WHERE school_year_id = ?",
        [school_year_id],
        (err) => {
          if (err)
            return res.status(500).json({ message: "DB error", error: err });

          // Set this one active
          db.query(
            "UPDATE grading_periods SET is_active = 1 WHERE id = ?",
            [id],
            (err) => {
              if (err)
                return res
                  .status(500)
                  .json({ message: "DB error", error: err });
              res.json({
                message: "Active grading period updated successfully",
              });
            },
          );
        },
      );
    },
  );
};

// Delete grading period
exports.deleteGradingPeriod = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM grading_periods WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Grading period deleted successfully" });
  });
};
