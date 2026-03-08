/**
 * services/firestore.service.js
 * Generic CRUD helpers for Firestore to keep controllers clean.
 */

const { db } = require("../config/firebase");

/**
 * Get a single document.
 * @returns {object|null} document data or null if not found
 */
const getDocument = async (collection, id) => {
    const doc = await db.collection(collection).doc(id).get();
    return doc.exists ? doc.data() : null;
};

/**
 * Create or fully overwrite a document (upsert).
 */
const setDocument = async (collection, id, data) => {
    await db.collection(collection).doc(id).set(data);
    return data;
};

/**
 * Partial update a document (merge).
 */
const updateDocument = async (collection, id, data) => {
    await db.collection(collection).doc(id).update(data);
};

/**
 * Delete a document.
 */
const deleteDocument = async (collection, id) => {
    await db.collection(collection).doc(id).delete();
};

/**
 * Query a collection with simple equality conditions.
 * @param {string} collection
 * @param {Array<[field, op, value]>} conditions - e.g. [['role','==','alumni']]
 * @param {{ orderBy?: string, direction?: string, limit?: number }} options
 * @returns {Array<object>}
 */
const queryCollection = async (collection, conditions = [], options = {}) => {
    let ref = db.collection(collection);
    for (const [field, op, value] of conditions) {
        ref = ref.where(field, op, value);
    }
    if (options.orderBy) ref = ref.orderBy(options.orderBy, options.direction || "asc");
    if (options.limit) ref = ref.limit(options.limit);

    const snapshot = await ref.get();
    return snapshot.docs.map((d) => d.data());
};

/**
 * Run a Firestore transaction.
 */
const runTransaction = async (updateFn) => {
    return db.runTransaction(updateFn);
};

module.exports = {
    getDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    queryCollection,
    runTransaction,
};
