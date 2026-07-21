const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middlewares/authMiddleware");
const { authorizeRoles } = require("../../middlewares/roleMiddleware");
const studentController = require("../../controllers/teacher/studentController");
const teacherOnly = [verifyToken, authorizeRoles("teacher")];
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
  fileFilter: (req, file, cb) => {
    const ok = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ].includes(file.mimetype);
    cb(ok ? null : new Error("Only .xlsx or .xls files are allowed."), ok);
  },
});

router.get("/my-section", ...teacherOnly, studentController.getMySection);
router.get("/", ...teacherOnly, studentController.getMyStudents);
router.post("/", ...teacherOnly, studentController.addStudent);
router.put("/:id", ...teacherOnly, studentController.updateStudent);
router.delete("/:id", ...teacherOnly, studentController.deleteStudent);

router.post(
  "/bulk-import",
  ...teacherOnly,
  upload.single("file"),
  studentController.bulkImportStudents,
);
router.get(
  "/template",
  ...teacherOnly,
  studentController.downloadStudentTemplate,
);

module.exports = router;
