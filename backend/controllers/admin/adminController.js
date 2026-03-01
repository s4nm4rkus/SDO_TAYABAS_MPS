exports.getDashboard = (req, res) => {
  res.json({
    role: req.user.role,
    features: ["add_user", "view_reports", "manage_system"],
  });
};

exports.addUser = (req, res) => {
  // only admin can access (enforced by middleware)
  res.json({ message: "User added successfully (placeholder)" });
};
