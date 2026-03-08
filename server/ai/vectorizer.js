/**
 * ai/vectorizer.js
 * TF-IDF vectorization utility for AI modules.
 * Converts a set of text documents into frequency-weighted vectors.
 */

"use strict";

/**
 * Tokenise and clean text into lowercase words, stripping punctuation and stopwords.
 * @param {string} text
 * @returns {string[]}
 */
const STOPWORDS = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "up", "about", "into", "through", "during", "is", "was", "are", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "not", "i", "we", "you", "he", "she",
    "they", "it", "this", "that", "these", "those", "my", "our", "your", "his", "her", "its",
    "their", "which", "who", "what", "when", "where", "how", "if", "then", "than", "so",
]);

const tokenize = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s+#.]/g, " ")   // keep C++, C#, .NET etc.
        .split(/\s+/)
        .filter((w) => w.length > 1 && !STOPWORDS.has(w));
};

/**
 * Compute term-frequency map for a single document.
 * @param {string[]} tokens
 * @returns {Map<string, number>}
 */
const termFrequency = (tokens) => {
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    return tf;
};

/**
 * Build TF-IDF vectors for a corpus of documents.
 * Each vector is a plain object { term: tfidf_score, ... }.
 * @param {string[]} documents - Array of raw text strings
 * @returns {object[]}
 */
const buildTfIdfVectors = (documents) => {
    const tokenized = documents.map(tokenize);

    // Compute IDF: log(totalDocs / docsContainingTerm + 1) + 1
    const idf = new Map();
    const N = documents.length;
    for (const tokens of tokenized) {
        for (const term of new Set(tokens)) {
            idf.set(term, (idf.get(term) || 0) + 1);
        }
    }
    for (const [term, df] of idf) {
        idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
    }

    // Build TF-IDF vector for each document
    return tokenized.map((tokens) => {
        const tf = termFrequency(tokens);
        const vector = {};
        for (const [term, freq] of tf) {
            vector[term] = (freq / tokens.length) * (idf.get(term) || 1);
        }
        return vector;
    });
};

/**
 * Compute cosine similarity between two sparse vectors (plain objects).
 * @returns {number} 0.0 – 1.0
 */
const cosineSimilarity = (vecA, vecB) => {
    const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (const t of allTerms) {
        const a = vecA[t] || 0;
        const b = vecB[t] || 0;
        dot += a * b;
        magA += a * a;
        magB += b * b;
    }

    const denominator = Math.sqrt(magA) * Math.sqrt(magB);
    return denominator === 0 ? 0 : dot / denominator;
};

module.exports = { tokenize, buildTfIdfVectors, cosineSimilarity };
