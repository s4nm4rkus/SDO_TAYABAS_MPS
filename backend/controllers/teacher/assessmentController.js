const db = require("../../config/db");

const getActiveYear = async () => {
  const [rows] = await db
    .promise()
    .query("SELECT id FROM school_years WHERE is_active = 1 LIMIT 1");
  if (!rows.length) throw new Error("No active school year found.");
  return rows[0].id;
};

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

// Fixed 3 assessment slots per section + subject + grading period:
// 1st Summative Test, 2nd Summative Test, Term/Quarter Examination.
const MAX_ASSESSMENT_SLOTS = 3;
const DEFAULT_SLOT_LABELS = {
  1: "1st Summative Test",
  2: "2nd Summative Test",
  3: "Term Examination",
};
const defaultSlotLabel = (slot) =>
  DEFAULT_SLOT_LABELS[slot] || `Assessment ${slot}`;
const normalizeSlot = (assessment_no) => {
  const n = Number(assessment_no);
  return n >= 1 && n <= MAX_ASSESSMENT_SLOTS ? n : 1;
};

// GET subjects for teacher's grade level
exports.getSubjects = async (req, res) => {
  try {
    const section = await getTeacherSection(req.user.id);

    const [rows] = await db.promise().query(
      `SELECT s.id, s.subject_name, s.subject_code
       FROM grade_level_subjects gls
       JOIN subjects s ON gls.subject_id = s.id
       WHERE gls.grade_level_id = ?
       ORDER BY s.subject_name ASC`,
      [section.grade_level_id],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET grading periods for active year
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

// GET the status of both assessment slots for a subject + quarter, so the
// teacher can see which one(s) already have data before picking one to encode.
exports.getAssessmentSlots = async (req, res) => {
  try {
    const section = await getTeacherSection(req.user.id);
    const school_year_id = await getActiveYear();
    const { subject_id, grading_period_id } = req.query;

    if (!subject_id || !grading_period_id)
      return res
        .status(400)
        .json({ message: "Subject and term are required." });

    const [rows] = await db.promise().query(
      `SELECT a.id, a.assessment_no, a.label, a.total_items,
        COUNT(acs.id) AS encoded_count
       FROM assessments a
       LEFT JOIN assessment_scores acs ON acs.assessment_id = a.id
       WHERE a.section_id = ? AND a.subject_id = ? AND a.grading_period_id = ? AND a.school_year_id = ?
       GROUP BY a.id`,
      [section.id, subject_id, grading_period_id, school_year_id],
    );

    const slots = Array.from({ length: MAX_ASSESSMENT_SLOTS }, (_, i) => {
      const no = i + 1;
      const existing = rows.find((r) => r.assessment_no === no);
      return existing
        ? {
            assessment_no: no,
            id: existing.id,
            label: existing.label,
            total_items: existing.total_items,
            encoded_count: existing.encoded_count,
            exists: true,
          }
        : {
            assessment_no: no,
            id: null,
            label: defaultSlotLabel(no),
            total_items: null,
            encoded_count: 0,
            exists: false,
          };
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET or CREATE assessment for section + subject + quarter + slot
exports.getOrCreateAssessment = async (req, res) => {
  try {
    const section = await getTeacherSection(req.user.id);
    const school_year_id = await getActiveYear();
    const { subject_id, grading_period_id, total_items, assessment_no, label } =
      req.body;

    if (!subject_id || !grading_period_id || !total_items)
      return res.status(400).json({ message: "All fields are required." });

    const slot = normalizeSlot(assessment_no);

    // Check if assessment already exists for this slot
    const [existing] = await db.promise().query(
      `SELECT * FROM assessments
       WHERE section_id = ? AND subject_id = ? AND grading_period_id = ? AND school_year_id = ? AND assessment_no = ?`,
      [section.id, subject_id, grading_period_id, school_year_id, slot],
    );

    let assessment;

    if (existing.length) {
      assessment = existing[0];
      // Update total_items if changed
      if (assessment.total_items !== Number(total_items)) {
        await db
          .promise()
          .query("UPDATE assessments SET total_items = ? WHERE id = ?", [
            total_items,
            assessment.id,
          ]);
        assessment.total_items = total_items;
      }
      // Allow renaming the slot (e.g. "Written Work") without losing data
      if (label && label.trim() && label.trim() !== assessment.label) {
        await db
          .promise()
          .query("UPDATE assessments SET label = ? WHERE id = ?", [
            label.trim(),
            assessment.id,
          ]);
        assessment.label = label.trim();
      }
    } else {
      const assessmentLabel = label?.trim() || defaultSlotLabel(slot);
      const [result] = await db.promise().query(
        `INSERT INTO assessments (section_id, subject_id, grading_period_id, school_year_id, assessment_no, label, total_items)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          section.id,
          subject_id,
          grading_period_id,
          school_year_id,
          slot,
          assessmentLabel,
          total_items,
        ],
      );
      const [newAssessment] = await db
        .promise()
        .query("SELECT * FROM assessments WHERE id = ?", [result.insertId]);
      assessment = newAssessment[0];
    }

    // Get students with their scores
    const [students] = await db.promise().query(
      `SELECT st.id, st.lrn, st.firstname, st.middlename, st.lastname, st.gender,
        COALESCE(acs.score, NULL) AS score,
        acs.id AS score_id
       FROM students st
       LEFT JOIN assessment_scores acs ON acs.student_id = st.id AND acs.assessment_id = ?
       WHERE st.section_id = ? AND st.school_year_id = ?
       ORDER BY st.lastname, st.firstname ASC`,
      [assessment.id, section.id, school_year_id],
    );

    res.json({ assessment, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST save scores (bulk)
exports.saveScores = async (req, res) => {
  try {
    const { assessment_id, scores } = req.body;
    // scores = [{ student_id, score }, ...]

    if (!assessment_id || !scores?.length)
      return res
        .status(400)
        .json({ message: "Assessment ID and scores are required." });

    for (const item of scores) {
      const { student_id, score } = item;

      // Check if score exists
      const [existing] = await db
        .promise()
        .query(
          "SELECT id FROM assessment_scores WHERE assessment_id = ? AND student_id = ?",
          [assessment_id, student_id],
        );

      if (existing.length) {
        await db
          .promise()
          .query(
            "UPDATE assessment_scores SET score = ? WHERE assessment_id = ? AND student_id = ?",
            [score, assessment_id, student_id],
          );
      } else {
        await db
          .promise()
          .query(
            "INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES (?, ?, ?)",
            [assessment_id, student_id, score],
          );
      }
    }

    res.json({ message: "Scores saved successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const computeMPS = (arr, totalItems) => {
  if (!arr.length) return null;
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return ((avg / totalItems) * 100).toFixed(2);
};

const computeSD = (arr) => {
  if (!arr.length) return null;
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance =
    arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
  return Math.sqrt(variance).toFixed(2);
};

// GET MPS report for teacher's section — one row per subject PER assessment slot
exports.getMPSReport = async (req, res) => {
  try {
    const section = await getTeacherSection(req.user.id);
    const school_year_id = await getActiveYear();
    const { grading_period_id } = req.params;

    // Get all assessments (both slots) for this section and quarter
    const [assessments] = await db.promise().query(
      `SELECT a.id, a.total_items, a.subject_id, a.assessment_no, a.label,
        s.subject_name, s.subject_code
       FROM assessments a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.section_id = ? AND a.grading_period_id = ? AND a.school_year_id = ?
       ORDER BY s.subject_name ASC, a.assessment_no ASC`,
      [section.id, grading_period_id, school_year_id],
    );

    const report = [];

    for (const assessment of assessments) {
      // Get all scores with gender
      const [scores] = await db.promise().query(
        `SELECT acs.score, st.gender
         FROM assessment_scores acs
         JOIN students st ON acs.student_id = st.id
         WHERE acs.assessment_id = ?`,
        [assessment.id],
      );

      const maleScores = scores
        .filter((s) => s.gender === "Male")
        .map((s) => Number(s.score));
      const femaleScores = scores
        .filter((s) => s.gender === "Female")
        .map((s) => Number(s.score));
      const allScores = scores.map((s) => Number(s.score));

      report.push({
        subject_id: assessment.subject_id,
        subject_name: assessment.subject_name,
        subject_code: assessment.subject_code,
        assessment_no: assessment.assessment_no,
        assessment_label: assessment.label,
        total_items: assessment.total_items,
        male: {
          mps: computeMPS(maleScores, assessment.total_items),
          sd: computeSD(maleScores),
          count: maleScores.length,
        },
        female: {
          mps: computeMPS(femaleScores, assessment.total_items),
          sd: computeSD(femaleScores),
          count: femaleScores.length,
        },
        class: {
          mps: computeMPS(allScores, assessment.total_items),
          sd: computeSD(allScores),
          count: allScores.length,
        },
      });
    }

    res.json({
      section: section.section_name,
      grade: section.grade_name,
      report,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET full MPS report for all quarters — each subject gets one entry
// per assessment slot (both slots always shown, even if not yet encoded).
exports.getFullMPSReport = async (req, res) => {
  try {
    const section = await getTeacherSection(req.user.id);
    const school_year_id = await getActiveYear();

    // Get all quarters for active year
    const [periods] = await db.promise().query(
      `SELECT id, period_name, order_num, is_active
       FROM grading_periods
       WHERE school_year_id = ?
       ORDER BY order_num ASC`,
      [school_year_id],
    );

    // Get all subjects for this grade level
    const [subjects] = await db.promise().query(
      `SELECT s.id, s.subject_name, s.subject_code
       FROM grade_level_subjects gls
       JOIN subjects s ON gls.subject_id = s.id
       WHERE gls.grade_level_id = ?
       ORDER BY s.subject_name ASC`,
      [section.grade_level_id],
    );

    // Build report per quarter
    const report = {};

    for (const period of periods) {
      const quarterData = [];

      for (const subject of subjects) {
        // Get all assessment slots for this section + subject + quarter
        const [assessments] = await db.promise().query(
          `SELECT id, total_items, assessment_no, label FROM assessments
           WHERE section_id = ? AND subject_id = ? AND grading_period_id = ? AND school_year_id = ?
           ORDER BY assessment_no ASC`,
          [section.id, subject.id, period.id, school_year_id],
        );

        for (let slot = 1; slot <= MAX_ASSESSMENT_SLOTS; slot++) {
          const assessment = assessments.find((a) => a.assessment_no === slot);

          if (!assessment) {
            quarterData.push({
              subject_id: subject.id,
              subject_name: subject.subject_name,
              subject_code: subject.subject_code,
              assessment_no: slot,
              assessment_label: defaultSlotLabel(slot),
              male: { mps: null, sd: null, count: 0 },
              female: { mps: null, sd: null, count: 0 },
              class: { mps: null, sd: null, count: 0 },
            });
            continue;
          }

          // Get scores with gender
          const [scores] = await db.promise().query(
            `SELECT acs.score, st.gender
             FROM assessment_scores acs
             JOIN students st ON acs.student_id = st.id
             WHERE acs.assessment_id = ?`,
            [assessment.id],
          );

          const maleScores = scores
            .filter((s) => s.gender === "Male")
            .map((s) => Number(s.score));
          const femaleScores = scores
            .filter((s) => s.gender === "Female")
            .map((s) => Number(s.score));
          const allScores = scores.map((s) => Number(s.score));

          quarterData.push({
            subject_id: subject.id,
            subject_name: subject.subject_name,
            subject_code: subject.subject_code,
            assessment_no: slot,
            assessment_label: assessment.label,
            male: {
              mps: computeMPS(maleScores, assessment.total_items),
              sd: computeSD(maleScores),
              count: maleScores.length,
            },
            female: {
              mps: computeMPS(femaleScores, assessment.total_items),
              sd: computeSD(femaleScores),
              count: femaleScores.length,
            },
            class: {
              mps: computeMPS(allScores, assessment.total_items),
              sd: computeSD(allScores),
              count: allScores.length,
            },
          });
        }
      }

      report[period.id] = {
        period_name: period.period_name,
        order_num: period.order_num,
        is_active: period.is_active,
        data: quarterData,
      };
    }

    res.json({
      section: section.section_name,
      grade: section.grade_name,
      school: section.school_name,
      periods,
      subjects,
      report,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
