/**
 * controllers/resume.controller.js
 * Upload PDF to Firebase Storage → extract text → analyse with NLP.
 */
const { v4: uuidv4 } = require("uuid");
const pdfParse = require("pdf-parse");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const storageService = require("../services/storage.service");
const firestoreService = require("../services/firestore.service");
const resumeAnalyzer = require("../ai/resumeAnalyzer");

// ── Upload Resume PDF ─────────────────────────────────────────────────────────
exports.uploadResume = async (req, res, next) => {
    try {
        if (!req.file) return errorResponse(res, 400, "No PDF file uploaded");

        const fileName = `resumes/${req.user.uid}/${uuidv4()}.pdf`;
        const resumeUrl = await storageService.uploadBuffer(req.file.buffer, fileName, "application/pdf");

        return successResponse(res, 200, "Resume uploaded", { resumeUrl });
    } catch (err) {
        next(err);
    }
};

// ── Analyse Resume ────────────────────────────────────────────────────────────
exports.analyzeResume = async (req, res, next) => {
    try {
        const { resumeUrl } = req.body;
        if (!resumeUrl) return errorResponse(res, 400, "resumeUrl is required");

        // Download buffer from Firebase Storage
        const buffer = await storageService.downloadBuffer(resumeUrl);

        // Extract raw text from PDF
        const pdfData = await pdfParse(buffer);
        const rawText = pdfData.text;

        if (!rawText || rawText.trim().length < 50) {
            return errorResponse(res, 422, "Could not extract meaningful text from the PDF");
        }

        // Run NLP analysis
        const analysis = await resumeAnalyzer.analyze(rawText);

        // Persist analysis result
        const analysisId = uuidv4();
        const analysisDoc = {
            id: analysisId,
            userId: req.user.uid,
            resumeUrl,
            extractedSkills: analysis.extractedSkills,
            score: analysis.score,
            strengths: analysis.strengths,
            gaps: analysis.gaps,
            suggestions: analysis.suggestions,
            analyzedAt: new Date(),
        };

        await firestoreService.setDocument("resumeAnalyses", analysisId, analysisDoc);
        return successResponse(res, 200, "Resume analysed", analysisDoc);
    } catch (err) {
        next(err);
    }
};

// ── Analysis History ──────────────────────────────────────────────────────────
exports.getAnalysisHistory = async (req, res, next) => {
    try {
        const { db } = require("../config/firebase");
        const snapshot = await db
            .collection("resumeAnalyses")
            .where("userId", "==", req.user.uid)
            .orderBy("analyzedAt", "desc")
            .limit(10)
            .get();

        const history = snapshot.docs.map((d) => d.data());
        return successResponse(res, 200, "Analysis history fetched", history);
    } catch (err) {
        next(err);
    }
};
