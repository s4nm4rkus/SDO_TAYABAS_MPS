const db = require("../../config/db");

// Get all grade levels with their subjects
exports.getAllGradeLevels = async (req, res) => {
  try {
    const [gradeLevels] = await db
      .promise()
      .query(`SELECT * FROM grade_levels ORDER BY id ASC`);

    const [assignments] = await db.promise().query(
      `SELECT gls.grade_level_id, s.id, s.subject_name, s.subject_code
       FROM grade_level_subjects gls
       JOIN subjects s ON gls.subject_id = s.id`,
    );

    const result = gradeLevels.map((gl) => ({
      ...gl,
      subjects: assignments
        .filter((a) => a.grade_level_id === gl.id)
        .map((a) => ({
          id: a.id,
          subject_name: a.subject_name,
          subject_code: a.subject_code,
        })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get grade level by ID with subjects
exports.getGradeLevelById = async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query(`SELECT * FROM grade_levels WHERE id = ?`, [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ message: "Grade level not found" });

    const [subjects] = await db.promise().query(
      `SELECT s.id, s.subject_name, s.subject_code
       FROM grade_level_subjects gls
       JOIN subjects s ON gls.subject_id = s.id
       WHERE gls.grade_level_id = ?`,
      [req.params.id],
    );

    res.json({ ...rows[0], subjects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add grade level with subjects
exports.addGradeLevel = async (req, res) => {
  const { grade_name, subject_ids } = req.body;

  if (!grade_name)
    return res.status(400).json({ message: "Grade name is required" });

  try {
    const [result] = await db
      .promise()
      .query("INSERT INTO grade_levels (grade_name) VALUES (?)", [grade_name]);

    const grade_level_id = result.insertId;

    // Assign subjects if provided
    if (subject_ids?.length) {
      for (const subject_id of subject_ids) {
        await db
          .promise()
          .query(
            "INSERT INTO grade_level_subjects (grade_level_id, subject_id) VALUES (?, ?)",
            [grade_level_id, subject_id],
          );
      }
    }

    res.json({
      message: "Grade level added successfully.",
      id: grade_level_id,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Grade level already exists." });
    res.status(500).json({ message: err.message });
  }
};

// Update grade level name and subjects
exports.updateGradeLevel = async (req, res) => {
  const { id } = req.params;
  const { grade_name, subject_ids } = req.body;

  if (!grade_name)
    return res.status(400).json({ message: "Grade name is required" });

  try {
    await db
      .promise()
      .query("UPDATE grade_levels SET grade_name = ? WHERE id = ?", [
        grade_name,
        id,
      ]);

    // Replace subject assignments
    if (subject_ids !== undefined) {
      await db
        .promise()
        .query("DELETE FROM grade_level_subjects WHERE grade_level_id = ?", [
          id,
        ]);
      for (const subject_id of subject_ids) {
        await db
          .promise()
          .query(
            "INSERT INTO grade_level_subjects (grade_level_id, subject_id) VALUES (?, ?)",
            [id, subject_id],
          );
      }
    }

    res.json({ message: "Grade level updated successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Grade level already exists." });
    res.status(500).json({ message: err.message });
  }
};

// Delete grade level — cascade deletes grade_level_subjects
exports.deleteGradeLevel = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM grade_levels WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Grade level deleted successfully." });
  });
};

// Get subjects for a specific grade level
exports.getGradeLevelSubjects = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT s.id, s.subject_name, s.subject_code
       FROM grade_level_subjects gls
       JOIN subjects s ON gls.subject_id = s.id
       WHERE gls.grade_level_id = ?`,
      [req.params.id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
