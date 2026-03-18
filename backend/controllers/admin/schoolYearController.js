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

exports.addSchoolYear = async (req, res) => {
  const { year_label, is_active, num_quarters } = req.body;

  if (!year_label)
    return res.status(400).json({ message: "year_label is required" });

  if (!num_quarters || num_quarters < 1 || num_quarters > 4)
    return res
      .status(400)
      .json({ message: "num_quarters must be between 1 and 4" });

  try {
    // Deactivate all if setting active
    if (is_active) {
      await db.promise().query("UPDATE school_years SET is_active = 0");
    }

    // Insert school year
    const [result] = await db
      .promise()
      .query("INSERT INTO school_years (year_label, is_active) VALUES (?, ?)", [
        year_label,
        is_active ? 1 : 0,
      ]);

    const school_year_id = result.insertId;

    // Auto-generate quarters
    for (let i = 1; i <= num_quarters; i++) {
      await db
        .promise()
        .query(
          "INSERT INTO grading_periods (period_name, school_year_id, order_num) VALUES (?, ?, ?)",
          [`Quarter ${i}`, school_year_id, i],
        );
    }

    res.json({
      message: "School year and quarters created successfully.",
      id: school_year_id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

exports.deleteSchoolYear = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete quarters first
    await db
      .promise()
      .query("DELETE FROM grading_periods WHERE school_year_id = ?", [id]);
    // Delete school year
    await db.promise().query("DELETE FROM school_years WHERE id = ?", [id]);
    res.json({ message: "School year and its quarters deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
