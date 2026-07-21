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
      return res.status(400).json({
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
      return res.status(400).json({
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

const XLSX = require("xlsx");

// POST bulk import students from an Excel file
exports.bulkImportStudents = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const section = await getTeacherSection(req.user.id);
    const school_year_id = await getActiveYear();

    // 1. Parse the workbook
    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } catch {
      return res
        .status(400)
        .json({ message: "Invalid or corrupted Excel file." });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
      return res
        .status(400)
        .json({ message: "The uploaded file has no data rows." });
    }

    // 2. Validate rows + check duplicates within the file itself
    const errors = [];
    const seenInFile = new Set();
    const candidates = [];

    rows.forEach((row, i) => {
      const excelRowNum = i + 2; // +1 for 0-index, +1 for header row
      const lrn = String(row.lrn ?? "").trim();
      const firstname = String(row.firstname ?? "").trim();
      const lastname = String(row.lastname ?? "").trim();
      const gender = String(row.gender ?? "").trim();

      if (!lrn || !firstname || !lastname || !gender) {
        errors.push({
          row: excelRowNum,
          lrn: lrn || "(blank)",
          reason:
            "Missing required field (lrn, firstname, lastname, or gender).",
        });
        return;
      }
      if (!["Male", "Female"].includes(gender)) {
        errors.push({
          row: excelRowNum,
          lrn,
          reason: `Invalid gender value "${gender}". Must be "Male" or "Female".`,
        });
        return;
      }
      if (seenInFile.has(lrn)) {
        errors.push({
          row: excelRowNum,
          lrn,
          reason: "Duplicate LRN within the uploaded file.",
        });
        return;
      }
      seenInFile.add(lrn);

      candidates.push({
        row: excelRowNum,
        lrn,
        firstname,
        middlename: String(row.middlename ?? "").trim() || null,
        lastname,
        gender,
        birthdate: row.birthdate ? formatExcelDate(row.birthdate) : null,
        address: String(row.address ?? "").trim() || null,
        contact_number: String(row.contact_number ?? "").trim() || null,
      });
    });

    // 3. Check which LRNs already exist in DB for this school year
    if (candidates.length) {
      const lrnList = candidates.map((c) => c.lrn);
      const [existing] = await db
        .promise()
        .query(
          `SELECT lrn FROM students WHERE school_year_id = ? AND lrn IN (?)`,
          [school_year_id, lrnList],
        );
      const existingSet = new Set(existing.map((r) => r.lrn));

      for (let i = candidates.length - 1; i >= 0; i--) {
        if (existingSet.has(candidates[i].lrn)) {
          errors.push({
            row: candidates[i].row,
            lrn: candidates[i].lrn,
            reason: "LRN already exists for this school year.",
          });
          candidates.splice(i, 1);
        }
      }
    }

    // 4. Insert valid rows in a transaction
    let insertedCount = 0;
    if (candidates.length) {
      const conn = await db.promise().getConnection();
      try {
        await conn.beginTransaction();
        const values = candidates.map((c) => [
          c.lrn,
          c.firstname,
          c.middlename,
          c.lastname,
          c.gender,
          c.birthdate,
          c.address,
          c.contact_number,
          section.id,
          section.grade_level_id,
          section.school_id,
          school_year_id,
        ]);
        await conn.query(
          `INSERT INTO students
            (lrn, firstname, middlename, lastname, gender, birthdate, address, contact_number,
             section_id, grade_level_id, school_id, school_year_id)
           VALUES ?`,
          [values],
        );
        await conn.commit();
        insertedCount = candidates.length;
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    res.json({
      message: `Imported ${insertedCount} of ${rows.length} student(s).`,
      insertedCount,
      totalRows: rows.length,
      errors, // array of { row, lrn, reason } — show this to the user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper — Excel stores dates as serial numbers; convert to YYYY-MM-DD
function formatExcelDate(value) {
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) return null;
    const mm = String(date.m).padStart(2, "0");
    const dd = String(date.d).padStart(2, "0");
    return `${date.y}-${mm}-${dd}`;
  }
  // Already a string like "2015-06-14" — trust it, let MySQL validate
  const str = String(value).trim();
  return str || null;
}

// GET downloadable Excel template
exports.downloadStudentTemplate = async (req, res) => {
  const headers = [
    "lrn",
    "firstname",
    "middlename",
    "lastname",
    "gender",
    "birthdate",
    "address",
    "contact_number",
  ];
  const sample = [
    [
      "123456789012",
      "Juan",
      "Santos",
      "Dela Cruz",
      "Male",
      "2015-06-14",
      "Brgy. San Jose, Tiaong, Tayabas",
      "09171234567",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=student_import_template.xlsx",
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.send(buffer);
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
