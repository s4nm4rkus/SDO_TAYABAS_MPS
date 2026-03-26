const db = require("../config/db");

const getActiveYear = async () => {
  const [rows] = await db
    .promise()
    .query("SELECT id FROM school_years WHERE is_active = 1 LIMIT 1");
  if (!rows.length) throw new Error("No active school year found.");
  return rows[0].id;
};

exports.getDashboardStats = async (req, res) => {
  try {
    const school_year_id = await getActiveYear();

    const [[{ clusterCount }]] = await db
      .promise()
      .query("SELECT COUNT(*) AS clusterCount FROM clusters");
    const [[{ schoolCount }]] = await db
      .promise()
      .query("SELECT COUNT(*) AS schoolCount FROM schools");
    const [[{ teacherCount }]] = await db
      .promise()
      .query(
        "SELECT COUNT(*) AS teacherCount FROM users WHERE role = 'teacher'",
      );
    const [[{ studentCount }]] = await db
      .promise()
      .query(
        "SELECT COUNT(*) AS studentCount FROM students WHERE school_year_id = ?",
        [school_year_id],
      );

    res.json({
      success: true,
      stats: { clusterCount, schoolCount, teacherCount, studentCount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
