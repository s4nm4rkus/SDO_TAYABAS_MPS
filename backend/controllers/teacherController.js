exports.getDashboard = (req, res) => {
  res.json({
    role: req.user.role,
    features: ["view_students", "submit_reports"],
  });
};
