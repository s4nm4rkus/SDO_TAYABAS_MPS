const db = require("../../config/db");

const getActiveYear = async () => {
  const [rows] = await db
    .promise()
    .query(
      "SELECT id, year_label FROM school_years WHERE is_active = 1 LIMIT 1",
    );
  if (!rows.length) throw new Error("No active school year found.");
  return rows[0];
};

const getSupervisorCluster = async (user_id) => {
  const [rows] = await db.promise().query(
    `SELECT u.cluster_id, c.cluster_name
     FROM users u
     LEFT JOIN clusters c ON u.cluster_id = c.id
     WHERE u.id = ? AND u.role = 'supervisor'`,
    [user_id],
  );
  if (!rows.length || !rows[0].cluster_id)
    throw new Error("No cluster assigned to this supervisor.");
  return rows[0];
};

const getClusterSchools = async (cluster_id) => {
  const [rows] = await db
    .promise()
    .query("SELECT id, school_name FROM schools WHERE cluster_id = ?", [
      cluster_id,
    ]);
  if (!rows.length) throw new Error("No schools found in this cluster.");
  return rows;
};

// GET grading periods
exports.getGradingPeriods = async (req, res) => {
  try {
    const year = await getActiveYear();
    const [rows] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods
       WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [year.id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET supervisor dashboard
exports.getDashboard = async (req, res) => {
  try {
    const year = await getActiveYear();
    const cluster = await getSupervisorCluster(req.user.id);
    const schools = await getClusterSchools(cluster.cluster_id);
    const schoolIds = schools.map((s) => s.id);

    // Active quarter
    const [quarters] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [year.id],
    );
    const activeQuarter = quarters.find((q) => q.is_active);

    // Stats per school
    const schoolStats = [];
    for (const school of schools) {
      const [sections] = await db.promise().query(
        `SELECT id, adviser_id FROM sections
         WHERE school_id = ? AND school_year_id = ?`,
        [school.id, year.id],
      );
      const [teachers] = await db.promise().query(
        `SELECT u.id,
          CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS is_assigned
         FROM users u
         LEFT JOIN sections s ON s.adviser_id = u.id AND s.school_year_id = ?
         WHERE u.role = 'teacher' AND u.school_id = ? AND u.is_active = 1`,
        [year.id, school.id],
      );
      const [students] = await db.promise().query(
        `SELECT id, gender FROM students
         WHERE school_id = ? AND school_year_id = ?`,
        [school.id, year.id],
      );

      schoolStats.push({
        school_id: school.id,
        school_name: school.school_name,
        total_sections: sections.length,
        assigned_sections: sections.filter((s) => s.adviser_id).length,
        unassigned_sections: sections.filter((s) => !s.adviser_id).length,
        total_teachers: teachers.length,
        assigned_teachers: teachers.filter((t) => t.is_assigned).length,
        unassigned_teachers: teachers.filter((t) => !t.is_assigned).length,
        total_students: students.length,
        male_students: students.filter((s) => s.gender === "Male").length,
        female_students: students.filter((s) => s.gender === "Female").length,
      });
    }

    // Overall stats
    const stats = {
      total_schools: schools.length,
      total_sections: schoolStats.reduce((s, x) => s + x.total_sections, 0),
      assigned_sections: schoolStats.reduce(
        (s, x) => s + x.assigned_sections,
        0,
      ),
      unassigned_sections: schoolStats.reduce(
        (s, x) => s + x.unassigned_sections,
        0,
      ),
      total_teachers: schoolStats.reduce((s, x) => s + x.total_teachers, 0),
      assigned_teachers: schoolStats.reduce(
        (s, x) => s + x.assigned_teachers,
        0,
      ),
      unassigned_teachers: schoolStats.reduce(
        (s, x) => s + x.unassigned_teachers,
        0,
      ),
      total_students: schoolStats.reduce((s, x) => s + x.total_students, 0),
      male_students: schoolStats.reduce((s, x) => s + x.male_students, 0),
      female_students: schoolStats.reduce((s, x) => s + x.female_students, 0),
    };

    // MPS per school for active quarter
    const schoolMPS = [];
    if (activeQuarter) {
      for (const school of schools) {
        const [sectionRows] = await db
          .promise()
          .query(
            `SELECT id FROM sections WHERE school_id = ? AND school_year_id = ?`,
            [school.id, year.id],
          );
        const sectionIds = sectionRows.map((s) => s.id);
        if (!sectionIds.length) continue;

        const [scores] = await db.promise().query(
          `SELECT acs.score, st.gender, a.total_items
           FROM assessment_scores acs
           JOIN assessments a ON acs.assessment_id = a.id
           JOIN students st ON acs.student_id = st.id
           WHERE a.section_id IN (?)
             AND a.grading_period_id = ?
             AND a.school_year_id = ?`,
          [sectionIds, activeQuarter.id, year.id],
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

        schoolMPS.push({
          school_id: school.id,
          school_name: school.school_name,
          class_mps: avg(allScores),
          male_mps: avg(maleScores),
          female_mps: avg(femaleScores),
        });
      }
    }

    res.json({
      cluster: {
        id: cluster.cluster_id,
        name: cluster.cluster_name,
      },
      active_year: year,
      active_quarter: activeQuarter || null,
      quarters,
      schools,
      stats,
      school_stats: schoolStats,
      school_mps: schoolMPS,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MPS report per school → grade level → section
exports.getMPSReport = async (req, res) => {
  try {
    const year = await getActiveYear();
    const cluster = await getSupervisorCluster(req.user.id);
    const schools = await getClusterSchools(cluster.cluster_id);
    const { grading_period_id } = req.params;

    const computeMPS = (scores) => {
      if (!scores.length) return null;
      return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    };

    const computeSD = (scores) => {
      if (!scores.length) return null;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance =
        scores.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
        scores.length;
      return Math.sqrt(variance).toFixed(2);
    };

    const buildSubjectRow = (subject, scores) => {
      if (!scores.length)
        return {
          subject_id: subject.id,
          subject_name: subject.subject_name,
          subject_code: subject.subject_code,
          male: { mps: null, sd: null },
          female: { mps: null, sd: null },
          class: { mps: null, sd: null },
        };
      const maleScores = scores
        .filter((s) => s.gender === "Male")
        .map((s) => (Number(s.score) / Number(s.total_items)) * 100);
      const femaleScores = scores
        .filter((s) => s.gender === "Female")
        .map((s) => (Number(s.score) / Number(s.total_items)) * 100);
      const allScores = scores.map(
        (s) => (Number(s.score) / Number(s.total_items)) * 100,
      );
      return {
        subject_id: subject.id,
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        male: { mps: computeMPS(maleScores), sd: computeSD(maleScores) },
        female: { mps: computeMPS(femaleScores), sd: computeSD(femaleScores) },
        class: { mps: computeMPS(allScores), sd: computeSD(allScores) },
      };
    };

    const report = [];

    for (const school of schools) {
      // Get grade levels for this school
      const [gradeLevels] = await db.promise().query(
        `SELECT DISTINCT gl.id, gl.grade_name
         FROM sections s
         JOIN grade_levels gl ON s.grade_level_id = gl.id
         WHERE s.school_id = ? AND s.school_year_id = ?
         ORDER BY gl.id ASC`,
        [school.id, year.id],
      );

      const gradeReport = [];

      for (const grade of gradeLevels) {
        // Get sections with adviser
        const [sections] = await db.promise().query(
          `SELECT s.id, s.section_name,
            u.fullname AS adviser_name
           FROM sections s
           LEFT JOIN users u ON s.adviser_id = u.id
           WHERE s.grade_level_id = ? AND s.school_id = ? AND s.school_year_id = ?
           ORDER BY s.section_name ASC`,
          [grade.id, school.id, year.id],
        );

        if (!sections.length) continue;
        const sectionIds = sections.map((s) => s.id);

        // Subjects for this grade
        const [gradeSubjects] = await db.promise().query(
          `SELECT s.id, s.subject_name, s.subject_code
           FROM grade_level_subjects gls
           JOIN subjects s ON gls.subject_id = s.id
           WHERE gls.grade_level_id = ?
           ORDER BY s.subject_name ASC`,
          [grade.id],
        );

        // Combined subjects
        const combinedSubjects = [];
        for (const subject of gradeSubjects) {
          const [scores] = await db.promise().query(
            `SELECT acs.score, st.gender, a.total_items
             FROM assessment_scores acs
             JOIN assessments a ON acs.assessment_id = a.id
             JOIN students st ON acs.student_id = st.id
             WHERE a.section_id IN (?)
               AND a.subject_id = ?
               AND a.grading_period_id = ?
               AND a.school_year_id = ?`,
            [sectionIds, subject.id, grading_period_id, year.id],
          );
          combinedSubjects.push(buildSubjectRow(subject, scores));
        }

        // Per section
        const sectionsData = [];
        for (const section of sections) {
          const sectionSubjects = [];
          for (const subject of gradeSubjects) {
            const [scores] = await db.promise().query(
              `SELECT acs.score, st.gender, a.total_items
               FROM assessment_scores acs
               JOIN assessments a ON acs.assessment_id = a.id
               JOIN students st ON acs.student_id = st.id
               WHERE a.section_id = ?
                 AND a.subject_id = ?
                 AND a.grading_period_id = ?
                 AND a.school_year_id = ?`,
              [section.id, subject.id, grading_period_id, year.id],
            );
            sectionSubjects.push(buildSubjectRow(subject, scores));
          }
          sectionsData.push({
            section_id: section.id,
            section_name: section.section_name,
            adviser_name: section.adviser_name,
            subjects: sectionSubjects,
          });
        }

        gradeReport.push({
          grade_level_id: grade.id,
          grade_name: grade.grade_name,
          section_count: sections.length,
          combined: combinedSubjects,
          sections: sectionsData,
        });
      }

      report.push({
        school_id: school.id,
        school_name: school.school_name,
        grades: gradeReport,
      });
    }

    const [periods] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [year.id],
    );

    res.json({
      report,
      periods,
      cluster: { id: cluster.cluster_id, name: cluster.cluster_name },
      schools,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//School list for dropdowns
// GET school heads in cluster
exports.getSchoolHeads = async (req, res) => {
  try {
    const cluster = await getSupervisorCluster(req.user.id);
    const schools = await getClusterSchools(cluster.cluster_id);
    const schoolIds = schools.map((s) => s.id);

    if (!schoolIds.length) return res.json([]);

    const [rows] = await db.promise().query(
      `SELECT u.id, u.fullname, u.username, u.email, u.is_active,
        u.school_id, s.school_name
       FROM users u
       LEFT JOIN schools s ON u.school_id = s.id
       WHERE u.role = 'school_head'
         AND u.school_id IN (?)
       ORDER BY u.fullname ASC`,
      [schoolIds],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create school head
exports.createSchoolHead = async (req, res) => {
  const bcrypt = require("bcryptjs");
  const { fullname, username, email, password, school_id } = req.body;

  if (!fullname || !username || !password)
    return res
      .status(400)
      .json({ message: "Full name, username and password are required." });
  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });

  try {
    const cluster = await getSupervisorCluster(req.user.id);
    const schools = await getClusterSchools(cluster.cluster_id);
    const schoolIds = schools.map((s) => s.id);

    // Validate school belongs to cluster
    if (school_id && !schoolIds.includes(Number(school_id)))
      return res
        .status(403)
        .json({ message: "School does not belong to your cluster." });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO users (fullname, username, email, password, role, school_id, is_active) VALUES (?, ?, ?, ?, 'school_head', ?, 1)",
        [fullname, username, email || null, hashed, school_id || null],
      );
    res.json({
      message: "School head created successfully.",
      id: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Username already exists." });
    res.status(500).json({ message: err.message });
  }
};

// PUT update school head
exports.updateSchoolHead = async (req, res) => {
  const bcrypt = require("bcryptjs");
  const { id } = req.params;
  const { fullname, username, email, password, school_id } = req.body;

  if (!fullname || !username)
    return res
      .status(400)
      .json({ message: "Full name and username are required." });

  try {
    const cluster = await getSupervisorCluster(req.user.id);
    const schools = await getClusterSchools(cluster.cluster_id);
    const schoolIds = schools.map((s) => s.id);

    // Validate school belongs to cluster
    if (school_id && !schoolIds.includes(Number(school_id)))
      return res
        .status(403)
        .json({ message: "School does not belong to your cluster." });

    if (password) {
      if (password.length < 6)
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters." });
      const hashed = await bcrypt.hash(password, 10);
      await db
        .promise()
        .query(
          "UPDATE users SET fullname=?, username=?, email=?, password=?, school_id=? WHERE id=? AND role='school_head'",
          [fullname, username, email || null, hashed, school_id || null, id],
        );
    } else {
      await db
        .promise()
        .query(
          "UPDATE users SET fullname=?, username=?, email=?, school_id=? WHERE id=? AND role='school_head'",
          [fullname, username, email || null, school_id || null, id],
        );
    }
    res.json({ message: "School head updated successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Username already exists." });
    res.status(500).json({ message: err.message });
  }
};

// DELETE school head
exports.deleteSchoolHead = async (req, res) => {
  const { id } = req.params;
  try {
    const cluster = await getSupervisorCluster(req.user.id);
    const schools = await getClusterSchools(cluster.cluster_id);
    const schoolIds = schools.map((s) => s.id);

    const [check] = await db
      .promise()
      .query(
        "SELECT id FROM users WHERE id=? AND role='school_head' AND (school_id IN (?) OR school_id IS NULL)",
        [id, schoolIds.length ? schoolIds : [0]],
      );
    if (!check.length)
      return res.status(403).json({ message: "Not authorized." });

    await db.promise().query("DELETE FROM users WHERE id=?", [id]);
    res.json({ message: "School head deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT unassign school head
exports.unassignSchoolHead = async (req, res) => {
  const { id } = req.params;
  try {
    await db
      .promise()
      .query(
        "UPDATE users SET school_id=NULL WHERE id=? AND role='school_head'",
        [id],
      );
    res.json({ message: "School head unassigned successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
