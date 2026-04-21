/**
 * ai/mentorRecommender.js
 * Recommends the top-N available alumni mentors for a given student profile
 * using TF-IDF vectorization + cosine similarity.
 */

"use strict";

const { db } = require("../config/firebase");
const { buildTfIdfVectors, cosineSimilarity } = require("./vectorizer");

/**
 * Convert a user profile into a single text document for vectorization.
 * Concatenates skills, department, bio, and role to create a rich representation.
 * @param {object} profile
 * @returns {string}
 */
const profileToText = (profile) => {
    const parts = [
        profile.skills?.join(" ") || "",
        profile.department || "",
        profile.bio || "",
        profile.currentRole || "",
        profile.currentCompany || "",
    ];
    return parts.join(" ").toLowerCase();
};

/**
 * Recommend top mentors for a student.
 * @param {object} studentProfile - Firestore user document for the student
 * @param {number} topN - Number of recommendations to return (default 5)
 * @returns {Promise<Array<{ mentor: object, matchScore: number }>>}
 */
const recommend = async (studentProfile, topN = 5) => {
    // Fetch alumni (Verification & Availability filters commented out for testing)
    const snapshot = await db
        .collection("users")
        .where("role", "==", "alumni")
        // .where("isVerified", "==", true)
        // .where("isMentorAvailable", "==", true)
        .get();

    const mentors = snapshot.docs.map((d) => d.data());

    if (mentors.length === 0) {
        return [];
    }

    // Build corpus: [studentDoc, mentor1Doc, mentor2Doc, ...]
    const corpus = [studentProfile, ...mentors].map(profileToText);
    const vectors = buildTfIdfVectors(corpus);

    const studentVector = vectors[0];
    const mentorVectors = vectors.slice(1);

    // Score each mentor
    const scored = mentors.map((mentor, i) => ({
        mentor: {
            uid: mentor.uid,
            displayName: mentor.displayName,
            photoURL: mentor.photoURL,
            currentRole: mentor.currentRole,
            currentCompany: mentor.currentCompany,
            department: mentor.department,
            skills: mentor.skills,
            bio: mentor.bio,
            linkedIn: mentor.linkedIn,
        },
        matchScore: parseFloat((cosineSimilarity(studentVector, mentorVectors[i]) * 100).toFixed(1)),
    }));

    // Sort descending by match score and return top N
    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, topN);
};

module.exports = { recommend };
