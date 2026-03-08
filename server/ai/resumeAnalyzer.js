/**
 * ai/resumeAnalyzer.js
 * Scores a resume with NLP and provides a gap analysis with suggestions.
 */

"use strict";

const { extractSkills, extractEducation, extractExperienceEntities } = require("./resumeParser");

// ── Scoring weights ───────────────────────────────────────────────────────────
const SCORE_WEIGHTS = {
    skills: 50,        // 50 points max for skill breadth
    education: 20,     // 20 points for education section presence
    experience: 20,    // 20 points for experience/company mentions
    length: 10,        // 10 points for resume length (word count)
};

// ── Common skills required by most tech jobs (used for gap analysis)
const BASELINE_SKILLS = [
    "git", "communication", "problem-solving", "python", "javascript", "sql",
    "teamwork", "linux", "agile", "rest",
];

/**
 * Analyse raw resume text and return a structured report.
 * @param {string} rawText
 * @returns {Promise<object>}
 */
const analyze = async (rawText) => {
    const extractedSkills = extractSkills(rawText);
    const education = extractEducation(rawText);
    const { organizations, roles } = extractExperienceEntities(rawText);

    // ── Compute score ──────────────────────────────────────────────────────────
    const wordCount = rawText.split(/\s+/).length;

    let score = 0;

    // Skills: 2 points per skill, cap at 50
    const skillScore = Math.min(extractedSkills.length * 2, SCORE_WEIGHTS.skills);
    score += skillScore;

    // Education: full 20 if at least one entry found
    const educationScore = education.length > 0 ? SCORE_WEIGHTS.education : 5;
    score += educationScore;

    // Experience: 5 points per company/role found, cap at 20
    const expScore = Math.min((organizations.length + roles.length) * 3, SCORE_WEIGHTS.experience);
    score += expScore;

    // Length: ideal is 400–800 words
    let lengthScore = 0;
    if (wordCount >= 400 && wordCount <= 800) lengthScore = 10;
    else if (wordCount >= 200) lengthScore = 5;
    score += lengthScore;

    // ── Strengths ──────────────────────────────────────────────────────────────
    const strengths = [];
    if (extractedSkills.length >= 8) strengths.push("Strong technical skill set");
    if (education.length > 0) strengths.push("Educational background clearly stated");
    if (organizations.length >= 2) strengths.push("Multiple work experiences mentioned");
    if (wordCount >= 400 && wordCount <= 800) strengths.push("Resume is well-sized and concise");

    // ── Gaps ──────────────────────────────────────────────────────────────────
    const skillSet = new Set(extractedSkills);
    const gaps = BASELINE_SKILLS.filter((s) => !skillSet.has(s));

    // ── Suggestions ───────────────────────────────────────────────────────────
    const suggestions = [];
    if (gaps.length > 0) {
        suggestions.push(`Consider adding these baseline skills if applicable: ${gaps.slice(0, 5).join(", ")}`);
    }
    if (education.length === 0) {
        suggestions.push("Add your educational qualifications clearly");
    }
    if (wordCount < 300) {
        suggestions.push("Your resume seems short. Expand on your experience and projects");
    }
    if (wordCount > 900) {
        suggestions.push("Consider condensing your resume to 1–2 pages for better readability");
    }
    if (organizations.length === 0) {
        suggestions.push("Include company names and job titles to highlight your work history");
    }
    if (extractedSkills.length < 5) {
        suggestions.push("Add a dedicated Skills section listing your technical and soft skills");
    }

    return {
        extractedSkills,
        education,
        experience: { organizations, roles },
        score: Math.min(Math.round(score), 100),
        strengths,
        gaps,
        suggestions,
        wordCount,
    };
};

module.exports = { analyze };
