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

// Add grading period
exports.addGradingPeriod = (req, res) => {
  const { period_name, school_year_id, order_num } = req.body;

  if (!period_name || !school_year_id || !order_num)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "INSERT INTO grading_periods (period_name, school_year_id, order_num) VALUES (?, ?, ?)",
    [period_name, school_year_id, order_num],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({
        message: "Grading period added successfully",
        id: result.insertId,
      });
    },
  );
};

// Update grading period
exports.updateGradingPeriod = (req, res) => {
  const { id } = req.params;
  const { period_name, school_year_id, order_num } = req.body;

  if (!period_name || !school_year_id || !order_num)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "UPDATE grading_periods SET period_name = ?, school_year_id = ?, order_num = ? WHERE id = ?",
    [period_name, school_year_id, order_num, id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "Grading period updated successfully" });
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
