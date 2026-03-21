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

// GET overview — all clusters + schools stats + MPS
exports.getOverview = async (req, res) => {
  try {
    const year = await getActiveYear();

    // Active quarter
    const [quarters] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [year.id],
    );
    const activeQuarter = quarters.find((q) => q.is_active);

    // All clusters
    const [clusters] = await db.promise().query(
      `SELECT c.id, c.cluster_name, c.cluster_code,
        u.fullname AS supervisor_name
       FROM clusters c
       LEFT JOIN users u ON u.cluster_id = c.id AND u.role = 'supervisor'
       ORDER BY c.cluster_name ASC`,
    );

    // All schools
    const [schools] = await db.promise().query(
      `SELECT s.id, s.school_name, s.cluster_id, c.cluster_name
       FROM schools s
       LEFT JOIN clusters c ON s.cluster_id = c.id
       ORDER BY s.school_name ASC`,
    );

    // Overall stats
    const [sectionStats] = await db.promise().query(
      `SELECT COUNT(*) as total,
        SUM(CASE WHEN adviser_id IS NOT NULL THEN 1 ELSE 0 END) as assigned
       FROM sections WHERE school_year_id = ?`,
      [year.id],
    );
    const [teacherStats] = await db
      .promise()
      .query(
        `SELECT COUNT(*) as total FROM users WHERE role = 'teacher' AND is_active = 1`,
      );
    const [studentStats] = await db.promise().query(
      `SELECT COUNT(*) as total,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female
       FROM students WHERE school_year_id = ?`,
      [year.id],
    );

    const stats = {
      total_clusters: clusters.length,
      total_schools: schools.length,
      total_sections: sectionStats[0].total || 0,
      assigned_sections: sectionStats[0].assigned || 0,
      total_teachers: teacherStats[0].total || 0,
      total_students: studentStats[0].total || 0,
      male_students: studentStats[0].male || 0,
      female_students: studentStats[0].female || 0,
    };

    // MPS per school for active quarter
    const schoolMPS = [];
    if (activeQuarter) {
      for (const school of schools) {
        const [sections] = await db
          .promise()
          .query(
            "SELECT id FROM sections WHERE school_id = ? AND school_year_id = ?",
            [school.id, year.id],
          );
        if (!sections.length) continue;
        const sectionIds = sections.map((s) => s.id);

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

        const toPercent = (s) =>
          (Number(s.score) / Number(s.total_items)) * 100;
        const avg = (arr) =>
          arr.length
            ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
            : null;

        schoolMPS.push({
          school_id: school.id,
          school_name: school.school_name,
          cluster_id: school.cluster_id,
          cluster_name: school.cluster_name,
          class_mps: avg(scores.map(toPercent)),
          male_mps: avg(
            scores.filter((s) => s.gender === "Male").map(toPercent),
          ),
          female_mps: avg(
            scores.filter((s) => s.gender === "Female").map(toPercent),
          ),
        });
      }
    }

    // MPS per cluster — average of schools
    const clusterMPS = clusters.map((cluster) => {
      const clusterSchools = schoolMPS.filter(
        (s) => s.cluster_id === cluster.id,
      );
      if (!clusterSchools.length)
        return {
          ...cluster,
          class_mps: null,
          male_mps: null,
          female_mps: null,
        };
      const avg = (arr) =>
        arr.length
          ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
          : null;
      return {
        ...cluster,
        school_count: schools.filter((s) => s.cluster_id === cluster.id).length,
        class_mps: avg(
          clusterSchools
            .filter((s) => s.class_mps)
            .map((s) => Number(s.class_mps)),
        ),
        male_mps: avg(
          clusterSchools
            .filter((s) => s.male_mps)
            .map((s) => Number(s.male_mps)),
        ),
        female_mps: avg(
          clusterSchools
            .filter((s) => s.female_mps)
            .map((s) => Number(s.female_mps)),
        ),
      };
    });

    res.json({
      active_year: year,
      active_quarter: activeQuarter || null,
      quarters,
      clusters: clusters.map((c) => ({
        ...c,
        school_count: schools.filter((s) => s.cluster_id === c.id).length,
      })),
      schools,
      stats,
      school_mps: schoolMPS,
      cluster_mps: clusterMPS,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET full MPS report — all clusters → schools → grades → sections
exports.getMPSReport = async (req, res) => {
  try {
    const year = await getActiveYear();
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
      const toPercent = (s) => (Number(s.score) / Number(s.total_items)) * 100;
      const maleScores = scores
        .filter((s) => s.gender === "Male")
        .map(toPercent);
      const femaleScores = scores
        .filter((s) => s.gender === "Female")
        .map(toPercent);
      const allScores = scores.map(toPercent);
      return {
        subject_id: subject.id,
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        male: { mps: computeMPS(maleScores), sd: computeSD(maleScores) },
        female: { mps: computeMPS(femaleScores), sd: computeSD(femaleScores) },
        class: { mps: computeMPS(allScores), sd: computeSD(allScores) },
      };
    };

    // Get all clusters
    const [clusters] = await db
      .promise()
      .query("SELECT id, cluster_name FROM clusters ORDER BY cluster_name ASC");

    const report = [];

    for (const cluster of clusters) {
      // Get schools in cluster
      const [schools] = await db
        .promise()
        .query(
          "SELECT id, school_name FROM schools WHERE cluster_id = ? ORDER BY school_name ASC",
          [cluster.id],
        );

      const schoolReport = [];

      for (const school of schools) {
        // Get grade levels
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
          const [sections] = await db.promise().query(
            `SELECT s.id, s.section_name, u.fullname AS adviser_name
             FROM sections s
             LEFT JOIN users u ON s.adviser_id = u.id
             WHERE s.grade_level_id = ? AND s.school_id = ? AND s.school_year_id = ?
             ORDER BY s.section_name ASC`,
            [grade.id, school.id, year.id],
          );

          if (!sections.length) continue;
          const sectionIds = sections.map((s) => s.id);

          const [gradeSubjects] = await db.promise().query(
            `SELECT s.id, s.subject_name, s.subject_code
             FROM grade_level_subjects gls
             JOIN subjects s ON gls.subject_id = s.id
             WHERE gls.grade_level_id = ?
             ORDER BY s.subject_name ASC`,
            [grade.id],
          );

          // Combined
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

        schoolReport.push({
          school_id: school.id,
          school_name: school.school_name,
          grades: gradeReport,
        });
      }

      report.push({
        cluster_id: cluster.id,
        cluster_name: cluster.cluster_name,
        schools: schoolReport,
      });
    }

    const [periods] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [year.id],
    );

    res.json({ report, periods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
