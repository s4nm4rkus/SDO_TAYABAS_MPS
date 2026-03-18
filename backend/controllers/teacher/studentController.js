const db = require("../../config/db");

// Helper — get active school year
const getActiveYear = async () => {
  const [rows] = await db
    .promise()
    .query("SELECT id FROM school_years WHERE is_active = 1 LIMIT 1");
  if (!rows.length) throw new Error("No active school year found.");
  return rows[0].id;
};

// Helper — get teacher's assigned section for active year
const getTeacherSection = async (teacher_id) => {
  const school_year_id = await getActiveYear();
  const [rows] = await db.promise().query(
    `SELECT s.id, s.section_name, s.grade_level_id, s.school_id,
      gl.grade_name, sc.school_name
     FROM sections s
     LEFT JOIN grade_levels gl ON s.grade_level_id = gl.id
     LEFT JOIN schools sc ON s.school_id = sc.id
     WHERE s.adviser_id = ? AND s.school_year_id = ?
     LIMIT 1`,
    [teacher_id, school_year_id],
  );
  if (!rows.length) throw new Error("No section assigned to this teacher.");
  return rows[0];
};

// GET teacher's section info
exports.getMySection = async (req, res) => {
  try {
    const section = await getTeacherSection(req.user.id);
    res.json(section);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// GET all students in teacher's section
exports.getMyStudents = async (req, res) => {
  try {
    const section = await getTeacherSection(req.user.id);
    const school_year_id = await getActiveYear();

    const [rows] = await db.promise().query(
      `SELECT * FROM students
       WHERE section_id = ? AND school_year_id = ?
       ORDER BY lastname, firstname ASC`,
      [section.id, school_year_id],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST add student to teacher's section
exports.addStudent = async (req, res) => {
  try {
    const section = await getTeacherSection(req.user.id);
    const school_year_id = await getActiveYear();
    const {
      lrn,
      firstname,
      middlename,
      lastname,
      gender,
      birthdate,
      address,
      contact_number,
    } = req.body;

    if (!lrn || !firstname || !lastname || !gender)
      return res
        .status(400)
        .json({
          message: "LRN, first name, last name and gender are required.",
        });

    await db.promise().query(
      `INSERT INTO students 
        (lrn, firstname, middlename, lastname, gender, birthdate, address, contact_number,
         section_id, grade_level_id, school_id, school_year_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lrn,
        firstname,
        middlename || null,
        lastname,
        gender,
        birthdate || null,
        address || null,
        contact_number || null,
        section.id,
        section.grade_level_id,
        section.school_id,
        school_year_id,
      ],
    );

    res.json({ message: "Student added successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ message: "LRN already exists for this school year." });
    res.status(500).json({ message: err.message });
  }
};

// PUT update student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lrn,
      firstname,
      middlename,
      lastname,
      gender,
      birthdate,
      address,
      contact_number,
    } = req.body;

    if (!lrn || !firstname || !lastname || !gender)
      return res
        .status(400)
        .json({
          message: "LRN, first name, last name and gender are required.",
        });

    await db.promise().query(
      `UPDATE students SET
        lrn = ?, firstname = ?, middlename = ?, lastname = ?,
        gender = ?, birthdate = ?, address = ?, contact_number = ?
       WHERE id = ?`,
      [
        lrn,
        firstname,
        middlename || null,
        lastname,
        gender,
        birthdate || null,
        address || null,
        contact_number || null,
        id,
      ],
    );

    res.json({ message: "Student updated successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ message: "LRN already exists for this school year." });
    res.status(500).json({ message: err.message });
  }
};

// DELETE student
exports.deleteStudent = async (req, res) => {
  try {
    await db
      .promise()
      .query("DELETE FROM students WHERE id = ?", [req.params.id]);
    res.json({ message: "Student deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
