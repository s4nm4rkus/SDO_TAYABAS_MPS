const db = require("../../config/db");
const bcrypt = require("bcryptjs");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      `SELECT u.id, u.fullname, u.username, u.email, u.role, u.is_active,
        u.school_id, u.cluster_id,
        s.school_name, c.cluster_name
       FROM users u
       LEFT JOIN schools s ON u.school_id = s.id
       LEFT JOIN clusters c ON u.cluster_id = c.id
       ORDER BY u.fullname ASC`,
    );

    const [schoolAssignments] = await db.promise().query(
      `SELECT sha.user_id, s.id AS school_id, s.school_name
       FROM school_head_assignments sha
       JOIN schools s ON sha.school_id = s.id`,
    );

    const [subjectAssignments] = await db.promise().query(
      `SELECT ss.user_id, sub.id AS subject_id, sub.subject_name, sub.subject_code
       FROM supervisor_subjects ss
       JOIN subjects sub ON ss.subject_id = sub.id`,
    );

    const result = users.map((user) => {
      if (user.role === "school_head") {
        let schools = schoolAssignments
          .filter((a) => a.user_id === user.id)
          .map((a) => ({ id: a.school_id, school_name: a.school_name }));

        if (!schools.length && user.school_id && user.school_name) {
          schools = [{ id: user.school_id, school_name: user.school_name }];
        }

        user.schools = schools;
      }

      if (user.role === "supervisor") {
        user.subjects = subjectAssignments
          .filter((a) => a.user_id === user.id)
          .map((a) => ({
            id: a.subject_id,
            subject_name: a.subject_name,
            subject_code: a.subject_code,
          }));
      }

      return user;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.promise().query(
      `SELECT u.id, u.fullname, u.username, u.email, u.role, u.is_active,
        u.school_id, u.cluster_id,
        s.school_name, c.cluster_name
       FROM users u
       LEFT JOIN schools s ON u.school_id = s.id
       LEFT JOIN clusters c ON u.cluster_id = c.id
       WHERE u.id = ?`,
      [id],
    );
    if (!results.length)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];

    if (user.role === "supervisor") {
      const [subjects] = await db.promise().query(
        `SELECT sub.id, sub.subject_name, sub.subject_code
         FROM supervisor_subjects ss
         JOIN subjects sub ON ss.subject_id = sub.id
         WHERE ss.user_id = ?`,
        [id],
      );
      user.subjects = subjects;
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "DB error", error: err.message });
  }
};

// Create user (admin creates on behalf)
exports.createUser = async (req, res) => {
  const {
    fullname,
    username,
    email,
    password,
    role,
    school_id,
    cluster_id,
    subject_ids,
    school_ids,
  } = req.body;

  if (!fullname || !username || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const resolvedSchoolId =
      role === "school_head"
        ? school_ids?.[0] || school_id || null
        : role === "teacher"
          ? school_id || null
          : null;

    const resolvedClusterId = role === "supervisor" ? cluster_id || null : null;

    const [result] = await db
      .promise()
      .query(
        "INSERT INTO users (fullname, username, email, password, role, school_id, cluster_id, must_change_password) VALUES (?,?,?,?,?,?,?,?)",
        [
          fullname,
          username,
          email || null,
          hashed,
          role,
          resolvedSchoolId,
          resolvedClusterId,
          1,
        ],
      );

    const user_id = result.insertId;

    if (role === "school_head" && school_ids?.length) {
      for (const sid of school_ids) {
        await db
          .promise()
          .query(
            "INSERT INTO school_head_assignments (user_id, school_id) VALUES (?,?)",
            [user_id, sid],
          );
      }
    }

    if (role === "supervisor" && subject_ids?.length) {
      for (const subid of subject_ids) {
        await db
          .promise()
          .query(
            "INSERT INTO supervisor_subjects (user_id, subject_id) VALUES (?,?)",
            [user_id, subid],
          );
      }
    }

    res.json({ message: "User created successfully.", id: user_id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Username already exists." });
    res.status(500).json({ message: err.message });
  }
};

// Assign role + school/cluster
exports.assignUser = async (req, res) => {
  const { role, school_id, cluster_id, subject_ids, school_ids } = req.body;
  const { id } = req.params;

  try {
    const resolvedSchoolId =
      role === "school_head"
        ? school_ids?.[0] || school_id || null
        : role === "teacher"
          ? school_id || null
          : null;

    const resolvedClusterId = role === "supervisor" ? cluster_id || null : null;

    await db
      .promise()
      .query("UPDATE users SET role=?, school_id=?, cluster_id=? WHERE id=?", [
        role,
        resolvedSchoolId,
        resolvedClusterId,
        id,
      ]);

    if (role === "school_head") {
      await db
        .promise()
        .query("DELETE FROM school_head_assignments WHERE user_id=?", [id]);
      if (school_ids?.length) {
        for (const sid of school_ids) {
          await db
            .promise()
            .query(
              "INSERT INTO school_head_assignments (user_id, school_id) VALUES (?,?)",
              [id, sid],
            );
        }
      }
    }

    if (role === "supervisor") {
      await db
        .promise()
        .query("DELETE FROM supervisor_subjects WHERE user_id=?", [id]);
      if (subject_ids?.length) {
        for (const subid of subject_ids) {
          await db
            .promise()
            .query(
              "INSERT INTO supervisor_subjects (user_id, subject_id) VALUES (?,?)",
              [id, subid],
            );
        }
      }
    }

    res.json({ message: "User assigned successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle activate/deactivate
exports.toggleStatus = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE users SET is_active = NOT is_active WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "User status updated successfully" });
    },
  );
};

const crypto = require("crypto");

function generateTempPassword(length = 10) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; // no 0/O/1/l/I — avoids confusion when admin reads it aloud/types it
  let pass = "";
  for (let i = 0; i < length; i++)
    pass += chars[crypto.randomInt(0, chars.length)];
  return pass;
}

// Admin resets any user's password to a random temp password.
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  try {
    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const [result] = await db
      .promise()
      .query(
        "UPDATE users SET password = ?, must_change_password = 1 WHERE id = ?",
        [hashed, id],
      );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found." });

    res.json({ message: "Password reset successfully.", tempPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (parseInt(id) === req.user.id)
    return res
      .status(400)
      .json({ message: "You cannot delete your own account" });

  db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "User deleted successfully" });
  });
};
