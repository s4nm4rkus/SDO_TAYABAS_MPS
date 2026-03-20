const db = require("../../config/db");

const getActiveYear = async () => {
  const [rows] = await db
    .promise()
    .query("SELECT id FROM school_years WHERE is_active = 1 LIMIT 1");
  if (!rows.length) throw new Error("No active school year found.");
  return rows[0].id;
};

const getSchoolHeadSchools = async (user_id) => {
  const [rows] = await db
    .promise()
    .query("SELECT school_id FROM school_head_assignments WHERE user_id = ?", [
      user_id,
    ]);
  if (!rows.length) throw new Error("No schools assigned to this school head.");
  return rows.map((r) => r.school_id);
};

exports.getGradingPeriods = async (req, res) => {
  try {
    const school_year_id = await getActiveYear();
    const [rows] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods
       WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [school_year_id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMPSReport = async (req, res) => {
  try {
    const school_year_id = await getActiveYear();
    const school_ids = await getSchoolHeadSchools(req.user.id);
    const { grading_period_id } = req.params;

    const [gradeLevels] = await db.promise().query(
      `SELECT DISTINCT gl.id, gl.grade_name
       FROM sections s
       JOIN grade_levels gl ON s.grade_level_id = gl.id
       WHERE s.school_id IN (?) AND s.school_year_id = ?
       ORDER BY gl.id ASC`,
      [school_ids, school_year_id],
    );

    const computeMPS = (scores) => {
      if (!scores.length) return null;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avg.toFixed(2);
    };

    const computeSD = (scores) => {
      if (!scores.length) return null;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance =
        scores.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
        scores.length;
      return Math.sqrt(variance).toFixed(2);
    };

    const report = [];

    for (const grade of gradeLevels) {
      const [sections] = await db.promise().query(
        `SELECT s.id, s.section_name, u.fullname AS adviser_name
         FROM sections s
         LEFT JOIN users u ON s.adviser_id = u.id
         WHERE s.grade_level_id = ? AND s.school_id IN (?) AND s.school_year_id = ?
         ORDER BY s.section_name ASC`,
        [grade.id, school_ids, school_year_id],
      );

      const sectionIds = sections.map((s) => s.id);
      if (!sectionIds.length) continue;

      const [gradeSubjects] = await db.promise().query(
        `SELECT s.id, s.subject_name, s.subject_code
         FROM grade_level_subjects gls
         JOIN subjects s ON gls.subject_id = s.id
         WHERE gls.grade_level_id = ?
         ORDER BY s.subject_name ASC`,
        [grade.id],
      );

      const subjectRows = [];

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
          [sectionIds, subject.id, grading_period_id, school_year_id],
        );

        if (!scores.length) {
          subjectRows.push({
            subject_id: subject.id,
            subject_name: subject.subject_name,
            subject_code: subject.subject_code,
            male: { mps: null, sd: null },
            female: { mps: null, sd: null },
            class: { mps: null, sd: null },
          });
          continue;
        }

        const maleScores = scores
          .filter((s) => s.gender === "Male")
          .map((s) => (Number(s.score) / Number(s.total_items)) * 100);

        const femaleScores = scores
          .filter((s) => s.gender === "Female")
          .map((s) => (Number(s.score) / Number(s.total_items)) * 100);

        const allScores = scores.map(
          (s) => (Number(s.score) / Number(s.total_items)) * 100,
        );

        subjectRows.push({
          subject_id: subject.id,
          subject_name: subject.subject_name,
          subject_code: subject.subject_code,
          male: { mps: computeMPS(maleScores), sd: computeSD(maleScores) },
          female: {
            mps: computeMPS(femaleScores),
            sd: computeSD(femaleScores),
          },
          class: { mps: computeMPS(allScores), sd: computeSD(allScores) },
        });
      }

      report.push({
        grade_level_id: grade.id,
        grade_name: grade.grade_name,
        section_count: sectionIds.length,
        sections: sections.map((s) => ({
          section_name: s.section_name,
          adviser_name: s.adviser_name,
        })),
        subjects: subjectRows,
      });
    }

    const [periods] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [school_year_id],
    );

    res.json({ report, gradeLevels, periods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
