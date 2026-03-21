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

exports.getSchoolHeadDashboard = async (req, res) => {
  try {
    const school_year_id = await getActiveYear();
    const school_ids = await getSchoolHeadSchools(req.user.id);

    // Active quarter
    const [quarters] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [school_year_id],
    );
    const activeQuarter = quarters.find((q) => q.is_active);

    // Schools info
    const [schools] = await db
      .promise()
      .query(`SELECT id, school_name FROM schools WHERE id IN (?)`, [
        school_ids,
      ]);

    // Sections
    const [sections] = await db.promise().query(
      `SELECT s.id, s.section_name, s.adviser_id, s.grade_level_id,
        gl.grade_name, sc.school_name
       FROM sections s
       LEFT JOIN grade_levels gl ON s.grade_level_id = gl.id
       LEFT JOIN schools sc ON s.school_id = sc.id
       WHERE s.school_id IN (?) AND s.school_year_id = ?`,
      [school_ids, school_year_id],
    );

    // Teachers
    const [teachers] = await db.promise().query(
      `SELECT u.id, u.school_id,
        CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS is_assigned
       FROM users u
       LEFT JOIN sections s ON s.adviser_id = u.id AND s.school_year_id = ?
       WHERE u.role = 'teacher' AND u.school_id IN (?) AND u.is_active = 1`,
      [school_year_id, school_ids],
    );

    // Students
    const [students] = await db.promise().query(
      `SELECT id, gender, section_id FROM students
       WHERE school_id IN (?) AND school_year_id = ?`,
      [school_ids, school_year_id],
    );

    // MPS per grade level for active quarter
    const gradeMPS = [];
    if (activeQuarter) {
      // Get unique grade levels from sections
      const gradeLevelIds = [...new Set(sections.map((s) => s.grade_level_id))];

      for (const grade_level_id of gradeLevelIds) {
        const gradeSections = sections.filter(
          (s) => s.grade_level_id === grade_level_id,
        );
        const sectionIds = gradeSections.map((s) => s.id);
        if (!sectionIds.length) continue;

        // Get all assessment scores for this grade level
        const [scores] = await db.promise().query(
          `SELECT acs.score, st.gender, a.total_items
           FROM assessment_scores acs
           JOIN assessments a ON acs.assessment_id = a.id
           JOIN students st ON acs.student_id = st.id
           WHERE a.section_id IN (?) AND a.grading_period_id = ? AND a.school_year_id = ?`,
          [sectionIds, activeQuarter.id, school_year_id],
        );

        if (!scores.length) continue;

        const allScores = scores.map(
          (s) => (Number(s.score) / Number(s.total_items)) * 100,
        );
        const maleScores = scores
          .filter((s) => s.gender === "Male")
          .map((s) => (Number(s.score) / Number(s.total_items)) * 100);
        const femaleScores = scores
          .filter((s) => s.gender === "Female")
          .map((s) => (Number(s.score) / Number(s.total_items)) * 100);

        const avg = (arr) =>
          arr.length
            ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
            : null;
        const sd = (arr) => {
          if (!arr.length) return null;
          const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
          return Math.sqrt(
            arr.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / arr.length,
          ).toFixed(2);
        };

        gradeMPS.push({
          grade_level_id,
          grade_name: gradeSections[0].grade_name,
          section_count: gradeSections.length,
          student_count: students.filter((s) =>
            sectionIds.includes(s.section_id),
          ).length,
          class_mps: avg(allScores),
          class_sd: sd(allScores),
          male_mps: avg(maleScores),
          female_mps: avg(femaleScores),
        });
      }
    }

    res.json({
      schools,
      active_quarter: activeQuarter || null,
      quarters,
      stats: {
        total_sections: sections.length,
        assigned_sections: sections.filter((s) => s.adviser_id).length,
        unassigned_sections: sections.filter((s) => !s.adviser_id).length,
        total_teachers: teachers.length,
        assigned_teachers: teachers.filter((t) => t.is_assigned).length,
        unassigned_teachers: teachers.filter((t) => !t.is_assigned).length,
        total_students: students.length,
        male_students: students.filter((s) => s.gender === "Male").length,
        female_students: students.filter((s) => s.gender === "Female").length,
      },
      grade_mps: gradeMPS,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE teacher account
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const school_ids = await getSchoolHeadSchools(req.user.id);

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
        .json({ message: "Not authorized to delete this teacher." });

    await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "Teacher deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT unassign teacher from section
exports.unassignTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const school_ids = await getSchoolHeadSchools(req.user.id);
    const school_year_id = await getActiveYear();

    const [teacher] = await db
      .promise()
      .query(
        "SELECT id, school_id FROM users WHERE id = ? AND role = 'teacher'",
        [id],
      );

    if (!teacher.length)
      return res.status(404).json({ message: "Teacher not found." });

    if (!school_ids.includes(Number(teacher[0].school_id)))
      return res.status(403).json({ message: "Not authorized." });

    await db
      .promise()
      .query(
        "UPDATE sections SET adviser_id = NULL WHERE adviser_id = ? AND school_year_id = ?",
        [id, school_year_id],
      );

    res.json({ message: "Teacher unassigned successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
