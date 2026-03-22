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
       ORDER BY u.fullname ASC`
    );

    const [assignments] = await db.promise().query(
      `SELECT sha.user_id, s.id AS school_id, s.school_name
       FROM school_head_assignments sha
       JOIN schools s ON sha.school_id = s.id`
    );

    const result = users.map((user) => {
      if (user.role === "school_head") {
        // Get from school_head_assignments first
        let schools = assignments
          .filter((a) => a.user_id === user.id)
          .map((a) => ({ id: a.school_id, school_name: a.school_name }));

        // ← Fallback: if no assignments but has school_id, use that
        if (!schools.length && user.school_id && user.school_name) {
          schools = [{ id: user.school_id, school_name: user.school_name }];
        }

        user.schools = schools;
      }
      return user;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT u.id, u.fullname, u.username, u.email, u.role, u.is_active,
      u.school_id, u.cluster_id,
      s.school_name, c.cluster_name
     FROM users u
     LEFT JOIN schools s ON u.school_id = s.id
     LEFT JOIN clusters c ON u.cluster_id = c.id
     WHERE u.id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (results.length === 0)
        return res.status(404).json({ message: "User not found" });
      res.json(results[0]);
    },
  );
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
    school_ids,
  } = req.body;

  if (!fullname || !username || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    // For school_head — use first school from school_ids as school_id
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
        "INSERT INTO users (fullname, username, email, password, role, school_id, cluster_id) VALUES (?,?,?,?,?,?,?)",
        [
          fullname,
          username,
          email || null,
          hashed,
          role,
          resolvedSchoolId,
          resolvedClusterId,
        ],
      );

    const user_id = result.insertId;

    // Still insert school_head_assignments for admin display
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

    res.json({ message: "User created successfully.", id: user_id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Username already exists." });
    res.status(500).json({ message: err.message });
  }
};

// Assign role + school/cluster
exports.assignUser = async (req, res) => {
  const { role, school_id, cluster_id, school_ids } = req.body;
  const { id } = req.params;

  try {
    // For school_head — use the first selected school as school_id
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

    // Still maintain school_head_assignments for backward compat
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
