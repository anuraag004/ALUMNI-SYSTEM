/**
 * ai/resumeParser.js
 * Extracts structured data (skills, education, experience) from raw PDF text.
 * Uses the `compromise` NLP library for entity recognition.
 */

"use strict";

const nlp = require("compromise");

// ── Known skill keyword bank ──────────────────────────────────────────────────
const TECH_SKILLS = new Set([
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin",
    "react", "angular", "vue", "nextjs", "nodejs", "express", "django", "flask", "spring", "fastapi",
    "mongodb", "postgresql", "mysql", "sqlite", "firebase", "dynamodb", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ansible", "jenkins", "github actions",
    "html", "css", "tailwind", "bootstrap", "graphql", "rest", "grpc", "websocket", "socket.io",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "nlp", "machine learning", "deep learning",
    "git", "linux", "agile", "scrum", "ci/cd", "microservices", "sql", "nosql",
]);

const SOFT_SKILLS = new Set([
    "leadership", "communication", "teamwork", "problem-solving", "critical thinking",
    "time management", "collaboration", "adaptability", "creativity", "mentoring",
]);

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const checkSkillMatch = (text, skill) => {
    const escaped = escapeRegExp(skill);
    // Matches the skill if surrounded by non-alphanumeric chars or boundaries
    const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
};

/**
 * Pull all skill keywords present in the resume text.
 * @param {string} text - Raw text extracted from PDF
 * @returns {string[]} deduplicated list of matched skills
 */
const extractSkills = (text) => {
    const lower = text.toLowerCase();
    const found = new Set();

    for (const skill of TECH_SKILLS) {
        if (checkSkillMatch(lower, skill)) found.add(skill);
    }
    for (const skill of SOFT_SKILLS) {
        if (checkSkillMatch(lower, skill)) found.add(skill);
    }

    return Array.from(found);
};

/**
 * Heuristically extract education entries (degree lines).
 * Looks for lines containing known degree keywords.
 * @param {string} text
 * @returns {string[]}
 */
const extractEducation = (text) => {
    const degreeKeywords = /\b(b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|bachelor|master|phd|doctorate|mba|bca|mca)\b/gi;
    const lines = text.split("\n").filter((l) => l.trim().length > 5);
    const education = lines
        .filter((line) => degreeKeywords.test(line))
        .map((l) => l.trim())
        .slice(0, 5);
    return education;
};

/**
 * Extract sections of text likely to be experience blocks.
 * @param {string} text
 * @returns {string[]}
 */
const extractExperienceEntities = (text) => {
    const doc = nlp(text);
    const organizations = doc.organizations().out("array");
    const roles = doc.match("#Noun+ (developer|engineer|analyst|manager|intern|lead|architect|designer)").out("array");
    return { organizations: [...new Set(organizations)], roles: [...new Set(roles)] };
};

module.exports = { extractSkills, extractEducation, extractExperienceEntities };
