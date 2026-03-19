const db = require("../../config/db");

// Helper — always get active school year
const getActiveYear = async () => {
  const [rows] = await db
    .promise()
    .query("SELECT id FROM school_years WHERE is_active = 1 LIMIT 1");
  if (!rows.length) throw new Error("No active school year found.");
  return rows[0].id;
};

// Helper — get all school IDs assigned to school head
const getSchoolHeadSchools = async (user_id) => {
  const [rows] = await db
    .promise()
    .query("SELECT school_id FROM school_head_assignments WHERE user_id = ?", [
      user_id,
    ]);
  if (!rows.length) throw new Error("No schools assigned to this school head.");
  return rows.map((r) => r.school_id);
};

// GET all sections for school head's schools (active year)
exports.getSections = async (req, res) => {
  try {
    const school_year_id = await getActiveYear();
    const school_ids = await getSchoolHeadSchools(req.user.id);

    const [rows] = await db.promise().query(
      `SELECT 
        s.id, s.section_name, s.adviser_id,
        s.grade_level_id, s.school_id,
        gl.grade_name,
        sc.school_name,
        u.fullname AS adviser_name
       FROM sections s
       LEFT JOIN grade_levels gl ON s.grade_level_id = gl.id
       LEFT JOIN schools sc ON s.school_id = sc.id
       LEFT JOIN users u ON s.adviser_id = u.id
       WHERE s.school_id IN (?) AND s.school_year_id = ?
       ORDER BY gl.id, s.section_name`,
      [school_ids, school_year_id],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// POST create section
exports.createSection = async (req, res) => {
  try {
    const school_year_id = await getActiveYear();
    const school_ids = await getSchoolHeadSchools(req.user.id);
    const { section_name, grade_level_id, school_id } = req.body;

    if (!section_name || !grade_level_id)
      return res.status(400).json({ message: "All fields are required." });

    // If school_id provided, verify it belongs to school head
    // If not provided and school head has only one school, use that
    let target_school_id = school_id;

    if (!target_school_id) {
      if (school_ids.length === 1) {
        target_school_id = school_ids[0];
      } else {
        return res.status(400).json({
          message: "Please specify which school this section belongs to.",
        });
      }
    } else {
      if (!school_ids.includes(Number(target_school_id)))
        return res
          .status(403)
          .json({ message: "You are not assigned to this school." });
    }

    await db.promise().query(
      `INSERT INTO sections (section_name, grade_level_id, school_id, school_year_id)
       VALUES (?, ?, ?, ?)`,
      [section_name, grade_level_id, target_school_id, school_year_id],
    );

    res.json({ message: "Section created successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({
        message: "Section already exists in this school for the active year.",
      });
    res.status(500).json({ message: err.message });
  }
};

// PUT edit section
exports.updateSection = async (req, res) => {
  try {
    const { section_name, grade_level_id } = req.body;
    const { id } = req.params;

    await db
      .promise()
      .query(
        `UPDATE sections SET section_name = ?, grade_level_id = ? WHERE id = ?`,
        [section_name, grade_level_id, id],
      );

    res.json({ message: "Section updated successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({
        message: "Section already exists in this school for the active year.",
      });
    res.status(500).json({ message: err.message });
  }
};

// DELETE section
exports.deleteSection = async (req, res) => {
  try {
    await db
      .promise()
      .query("DELETE FROM sections WHERE id = ?", [req.params.id]);
    res.json({ message: "Section deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create teacher account (school head only)
exports.createTeacher = async (req, res) => {
  const bcrypt = require("bcryptjs");
  const { fullname, username, email, password, school_id } = req.body;

  if (!fullname || !username || !password)
    return res.status(400).json({ message: "All fields are required." });

  try {
    const school_ids = await getSchoolHeadSchools(req.user.id);

    // Determine which school to assign
    let target_school_id = school_id;
    if (!target_school_id) {
      if (school_ids.length === 1) {
        target_school_id = school_ids[0];
      } else {
        return res
          .status(400)
          .json({ message: "Please specify which school." });
      }
    } else {
      if (!school_ids.includes(Number(target_school_id)))
        return res
          .status(403)
          .json({ message: "You are not assigned to this school." });
    }

    const hashed = await bcrypt.hash(password, 10);

    await require("../../config/db")
      .promise()
      .query(
        `INSERT INTO users (fullname, username, email, password, role, school_id)
       VALUES (?, ?, ?, ?, 'teacher', ?)`,
        [fullname, username, email || null, hashed, target_school_id],
      );

    res.json({ message: "Teacher account created successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Username already exists." });
    res.status(500).json({ message: err.message });
  }
};

// PUT update teacher account
exports.updateTeacher = async (req, res) => {
  const bcrypt = require("bcryptjs");
  const { id } = req.params;
  const { fullname, username, email, password, school_id } = req.body;

  if (!fullname || !username)
    return res
      .status(400)
      .json({ message: "Full name and username are required." });

  try {
    const school_ids = await getSchoolHeadSchools(req.user.id);

    // Verify teacher belongs to school head's school
    const [teacher] = await db
      .promise()
      .query(
        "SELECT id, school_id FROM users WHERE id = ? AND role = 'teacher'",
        [id],
      );

    if (!teacher.length)
      return res.status(404).json({ message: "Teacher not found." });

    if (!school_ids.includes(Number(teacher[0].school_id)))
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this teacher." });

    // Determine target school
    let target_school_id = school_id || teacher[0].school_id;
    if (school_id && !school_ids.includes(Number(school_id)))
      return res
        .status(403)
        .json({ message: "You are not assigned to this school." });

    // Update with or without password
    if (password && password.length >= 6) {
      const hashed = await bcrypt.hash(password, 10);
      await db
        .promise()
        .query(
          `UPDATE users SET fullname = ?, username = ?, email = ?, password = ?, school_id = ? WHERE id = ?`,
          [fullname, username, email || null, hashed, target_school_id, id],
        );
    } else {
      await db
        .promise()
        .query(
          `UPDATE users SET fullname = ?, username = ?, email = ?, school_id = ? WHERE id = ?`,
          [fullname, username, email || null, target_school_id, id],
        );
    }

    res.json({ message: "Teacher updated successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Username already exists." });
    res.status(500).json({ message: err.message });
  }
};

// PUT assign teacher as adviser
exports.assignAdviser = async (req, res) => {
  try {
    const { adviser_id } = req.body;
    const { id } = req.params;
    const school_year_id = await getActiveYear();

    const [existing] = await db.promise().query(
      `SELECT id FROM sections 
       WHERE adviser_id = ? AND school_year_id = ? AND id != ?`,
      [adviser_id, school_year_id, id],
    );

    if (existing.length)
      return res.status(400).json({
        message: "Teacher is already assigned to another section.",
      });

    await db
      .promise()
      .query("UPDATE sections SET adviser_id = ? WHERE id = ?", [
        adviser_id,
        id,
      ]);

    res.json({ message: "Adviser assigned successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET teachers belonging to school head's schools
exports.getSchoolTeachers = async (req, res) => {
  try {
    const school_year_id = await getActiveYear();
    const school_ids = await getSchoolHeadSchools(req.user.id);

    const [rows] = await db.promise().query(
      `SELECT 
        u.id, u.fullname, u.username,
        u.school_id,
        sc.school_name,
        CASE WHEN s.id IS NOT NULL THEN true ELSE false END AS is_assigned,
        s.section_name AS assigned_section
       FROM users u
       LEFT JOIN schools sc ON u.school_id = sc.id
       LEFT JOIN sections s ON s.adviser_id = u.id AND s.school_year_id = ?
       WHERE u.role = 'teacher' AND u.school_id IN (?) AND u.is_active = 1`,
      [school_year_id, school_ids],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET assigned schools of school head
exports.getAssignedSchools = async (req, res) => {
  try {
    const school_ids = await getSchoolHeadSchools(req.user.id);

    const [rows] = await db.promise().query(
      `SELECT s.id, s.school_name, s.school_id as school_code
       FROM schools s
       WHERE s.id IN (?)`,
      [school_ids],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all teachers with their section assignment under school head's schools
exports.getSchoolTeacherList = async (req, res) => {
  try {
    const school_year_id = await getActiveYear();
    const school_ids = await getSchoolHeadSchools(req.user.id);

    const [rows] = await db.promise().query(
      `SELECT 
        u.id, u.fullname, u.username, u.email, u.is_active,
        u.school_id,
        sc.school_name,
        s.id AS section_id,
        s.section_name,
        gl.grade_name
       FROM users u
       LEFT JOIN schools sc ON u.school_id = sc.id
       LEFT JOIN sections s ON s.adviser_id = u.id AND s.school_year_id = ?
       LEFT JOIN grade_levels gl ON s.grade_level_id = gl.id
       WHERE u.role = 'teacher' AND u.school_id IN (?) AND u.is_active = 1
       ORDER BY sc.school_name, u.fullname ASC`,
      [school_year_id, school_ids],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
