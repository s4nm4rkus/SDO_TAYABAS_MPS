const db = require("../../config/db");

// Get all subjects
exports.getAllSubjects = (req, res) => {
  db.query(
    `SELECT * FROM subjects ORDER BY subject_name ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    },
  );
};

// Get subject by ID
exports.getSubjectById = (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM subjects WHERE id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Subject not found" });
    res.json(results[0]);
  });
};

// Add subject
exports.addSubject = (req, res) => {
  const { subject_name, subject_code } = req.body;

  if (!subject_name || !subject_code)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "INSERT INTO subjects (subject_name, subject_code) VALUES (?, ?)",
    [subject_name, subject_code],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({
        message: "Subject added successfully",
        id: result.insertId,
      });
    },
  );
};

// Update subject
exports.updateSubject = (req, res) => {
  const { id } = req.params;
  const { subject_name, subject_code } = req.body;

  if (!subject_name || !subject_code)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "UPDATE subjects SET subject_name = ?, subject_code = ? WHERE id = ?",
    [subject_name, subject_code, id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "Subject updated successfully" });
    },
  );
};

exports.deleteSubject = async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === "true";

  const connection = await db.promise().getConnection();
  try {
    const [assessments] = await connection.query(
      "SELECT COUNT(*) AS count FROM assessments WHERE subject_id = ?",
      [id],
    );
    const count = assessments[0].count;

    if (count > 0 && !force) {
      connection.release();
      return res.status(409).json({
        message: `This subject has ${count} assessment record(s) linked to it.`,
        requiresConfirmation: true,
        dependentCount: count,
      });
    }

    await connection.beginTransaction();

    if (count > 0) {
      await connection.query("DELETE FROM assessments WHERE subject_id = ?", [
        id,
      ]);
    }

    const [result] = await connection.query(
      "DELETE FROM subjects WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "Subject not found." });
    }

    await connection.commit();
    connection.release();
    res.json({
      message:
        count > 0
          ? `Subject deleted along with ${count} assessment record(s).`
          : "Subject deleted successfully.",
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ message: err.message });
  }
};
