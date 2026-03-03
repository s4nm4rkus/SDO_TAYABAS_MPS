const db = require("../../config/db");
const bcrypt = require("bcryptjs");

// Get all users
exports.getAllUsers = (req, res) => {
  db.query(
    `SELECT u.id, u.fullname, u.username, u.email, u.role, u.is_active,
      u.school_id, u.cluster_id,
      s.school_name, c.cluster_name
     FROM users u
     LEFT JOIN schools s ON u.school_id = s.id
     LEFT JOIN clusters c ON u.cluster_id = c.id
     ORDER BY u.fullname ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    },
  );
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
exports.createUser = (req, res) => {
  const { fullname, username, email, password, role } = req.body;

  if (!fullname || !username || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  bcrypt.hash(password, 10, (err, hashed) => {
    if (err)
      return res.status(500).json({ message: "Hashing error", error: err });

    db.query(
      "INSERT INTO users (fullname, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [fullname, username, email, hashed, role],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res.status(400).json({ message: "Username already exists" });
          return res.status(500).json({ message: "DB error", error: err });
        }
        res.json({ message: "User created successfully", id: result.insertId });
      },
    );
  });
};

// Assign role + school/cluster
exports.assignUser = (req, res) => {
  const { id } = req.params;
  const { role, school_id, cluster_id } = req.body;

  // ADD THIS LINE:
  console.log("Assign request:", { id, role, school_id, cluster_id });

  if (!role) return res.status(400).json({ message: "Role is required" });

  let finalSchoolId = null;
  let finalClusterId = null;

  if (role === "teacher" || role === "school_head") {
    finalSchoolId = school_id || null;
  } else if (role === "supervisor") {
    finalClusterId = cluster_id || null;
  }

  console.log("Final values:", { role, finalSchoolId, finalClusterId });

  db.query(
    "UPDATE users SET role = ?, school_id = ?, cluster_id = ? WHERE id = ?",
    [role, finalSchoolId, finalClusterId, id],
    (err) => {
      if (err) {
        console.log("DB Error:", err); // ADD THIS TOO
        return res.status(500).json({ message: "DB error", error: err });
      }
      res.json({ message: "User assigned successfully" });
    },
  );
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
