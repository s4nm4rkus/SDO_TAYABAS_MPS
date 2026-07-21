const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password, role, fullname, email } = req.body;

  if (!username || !password || !fullname)
    return res.status(400).json({ message: "All fields required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, password, role, fullname, email) VALUES (?, ?, ?, ?, ?)",
      [username, hashed, role || "teacher", fullname, email],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res.status(400).json({ message: "Username already exists" });
          return res.status(500).json(err);
        }
        res.json({ message: "User registered successfully" });
      },
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const [results] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (!results.length)
      return res.status(400).json({ message: "User not found" });

    const user = results[0];

    if (!user.is_active)
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact admin." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        fullname: user.fullname,
        school_id: user.school_id,
        cluster_id: user.cluster_id,
        mustChangePassword: !!user.must_change_password, // ← added
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      role: user.role,
      fullname: user.fullname,
      mustChangePassword: !!user.must_change_password, // ← added
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getCurrentUser = (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
    fullname: req.user.fullname,
    school_id: req.user.school_id,
    cluster_id: req.user.cluster_id,
    mustChangePassword: req.user.mustChangePassword, // ← added
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res
      .status(400)
      .json({ message: "Current and new password are required." });
  if (newPassword.length < 8)
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters." });

  try {
    const [results] = await db
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!results.length)
      return res.status(404).json({ message: "User not found." });
    const user = results[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db
      .promise()
      .query(
        "UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?",
        [hashed, req.user.id],
      );

    // Issue a fresh token so the cleared flag takes effect immediately —
    // no need to log out and back in.
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        fullname: user.fullname,
        school_id: user.school_id,
        cluster_id: user.cluster_id,
        mustChangePassword: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ message: "Password changed successfully.", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
