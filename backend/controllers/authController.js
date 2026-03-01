const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashed, role || "teacher"],
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.getCurrentUser = (req, res) => {
  // req.user is set by verifyToken middleware
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
  });
};
