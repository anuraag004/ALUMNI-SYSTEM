/**
 * routes/resume.routes.js
 * Multer handles multipart upload; pdf-parse + NLP analysis run in controller.
 */
const router = require("express").Router();
const multer = require("multer");
const authenticate = require("../middleware/authenticate");
const { aiLimiter } = require("../middleware/rateLimit");
const resumeController = require("../controllers/resume.controller");

// Store in memory so we can forward the buffer to Firebase Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") return cb(null, true);
        cb(new Error("Only PDF files are accepted."));
    },
});

router.post("/upload", authenticate, upload.single("resume"), resumeController.uploadResume);
router.post("/analyze", authenticate, aiLimiter, resumeController.analyzeResume);
router.get("/history", authenticate, resumeController.getAnalysisHistory);

module.exports = router;
